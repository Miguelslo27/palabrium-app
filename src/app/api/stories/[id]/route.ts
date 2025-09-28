import dbConnect from '@/lib/mongodb';
import Story from '@/models/Story';
import Chapter from '@/models/Chapter';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  const story = await Story.findById(id);
  if (!story) return new Response('Not found', { status: 404 });
  return Response.json(story);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  // Temporary header-based auth: expect x-user-id to contain the current user id
  const userId = req.headers.get('x-user-id');
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { id } = await params;
  const story = await Story.findById(id);
  if (!story) return new Response('Story not found', { status: 404 });

  if (story.authorId !== userId) return new Response('Forbidden', { status: 403 });

  // Delete chapters belonging to this story to keep DB consistent
  await Chapter.deleteMany({ storyId: id });
  await story.deleteOne();
  return new Response('Story deleted', { status: 200 });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const userId = req.headers.get('x-user-id');
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { id } = await params;
  const story = await Story.findById(id);
  if (!story) return new Response('Story not found', { status: 404 });
  if (story.authorId !== userId) return new Response('Forbidden', { status: 403 });

  const body = await req.json();
  const { title, description, published } = body;
  if (typeof title === 'string') story.title = title;
  if (typeof description === 'string') story.description = description;
  if (typeof published === 'boolean') story.published = published;
  await story.save();
  return Response.json(story);
}