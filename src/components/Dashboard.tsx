import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-100 p-8">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Welcome to your Dashboard!</h1>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Link href="/story/new" className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-flex items-center justify-center">
            Create New Story
          </Link>
          <Link href="/stories/mine" className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition inline-flex items-center justify-center">
            My Stories
          </Link>
          <Link href="/stories" className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition inline-flex items-center justify-center">
            Explore Stories
          </Link>
        </div>
      </div>
    </div>
  );
}
