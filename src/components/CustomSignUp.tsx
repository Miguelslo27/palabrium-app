"use client";

import { useState } from 'react';
import getClerkClient from '../lib/clerk-client';
import { useRouter } from 'next/navigation';

export default function CustomSignUp({ onDebug }: { onDebug?: (d: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugResult, setDebugResult] = useState<any>(null);
  const [debugError, setDebugError] = useState<any>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogle = () => {
    setError('Social sign-up removed (no auth provider)');
  };

  const handleFacebook = () => {
    setError('Social sign-up removed (no auth provider)');
  };

  const handleMicrosoft = () => {
    setError('Social sign-up removed (no auth provider)');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDebugError(null);
    setDebugResult(null);
    try {
      // Prefer client-side Clerk sign-up flow: create SignUp -> attemptFirstFactor -> setActive
      try {
        const clerk: any = getClerkClient();
        await clerk.load();

        // Create a signUp instance (password strategy)
        const signUp = await clerk.signUp.create({ strategy: 'password', identifier: email });

        // Attempt first factor (password)
        const attempt = await signUp.attemptFirstFactor({ strategy: 'password', password });

        if (attempt.status === 'complete' && attempt.createdSessionId) {
          await clerk.setActive({ session: attempt.createdSessionId });
          setDebugResult({ message: 'Signup complete', sessionId: attempt.createdSessionId });
          setResendStatus('Signup successful — you are signed in');
          router.push('/');
          return;
        }

        // If not complete, fall through to server fallback
        setDebugResult({ message: 'Signup requires additional verification', attempt });
      } catch (clientErr) {
        // Client-side flow failed; fallback to server endpoint
        console.warn('Client-side Clerk sign-up failed, falling back to server endpoint', clientErr);
        const res = await fetch('/api/local-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, firstName, lastName }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data?.message || 'Signup failed');
          setDebugError(data);
        } else {
          setDebugResult(data);
          setResendStatus('Signup successful — check your email if verification is required');
        }
      }
    } catch (err) {
      setError('Network error');
      setDebugError(err);
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
      <h1 className="text-4xl font-bold text-gray-800 text-center mb-8 flex-none">Sign Up</h1>
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
        <span className="px-4 text-gray-600">Or sign up with email</span>
        <hr className="flex-1 border-gray-300" />
      </div>
      <form onSubmit={handleSubmit} className="flex-none space-y-6">
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div>
          <label className="block text-lg font-medium text-gray-900 mb-2">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-3 text-lg text-gray-900 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-900 mb-2">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-3 text-lg text-gray-900 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>
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
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
      {resendStatus && <p className="mt-4 text-green-600">{resendStatus}</p>}
      {debugResult && (
        <pre className="mt-4 text-xs text-gray-700 bg-white p-2 rounded">{JSON.stringify(debugResult, null, 2)}</pre>
      )}
      {debugError && (
        <pre className="mt-4 text-xs text-red-700 bg-white p-2 rounded">{JSON.stringify(debugError, null, 2)}</pre>
      )}
      <p className="mt-6 text-blue-600 hover:text-blue-800">
        <a href="/sign-in">Already have an account? Sign in</a>
      </p>
      {/* Debug panel removed from component; debug is shown in the left column of the sign-up page (dev only) */}
    </div>
  );
}