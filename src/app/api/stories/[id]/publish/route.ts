import dbConnect from '@/lib/mongodb';
import Story from '@/models/Story';
import { PublishRequestBody, PublishUpdateObject } from '@/types/api';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const userId = req.headers.get('x-user-id');
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { id } = await params;
  const story = await Story.findById(id);
  if (!story) return new Response('Story not found', { status: 404 });
  if (String(story.authorId) !== String(userId)) return new Response('Forbidden', { status: 403 });

  try {
    const body: PublishRequestBody = await req.json();
    const published = typeof body.published === 'boolean' ? body.published : undefined;
    if (typeof published !== 'boolean') return new Response('Bad Request', { status: 400 });

    const now = new Date();
    const setObj: PublishUpdateObject = {
      published: published,
      publishedAt: published ? now : null,
      publishedBy: published ? String(userId) : null,
      unPublishedAt: !published ? now : null,
      unPublishedBy: !published ? String(userId) : null,
    };

    await Story.collection.updateOne({ _id: story._id }, { $set: setObj });
    const rawDoc = await Story.collection.findOne({ _id: story._id });
    return Response.json(rawDoc);
  } catch (err) {
    console.error('Error toggling published', err);
    return new Response('Error updating story', { status: 500 });
  }
}
