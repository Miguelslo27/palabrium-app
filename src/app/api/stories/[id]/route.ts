import dbConnect from '@/lib/mongodb';
import Story from '@/models/Story';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  const story = await Story.findById(id);
  if (!story) return new Response('Not found', { status: 404 });
  return Response.json(story);
}