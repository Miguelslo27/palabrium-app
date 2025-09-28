"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import getClerkClient from '@/lib/clerk-client';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const clerk: any = getClerkClient();
      try {
        await clerk.load();
        if (mounted) setUser(clerk.user || null);
        // Listen for auth changes
        const unsub = clerk.addListener((ev: any) => {
          if (mounted) setUser(ev.user || null);
        });
        return () => unsub && unsub();
      } catch (err) {
        console.error('Navbar clerk load error', err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const clerk: any = getClerkClient();
      await clerk.signOut();
      router.push('/');
    } catch (err) {
      console.error('sign out error', err);
    }
  };

  return (
    <header className="w-full flex justify-between items-center p-4 bg-gray-800 text-white shadow">
      <Link href="/" className="text-2xl font-bold hover:underline">Palabrium</Link>
      <nav className="flex space-x-4">
        {user ? (
          <>
            <Link href="/stories/mine" className="hover:underline">My Stories</Link>
            <Link href="/stories" className="hover:underline">Explore</Link>
            <button onClick={handleSignOut} className="hover:underline">Logout</button>
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