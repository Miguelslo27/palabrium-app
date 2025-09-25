import dbConnect from '@/lib/mongodb';
import Comment from '@/models/Comment';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  const comments = await Comment.find({ storyId: id }).sort({ createdAt: -1 });
  return Response.json(comments);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const userId = req.headers.get('x-user-id');
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { id } = await params;
  const { content } = await req.json();
  const comment = new Comment({
    storyId: id,
    authorId: userId,
    content,
  });

  await comment.save();
  return Response.json(comment);
}