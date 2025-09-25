import dbConnect from '../../../lib/mongodb';
import Story from '../../../models/Story';

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

  const { title, description, chapters } = await req.json();

  const story = new Story({
    title,
    description,
    authorId: userId,
    chapters,
    published: true,
  });

  try {
    await story.save();
    if (process.env.NODE_ENV !== 'production') console.log('Story saved:', story._id);
    return Response.json({ message: 'Story created', id: story._id });
  } catch (error) {
    console.error('Error saving story:', error);
    return new Response('Error creating story', { status: 500 });
  }
}