import dbConnect from '@/lib/mongodb';
import clerkClient from '@/lib/clerk';

export async function POST(req: Request) {
  await dbConnect().catch(() => { });
  try {
    const body = await req.json();
    const { email, password, firstName, lastName } = body || {};

    if (!email || !password) {
      return new Response(JSON.stringify({ message: 'Email and password are required' }), { status: 400 });
    }

    // Create user in Clerk. This will create the user record and an associated email address.
    const user = await clerkClient.users.createUser({
      emailAddress: [email],
      password,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
    });

    // Debug: log the user object returned by Clerk (without sensitive fields)
    try {
      console.log('Clerk createUser result:', JSON.stringify({ id: user.id, emailAddresses: user.emailAddresses?.map((e: any) => ({ id: e.id, emailAddress: e.emailAddress, verified: e.verification?.status })) }, null, 2));
    } catch (logErr) {
      console.warn('Could not stringify Clerk user for debug logging', logErr);
    }

    // Do not create a backend session here. Let the frontend complete the sign-up/sign-in lifecycle
    // so Clerk can set cookies and manage verification flows.
    const primaryEmail = user.emailAddresses && user.emailAddresses.length > 0 ? user.emailAddresses[0] : null;
    const emailVerified = primaryEmail ? (primaryEmail.verification?.status || null) : null;

    // Return minimal info required by the client: user id and whether email is verified.
    return new Response(JSON.stringify({ message: 'User created', id: user.id, emailVerified }), { status: 201 });
  } catch (err: any) {
    console.error('local-signup error', err?.message || err);
    const msg = err?.message || 'Internal error';
    return new Response(JSON.stringify({ message: msg }), { status: 500 });
  }
}
