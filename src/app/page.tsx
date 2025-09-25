import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';

export default async function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="w-full flex justify-between items-center p-4 bg-gray-800 text-white shadow">
        <h1 className="text-2xl font-bold">Palabrium</h1>
        <nav className="flex space-x-4">
          <SignedIn>
            <Link href="/stories/mine" className="hover:underline">Mis Historias</Link>
            <Link href="/stories" className="hover:underline">Explorar</Link>
            <UserButton />
          </SignedIn>
        </nav>
      </header>
      <SignedOut>
        <main className="flex-1 flex flex-col items-center justify-center text-center p-8 text-black">
          <h2 className="text-4xl font-bold mb-4">Write and Share Your Stories</h2>
          <p className="text-lg mb-8">Join our community of writers and readers.</p>
          <div className="space-x-4">
            <Link href="/sign-in" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Sign In
            </Link>
            <Link href="/sign-up" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Sign Up
            </Link>
          </div>
        </main>
      </SignedOut>
      <SignedIn>
        <Dashboard />
      </SignedIn>
    </div>
  );
}
