'use client';

import { useState } from 'react';

interface LikeButtonProps {
  storyId: string;
  initialLikes: number;
  userLikes: string[];
}

export default function LikeButton({ storyId, initialLikes, userLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  // We don't have a real user system here; try to detect an injected user id (optional)
  const userId = typeof window !== 'undefined' ? (window as any).__USER_ID__ : null;
  const [liked, setLiked] = useState(userLikes.includes(userId || ''));

  const handleLike = async () => {
    const res = await fetch(`/api/stories/${storyId}/like`, {
      method: 'POST',
      headers: userId ? { 'x-user-id': userId } : {},
    });
    const data = await res.json();
    setLikes(data.likes);
    setLiked(data.liked);
  };

  return (
    <button
      onClick={handleLike}
      className={`px-4 py-2 rounded ${liked ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
    >
      {liked ? 'Unlike' : 'Like'} ({likes})
    </button>
  );
}