'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface LikeButtonProps {
  storyId: string;
  initialLikes: number;
  userLikes: string[];
}

export default function LikeButton({ storyId, initialLikes, userLikes }: LikeButtonProps) {
  const { user } = useUser();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(userLikes.includes(user?.id || ''));

  const handleLike = async () => {
    const res = await fetch(`/api/stories/${storyId}/like`, { method: 'POST' });
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