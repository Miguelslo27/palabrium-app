'use client';

import { useState } from 'react';

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
    setError('Login not implemented yet');
  };

  return (
    <div className="h-full w-full bg-red-50 p-8 flex flex-col justify-center">
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
      <p className="mt-6 text-blue-600 hover:text-blue-800">
        <a href="/sign-in">Already have an account? Sign in</a>
      </p>
      {/* Debug panel removed from component; debug is shown in the left column of the sign-up page (dev only) */}
    </div>
  );
}