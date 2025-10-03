"use client";

import { FormEvent, useState, useEffect } from 'react';
import { OAuthStrategy } from '@clerk/types'
import { useUser, useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CustomSignIn() {
  const { isLoaded, signIn, setActive } = useSignIn()

  const router = useRouter();
  const { isSignedIn } = useUser();

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const signInWith = (strategy: OAuthStrategy) => {
    if (!signIn) return Promise.reject(new Error('signIn not available'))

    return signIn
      .authenticateWithRedirect({
        strategy,
        redirectUrl: '/sign-in/sso-callback',
        redirectUrlComplete: '/',
      })
      .then((res) => {
        console.log(res)
      })
      .catch((err: unknown) => {
        // See https://clerk.com/docs/guides/development/custom-flows/error-handling
        // for more info on error handling
        console.log((err as { errors?: unknown[] }).errors)
        console.error(err, null, 2)
      })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!isLoaded) return

    // Start the sign-in process using the email and password provided
    try {
      setLoading(true);
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }: { session?: { currentTask?: unknown } }) => {
            if (session?.currentTask) {
              // Check for tasks and navigate to custom UI to help users resolve them
              // See https://clerk.com/docs/guides/development/custom-flows/overview#session-tasks
              console.log(session?.currentTask)
              return
            }
            setLoading(true);
            router.push('/')
          },
        })
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        setLoading(true);
        setError('Something went wrong. Try again.')
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err: unknown) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      setLoading(false);
      try {
        const errorData = err as { errors?: Array<{ message: string }> };
        setError(errorData.errors?.flatMap((er) => er.message).join(', ') || 'Unknown error')
      } catch {
        setError((err as Error)?.message || 'Sign in failed')
      }
      console.error(JSON.stringify(err, null, 2))
    }
  }

  useEffect(() => {
    if (isSignedIn) router.replace('/');
  }, [isSignedIn, router]);

  if (!signIn) return null

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
          onClick={() => { signInWith('oauth_google') }}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition"
        >
          Google
        </button>
        <button
          onClick={() => { signInWith('oauth_apple') }}
          className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition"
        >
          Apple
        </button>
        <button
          onClick={() => { signInWith('oauth_microsoft') }}
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
        <Link href="/sign-up">Don&apos;t have an account? Sign up</Link>
      </p>
    </div >
  );
}