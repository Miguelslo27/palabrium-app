import { notFound } from 'next/navigation';
import LikeButton from '@/components/LikeButton';
import Comments from '@/components/Comments';
import Navbar from '@/components/Navbar';

interface Story {
  _id: string;
  title: string;
  description: string;
  chapters: { title: string; content: string }[];
  likes: string[];
}

async function getStory(id: string): Promise<Story | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stories/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const story = await getStory(id);
  if (!story) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-4">{story.title}</h1>
        <p className="text-lg mb-8">{story.description}</p>
        <LikeButton storyId={story._id} initialLikes={story.likes.length} userLikes={story.likes} />
        {story.chapters.map((chapter, index) => (
          <div key={index} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{chapter.title}</h2>
            <p className="whitespace-pre-wrap">{chapter.content}</p>
          </div>
        ))}
        <Comments storyId={story._id} />
      </div>
    </div>
  );
}