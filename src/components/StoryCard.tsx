import Link from 'next/link';

interface Story {
  _id: string;
  title: string;
  description: string;
  authorId: string;
}

interface StoryCardProps {
  story: Story;
  showDelete?: boolean;
  onDelete?: (id: string) => void;
}

export default function StoryCard({ story, showDelete = false, onDelete }: StoryCardProps) {
  return (
    <div className="p-4 border rounded hover:shadow">
      <h2 className="text-xl font-semibold">
        <Link href={`/story/${story._id}`} className="text-blue-600 hover:underline">
          {story.title}
        </Link>
      </h2>
      <p className="text-gray-600">{story.description}</p>
      {showDelete && onDelete && (
        <button
          onClick={() => onDelete(story._id)}
          className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
        >
          Delete
        </button>
      )}
    </div>
  );
}