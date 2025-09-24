import dbConnect from '../../../../lib/mongodb';
import Story from '../../../../models/Story';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const story = await Story.findById(params.id);
  if (!story) return new Response('Not found', { status: 404 });
  return Response.json(story);
}