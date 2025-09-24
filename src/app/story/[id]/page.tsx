import { notFound } from 'next/navigation';

interface Story {
  _id: string;
  title: string;
  description: string;
  chapters: { title: string; content: string }[];
}

async function getStory(id: string): Promise<Story | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stories/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function StoryPage({ params }: { params: { id: string } }) {
  const story = await getStory(params.id);
  if (!story) notFound();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4">{story.title}</h1>
      <p className="text-lg mb-8">{story.description}</p>
      {story.chapters.map((chapter, index) => (
        <div key={index} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{chapter.title}</h2>
          <p className="whitespace-pre-wrap">{chapter.content}</p>
        </div>
      ))}
    </div>
  );
}