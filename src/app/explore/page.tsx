import Link from 'next/link';

interface Story {
  _id: string;
  title: string;
  description: string;
}

async function getStories(): Promise<Story[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stories`);
  if (!res.ok) return [];
  return res.json();
}

export default async function Explore() {
  const stories = await getStories();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Explore Stories</h1>
      <div className="grid gap-4">
        {stories.map((story) => (
          <div key={story._id} className="p-4 border rounded hover:shadow">
            <h2 className="text-xl font-semibold">
              <Link href={`/story/${story._id}`} className="text-blue-600 hover:underline">
                {story.title}
              </Link>
            </h2>
            <p className="text-gray-600">{story.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}