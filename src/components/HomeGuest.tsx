import Link from 'next/link';

export default function HomeGuest() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center text-center p-8 text-black">
      <h2 className="text-4xl font-bold mb-4">Write and Share Your Stories</h2>
      <p className="text-lg mb-8">Join our community of writers and readers.</p>
      <div className="space-x-4">
        <Link
          href="/sign-in"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Sign Up
        </Link>
      </div>
    </main>
  );
}
