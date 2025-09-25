import dbConnect from '../../../../lib/mongodb';
import Story from '../../../../models/Story';

export async function GET(req: Request) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return new Response('Unauthorized', { status: 401 });

  await dbConnect();
  const stories = await Story.find({ authorId: userId }).sort({ createdAt: -1 });
  return Response.json(stories);
}