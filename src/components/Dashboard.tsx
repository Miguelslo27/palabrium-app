import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';

export default async function Dashboard() {
  const user = await currentUser();

  return (
    <div className="flex-1 p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to your Dashboard, {user?.firstName}!</h1>
      <div className="space-y-4">
        <Link href="/create-story" className="block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Create New Story
        </Link>
        <Link href="/my-stories" className="block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          My Stories
        </Link>
        <Link href="/explore" className="block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
          Explore Stories
        </Link>
      </div>
    </div>
  );
}