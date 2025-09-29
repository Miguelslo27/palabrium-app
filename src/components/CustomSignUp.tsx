"use client";

import { useState } from 'react';
// import getClerkClient from '../lib/clerk-client';
// import startOAuth from '../lib/clerk-oauth';
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation';

export default function CustomSignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState('');

  // const [resendStatus, setResendStatus] = useState<string | null>(null);
  const router = useRouter();

  // const handleGoogle = () => {
  //   (async () => {
  //     try {
  //       await startOAuth('signUp', 'oauth_google', '/', '/');
  //     } catch (e) {
  //       console.error('Google signup failed', e);
  //       setError('Google signup failed. See console for details.');
  //     }
  //   })();
  // };

  // const handleFacebook = () => {
  //   (async () => {
  //     try {
  //       await startOAuth('signUp', 'oauth_facebook', '/', '/');
  //     } catch (e) {
  //       console.error('Facebook signup failed', e);
  //       setError('Facebook signup failed. See console for details.');
  //     }
  //   })();
  // };

  // const handleMicrosoft = () => {
  //   (async () => {
  //     try {
  //       await startOAuth('signUp', 'oauth_microsoft', '/', '/');
  //     } catch (e) {
  //       console.error('Microsoft signup failed', e);
  //       setError('Microsoft signup failed. See console for details.');
  //     }
  //   })();
  // };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError('');
  //   try {
  //     // Prefer client-side Clerk sign-up flow: create SignUp -> attemptFirstFactor -> setActive
  //     try {
  //       const clerk: any = getClerkClient();
  //       await clerk.load();

  //       // Create a signUp instance (password strategy)
  //       const signUp = await clerk.signUp.create({ strategy: 'password', identifier: email });

  //       // Attempt first factor (password)
  //       const attempt = await signUp.attemptFirstFactor({ strategy: 'password', password });

  //       if (attempt.status === 'complete' && attempt.createdSessionId) {
  //         await clerk.setActive({ session: attempt.createdSessionId });
  //         await clerk.load();
  //         setResendStatus('Signup successful — you are signed in');
  //         router.push('/');
  //         return;
  //       }

  //       // If not complete, fall through to server fallback
  //     } catch (clientErr) {
  //       // Client-side flow failed; fallback to server endpoint
  //       console.warn('Client-side Clerk sign-up failed, falling back to server endpoint', clientErr);
  //       const res = await fetch('/api/local-signup', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ email, password, firstName, lastName }),
  //       });
  //       const data = await res.json();
  //       if (!res.ok) {
  //         setError(data?.message || 'Signup failed');
  //         // keep error for user display
  //         // debug info intentionally not stored on the client UI
  //       } else {
  //         // server created user successfully
  //         // Try to sign-in client-side using the same credentials so we can obtain a createdSessionId
  //         // and call clerk.setActive() to sign the user in. This avoids relying on backend-created
  //         // sessions which aren't always usable client-side for setting browser cookies.
  //         try {
  //           const clerk: any = getClerkClient();
  //           await clerk.load();

  //           const signInApi = (clerk && (clerk.signIn || (clerk.client && clerk.client.signIn))) as any;
  //           if (signInApi && typeof signInApi.create === 'function') {
  //             const signIn = await signInApi.create({ strategy: 'password', identifier: email, password });
  //             if (signIn.status === 'complete' && signIn.createdSessionId) {
  //               await clerk.setActive({ session: signIn.createdSessionId });
  //               await clerk.load();
  //               setResendStatus('Signup successful — you are signed in');
  //               router.push('/');
  //               return;
  //             }
  //           }
  //         } catch (signinErr) {
  //           console.warn('Client-side sign-in after server signup failed', signinErr);
  //         }

  //         // If client-side activation didn't happen, fall back to an explanatory message about verification.
  //         setResendStatus('Signup successful — check your email if verification is required');
  //       }
  //     }
  //   } catch (err) {
  //     setError('Network error');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    // Start the sign-up process using the email and password provided
    try {
      setLoading(true);
      await signUp.create({
        emailAddress,
        password,
        firstName,
        lastName,
      });

      // Send the user an email with the verification code
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });

      // Set 'verifying' true to display second form
      // and capture the OTP code
      setVerifying(true)
      setLoading(false);
    } catch (err: any) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      setError(err);
      setLoading(false);
      console.error(JSON.stringify(err, null, 2))
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    try {
      setLoading(true);
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({
          session: signUpAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              // Check for tasks and navigate to custom UI to help users resolve them
              // See https://clerk.com/docs/guides/development/custom-flows/overview#session-tasks
              console.log(session?.currentTask)
              return
            }

            await router.push('/')
          },
        });
        setLoading(true);
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        setError('Verification failed, try again please.');
        setLoading(false);
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err: any) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error('Error:', JSON.stringify(err, null, 2))
    }
  }

  // Display the verification form to capture the OTP code
  if (verifying) {
    return (
      <div className="relative h-full w-full bg-red-50 p-8 flex flex-col justify-center">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-8 flex-none">Verify your email</h1>
        <form onSubmit={handleVerify} className="flex-none space-y-6">
          <div>
            <label className="block text-lg font-medium text-gray-900 mb-2" id="code">Enter your verification code</label>
            <input
              className="w-full px-4 py-3 text-lg text-gray-900 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
              value={code}
              id="code"
              name="code" onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition disabled:opacity-50"
            type="submit"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    )
  }

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
        {/* <button
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
        </button> */}
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
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
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
    </div>
  );
}