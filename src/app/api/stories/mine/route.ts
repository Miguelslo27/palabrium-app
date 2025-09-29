import dbConnect from '../../../../lib/mongodb';
import Story from '../../../../models/Story';

export async function GET(req: Request) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return new Response('Unauthorized', { status: 401 });

  await dbConnect();

  const url = new URL(req.url);
  const skipParam = url.searchParams.get('skip') || '0';
  const limitParam = url.searchParams.get('limit') || '50';

  let skip = parseInt(skipParam, 10);
  let limit = parseInt(limitParam, 10);
  if (Number.isNaN(skip) || skip < 0) skip = 0;
  if (Number.isNaN(limit) || limit <= 0) limit = 50;
  limit = Math.min(limit, 50);

  try {
    const filter = { authorId: userId } as any;
    const total = await Story.countDocuments(filter);
    const items = await Story.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit);
    return Response.json({ items, total, skip, limit });
  } catch (err) {
    console.error('Error fetching user stories with pagination', err);
    return new Response('Error fetching stories', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return new Response('Unauthorized', { status: 401 });

  await dbConnect();
  try {
    const result = await Story.deleteMany({ authorId: userId });
    return Response.json({ deletedCount: result.deletedCount });
  } catch (err) {
    console.error('Error deleting stories for user', userId, err);
    return new Response('Error deleting stories', { status: 500 });
  }
}