'use client';

import { useSignIn } from '@clerk/nextjs';
import { useState } from 'react';

export default function CustomSignIn() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogle = () => {
    if (signIn) signIn.authenticateWithRedirect({ strategy: 'oauth_google', redirectUrl: '/dashboard', redirectUrlComplete: '/dashboard' });
  };

  const handleFacebook = () => {
    if (signIn) signIn.authenticateWithRedirect({ strategy: 'oauth_facebook', redirectUrl: '/dashboard', redirectUrlComplete: '/dashboard' });
  };

  const handleMicrosoft = () => {
    if (signIn) signIn.authenticateWithRedirect({ strategy: 'oauth_microsoft', redirectUrl: '/dashboard', redirectUrlComplete: '/dashboard' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;
    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });
      if (result.status === 'complete' && setActive) {
        await setActive({ session: result.createdSessionId });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full bg-red-50 p-8 flex flex-col justify-center">
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
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition"
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