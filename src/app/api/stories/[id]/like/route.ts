import dbConnect from '@/lib/mongodb';
import Story from '@/models/Story';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const userId = req.headers.get('x-user-id');
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { id } = await params;
  const story = await Story.findById(id);
  if (!story) return new Response('Not found', { status: 404 });

  const userIndex = story.likes.indexOf(userId);
  if (userIndex > -1) {
    story.likes.splice(userIndex, 1); // unlike
  } else {
    story.likes.push(userId); // like
  }

  await story.save();
  return Response.json({ likes: story.likes.length, liked: userIndex === -1 });
}