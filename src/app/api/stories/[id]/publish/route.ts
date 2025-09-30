import dbConnect from '@/lib/mongodb';
import Story from '@/models/Story';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const userId = req.headers.get('x-user-id');
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { id } = await params;
  const story = await Story.findById(id);
  if (!story) return new Response('Story not found', { status: 404 });
  if (String(story.authorId) !== String(userId)) return new Response('Forbidden', { status: 403 });

  try {
    const body = await req.json();
    const published = typeof body.published === 'boolean' ? body.published : undefined;
    if (typeof published !== 'boolean') return new Response('Bad Request', { status: 400 });

    story.published = published;
    story.publishedAt = published ? new Date() : null;
    story.unPublishedAt = !published ? new Date() : null;
    story.publishedBy = published ? String(userId) : null;
    story.unPublishedBy = !published ? String(userId) : null;
    await story.save();
    return Response.json({ ok: true, id: story._id, published: story.published });
  } catch (err) {
    console.error('Error toggling published', err);
    return new Response('Error updating story', { status: 500 });
  }
}
