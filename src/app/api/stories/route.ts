import dbConnect from '../../../lib/mongodb';
import Story from '../../../models/Story';
import Chapter from '../../../models/Chapter';

export async function GET(req: Request) {
  await dbConnect();

  const url = new URL(req.url);
  const skipParam = url.searchParams.get('skip') || '0';
  const limitParam = url.searchParams.get('limit') || '50';
  const q = url.searchParams.get('q') || '';

  let skip = parseInt(skipParam, 10);
  let limit = parseInt(limitParam, 10);
  if (Number.isNaN(skip) || skip < 0) skip = 0;
  if (Number.isNaN(limit) || limit <= 0) limit = 50;
  // enforce maximum batch size of 50
  limit = Math.min(limit, 50);

  // build filter (published + optional search)
  const filter: any = { published: true };
  if (q && q.trim()) {
    // simple text search on title/description
    const re = new RegExp(q.trim(), 'i');
    filter.$or = [{ title: re }, { description: re }];
  }

  try {
    const total = await Story.countDocuments(filter);
    const items = await Story.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit);
    return Response.json({ items, total, skip, limit });
  } catch (err) {
    console.error('Error fetching stories with pagination', err);
    return new Response('Error fetching stories', { status: 500 });
  }
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