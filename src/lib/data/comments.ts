/**
 * Server-side data layer for Comments
 * Direct MongoDB access without API routes
 * To be used in Server Components and Server Actions only
 */

import dbConnect from '@/lib/mongodb';
import Comment from '@/models/Comment';

export interface CommentData {
  _id: string;
  storyId: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

/**
 * Get all comments for a story
 */
export async function getComments(storyId: string): Promise<CommentData[]> {
  await dbConnect();

  const comments = await Comment.find({ storyId }).sort({ createdAt: -1 }).lean();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return comments.map((comment: any) => ({
    _id: comment._id.toString(),
    storyId: comment.storyId.toString(),
    authorId: comment.authorId,
    content: comment.content,
    createdAt: comment.createdAt,
  }));
}

/**
 * Add a comment to a story
 */
export async function addComment(
  storyId: string,
  userId: string,
  content: string
): Promise<CommentData> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!content || !content.trim()) {
    throw new Error('Comment content is required');
  }

  await dbConnect();

  const comment = await Comment.create({
    storyId,
    authorId: userId,
    content: content.trim(),
  });

  return {
    ...comment.toObject(),
    _id: comment._id.toString(),
    storyId: comment.storyId.toString(),
  } as CommentData;
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string, userId: string): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  await dbConnect();

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new Error('Comment not found');
  }

  // Only the comment author can delete it
  if (comment.authorId !== userId) {
    throw new Error('Unauthorized: You can only delete your own comments');
  }

  await Comment.findByIdAndDelete(commentId);
}
