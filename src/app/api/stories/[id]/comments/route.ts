import dbConnect from '@/lib/mongodb';
import Comment from '@/models/Comment';
import clerkClient from '@/lib/clerk';
import { CommentRequestBody, UserInfo, EnrichedComment, RawCommentLean } from '@/types/api';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  // use lean() for plain objects
  const comments = await Comment.find({ storyId: id }).sort({ createdAt: -1 }).lean<RawCommentLean[]>();

  // collect unique author ids
  const authorIds = Array.from(new Set(comments.map((c) => c.authorId)));
  const userMap: Record<string, UserInfo> = {};

  for (const aId of authorIds) {
    try {
      const u = await clerkClient.users.getUser(aId);
      const name = (u?.firstName || u?.lastName) ? `${u?.firstName || ''} ${u?.lastName || ''}`.trim() : (u?.fullName || u?.primaryEmailAddress?.emailAddress || null);
      const image = u?.imageUrl || null;
      userMap[aId] = { name, image };
    } catch {
      userMap[aId] = { name: null, image: null };
    }
  }

  const enriched: EnrichedComment[] = comments.map((c) => ({
    _id: String(c._id),
    storyId: String(c.storyId),
    authorId: c.authorId,
    content: c.content,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt || c.createdAt,
    authorName: userMap[c.authorId]?.name || null,
    authorImage: userMap[c.authorId]?.image || null,
  }));

  return Response.json(enriched);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const userId = req.headers.get('x-user-id');
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { id } = await params;
  const { content }: CommentRequestBody = await req.json();
  const comment = new Comment({
    storyId: id,
    authorId: userId,
    content,
  });

  await comment.save();
  return Response.json(comment);
}