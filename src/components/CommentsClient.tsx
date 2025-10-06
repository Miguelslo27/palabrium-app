'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { addCommentAction, deleteCommentAction } from '@/app/actions';

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorName?: string | null;
  authorImage?: string | null;
}

interface CommentsClientProps {
  storyId: string;
  initialComments: Comment[];
  userId: string | null;
}

export default function CommentsClient({ storyId, initialComments, userId }: CommentsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Optimistic state for comments
  const [optimisticComments, setOptimisticComments] = useState<Comment[]>(initialComments);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newComment.trim()) return;

    const trimmedComment = newComment.trim();

    // Create optimistic comment
    const optimisticComment: Comment = {
      _id: `temp-${Date.now()}`,
      content: trimmedComment,
      createdAt: new Date().toISOString(),
      authorId: userId,
      authorName: 'You',
      authorImage: null,
    };

    // Add optimistic comment to UI
    setOptimisticComments([optimisticComment, ...optimisticComments]);
    setNewComment('');
    setError(null);

    startTransition(async () => {
      try {
        await addCommentAction(storyId, trimmedComment);

        // Refresh to get real data from server
        router.refresh();
      } catch (error) {
        console.error('Add comment error', error);
        setError('Error posting comment. Please try again.');
        // Revert optimistic update on error
        setOptimisticComments(initialComments);
        setNewComment(trimmedComment);
      }
    });
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    // Remove optimistically
    const previousComments = optimisticComments;
    setOptimisticComments(optimisticComments.filter(c => c._id !== commentId));
    setError(null);

    startTransition(async () => {
      try {
        await deleteCommentAction(commentId, storyId);

        // Refresh to get real data from server
        router.refresh();
      } catch (error) {
        console.error('Delete comment error', error);
        setError('Error deleting comment. Please try again.');
        // Revert optimistic update on error
        setOptimisticComments(previousComments);
      }
    });
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Comments</h3>

      {userId ? (
        <form onSubmit={handleSubmit} className="mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Add a comment..."
            required
            disabled={isPending}
          />
          <div className="mt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending || !newComment.trim()}
              className="bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded"
            >
              {isPending ? 'Sending…' : 'Comment'}
            </button>
            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>
        </form>
      ) : (
        <div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200 text-sm text-gray-600">
          Sign in to leave a comment
        </div>
      )}

      <div className="space-y-4">
        {optimisticComments.length === 0 ? (
          <div className="text-sm text-gray-500">No comments yet. Be the first!</div>
        ) : (
          optimisticComments.map((comment) => (
            <div key={comment._id} className="p-4 border rounded">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {comment.authorImage ? (
                    <Image
                      src={comment.authorImage}
                      alt={comment.authorName || 'author'}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                      {(comment.authorName && comment.authorName[0]) || '?'}
                    </div>
                  )}
                  <div className="text-sm font-medium">{comment.authorName || 'Unknown'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </div>
                  {userId === comment.authorId && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="text-xs text-red-600 hover:text-red-800"
                      disabled={isPending}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <div>
                <p>{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
