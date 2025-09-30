import dbConnect from '@/lib/mongodb';
import Chapter from '@/models/Chapter';
import Story from '@/models/Story';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const userId = req.headers.get('x-user-id');
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { id } = await params;
  const chapter = await Chapter.findById(id);
  if (!chapter) return new Response('Chapter not found', { status: 404 });

  const story = await Story.findById(chapter.storyId);
  if (!story) return new Response('Story not found', { status: 404 });
  if (String(story.authorId) !== String(userId)) return new Response('Forbidden', { status: 403 });

  try {
    const body = await req.json();
    const published = typeof body.published === 'boolean' ? body.published : undefined;
    if (typeof published !== 'boolean') return new Response('Bad Request', { status: 400 });

    chapter.published = published;
    chapter.publishedAt = published ? new Date() : null;
    chapter.unPublishedAt = !published ? new Date() : null;
    chapter.publishedBy = published ? String(userId) : null;
    chapter.unPublishedBy = !published ? String(userId) : null;
    await chapter.save();
    return Response.json({ ok: true, id: chapter._id, published: chapter.published });
  } catch (err) {
    console.error('Error toggling chapter published', err);
    return new Response('Error updating chapter', { status: 500 });
  }
}
