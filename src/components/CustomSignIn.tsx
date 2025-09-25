"use client";

import { useState } from 'react';
import getClerkClient from '../lib/clerk-client';
import { useRouter } from 'next/navigation';

export default function CustomSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleGoogle = () => setError('Social sign-in removed (no auth provider)');
  const handleFacebook = () => setError('Social sign-in removed (no auth provider)');
  const handleMicrosoft = () => setError('Social sign-in removed (no auth provider)');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const clerk: any = getClerkClient();
      await clerk.load();

      // Try to complete the sign-in in a single step by providing the password
      // Use clerk.signIn if available, otherwise try clerk.client.signIn (some SDK builds expose it there)
      const signInApi = (clerk && (clerk.signIn || (clerk.client && clerk.client.signIn))) as any;
      if (!signInApi || typeof signInApi.create !== 'function') {
        throw new Error('Clerk signIn API not available on client instance. Make sure @clerk/clerk-js is loaded and NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is valid.');
      }

      const signIn = await signInApi.create({ strategy: 'password', identifier: email, password });

      // If the sign-in is complete we get a createdSessionId
      if (signIn.status === 'complete' && signIn.createdSessionId) {
        await clerk.setActive({ session: signIn.createdSessionId });
        // Ensure client updates its internal state and cookies before redirecting
        await clerk.load();
        router.push('/');
      } else if (signIn.status === 'needs_first_factor' || signIn.status === 'needs_second_factor') {
        setError('Sign in requires additional verification (MFA or code).');
      } else if (signIn.status === 'needs_identifier') {
        setError('Please provide a valid identifier.');
      } else {
        setError('Sign in not completed.');
      }
    } catch (err: any) {
      console.error('Sign in error', err);
      // Clerk returns structured errors; show a helpful message
      setError(err?.message || (err?.error && err.error) || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-full w-full bg-red-50 p-8 flex flex-col justify-center">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={() => router.push('/')}
        className="absolute top-4 right-4 text-2xl text-gray-700 hover:text-gray-900 cursor-pointer bg-transparent border-0 p-0"
        style={{ lineHeight: 1 }}
      >
        ×
      </button>
      <h1 className="text-4xl font-bold text-gray-800 text-center mb-8 flex-none">Sign In</h1>
      <div className="flex justify-center space-x-4 flex-none">
        <button
          onClick={handleGoogle}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition"
        >
          Google
        </button>
        <button
          onClick={handleFacebook}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition"
        >
          Facebook
        </button>
        <button
          onClick={handleMicrosoft}
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition"
        >
          Microsoft
        </button>
      </div>
      <div className="flex items-center my-4 flex-none">
        <hr className="flex-1 border-gray-300" />
        <span className="px-4 text-gray-600">Or sign in with email</span>
        <hr className="flex-1 border-gray-300" />
      </div>
      <form onSubmit={handleSubmit} className="flex-none space-y-6">
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div>
          <label className="block text-lg font-medium text-gray-900 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 text-lg text-gray-900 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-900 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 text-lg text-gray-900 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition disabled:opacity-50"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      <p className="mt-6 text-blue-600 hover:text-blue-800">
        <a href="/sign-up">Don't have an account? Sign up</a>
      </p>
    </div>
  );
}