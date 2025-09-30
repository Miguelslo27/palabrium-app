"use client";

import { useState, useEffect } from 'react';
import getClientUserId from '@/lib/getClientUserId';

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
}

interface CommentsProps {
  storyId: string;
}

export default function Comments({ storyId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/stories/${storyId}/comments`);
      if (!res.ok) throw new Error('Failed to load comments');
      const data = await res.json();
      setComments(data);
    } catch (e: any) {
      setError(e?.message || 'Error loading comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userId = await getClientUserId();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (userId) headers['x-user-id'] = userId;

      const res = await fetch(`/api/stories/${storyId}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content: newComment }),
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error('Unauthorized');
        throw new Error('Failed to post comment');
      }
      setNewComment('');
      await fetchComments();
    } catch (e: any) {
      setError(e?.message || 'Error posting comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Comments</h3>
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Add a comment..."
          required
        />
        <div className="mt-2 flex items-center gap-3">
          <button type="submit" disabled={loading} className="bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded">
            {loading ? 'Sending…' : 'Comment'}
          </button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
      {loading && comments.length === 0 ? (
        <div className="text-sm text-gray-500">Loading comments…</div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="p-4 border rounded">
              <p>{comment.content}</p>
              <small className="text-gray-500">{new Date(comment.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}