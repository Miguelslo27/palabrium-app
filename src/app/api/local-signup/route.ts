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

    // Create user in Clerk. This will mark the email as verified by default.
    const user = await clerkClient.users.createUser({
      emailAddress: [email],
      password,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
    });

    // Do NOT return sensitive information. Return minimal user id.
    return new Response(JSON.stringify({ message: 'User created', id: user.id }), { status: 201 });
  } catch (err: any) {
    console.error('local-signup error', err?.message || err);
    const msg = err?.message || 'Internal error';
    return new Response(JSON.stringify({ message: msg }), { status: 500 });
  }
}
