import dbConnect from '../../../lib/mongodb';
import Story from '../../../models/Story';
import Chapter from '../../../models/Chapter';

export async function GET() {
  await dbConnect();
  const stories = await Story.find({ published: true }).sort({ createdAt: -1 });
  return Response.json(stories);
}

export async function POST(req: Request) {
  await dbConnect();
  // Simple header-based auth: expect x-user-id header set by client/dev tools
  const userId = req.headers.get('x-user-id');
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const body = await req.json();
  const { title, description, chapters: initialChapters } = body;

  const story = new Story({
    title,
    description,
    authorId: userId,
    published: true,
  });

  try {
    await story.save();

    if (Array.isArray(initialChapters) && initialChapters.length > 0) {
      // Create Chapter documents and link to the story
      const docs = initialChapters.map((c: any, idx: number) => ({
        storyId: story._id,
        title: c.title || `Chapter ${idx + 1}`,
        content: c.content || '',
        order: typeof c.order === 'number' ? c.order : idx,
        published: !!c.published,
      }));
      await Chapter.insertMany(docs);
      story.chapterCount = docs.length;
      await story.save();
    }

    if (process.env.NODE_ENV !== 'production') console.log('Story saved:', story._id);
    return Response.json({ message: 'Story created', id: story._id });
  } catch (error) {
    console.error('Error saving story or chapters:', error);
    return new Response('Error creating story', { status: 500 });
  }
}