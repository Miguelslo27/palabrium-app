"use client";

import Link from 'next/link';
import Image from 'next/image'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user } = useUser();
  const { signOut } = useClerk()
  const router = useRouter();

  return (
    <header className="w-full flex justify-between items-center p-4 bg-gray-800 text-white shadow">
      <Link href="/" className="text-2xl font-bold hover:underline">Palabrium</Link>
      <nav className="flex space-x-4 items-center">
        {user ? (
          <>
            <Link href="/stories/mine" className="hover:underline">My Stories</Link>
            <Link href="/stories" className="hover:underline">Explore</Link>
            <button onClick={() => { signOut({ redirectUrl: '/' }) }} className="hover:underline">Logout</button>
            <button className="flex flex-1 justify-center items-center gap-2">
              <Image
                src={user.imageUrl}
                width={32}
                height={32}
                className="rounded-full"
                alt="Picture of the author"
              />
              {user.fullName}
            </button>
          </>
        ) : (
          <>
            <Link href="/stories" className="hover:underline">Explore</Link>
            <Link href="/sign-in" className="hover:underline">Sign In</Link>
            <Link href="/sign-up" className="hover:underline">Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  );
}