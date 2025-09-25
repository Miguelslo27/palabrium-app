"use client";

import { useEffect, useState } from 'react';
import getClerkClient from '../lib/clerk-client';
import Dashboard from './Dashboard';
import Link from 'next/link';

export default function HomeAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const clerk: any = getClerkClient();
      try {
        await clerk.load();
        // clerk.user may be undefined if not signed in
        if (mounted) setUser(clerk.user || null);
      } catch (err) {
        console.error('clerk load error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  if (user) {
    return <Dashboard />;
  }

  return (
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
  );
}
