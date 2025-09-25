import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/Story'; // placeholder import - project has no user model; we won't persist here

export async function POST(req: Request) {
  // Minimal stub for local signup during auth removal transition
  await dbConnect().catch(() => { });
  try {
    const body = await req.json();
    // In a real implementation you'd create a user in MongoDB and return session info
    console.log('local-signup payload:', JSON.stringify({ email: body.email }, null, 2));
    return new Response(JSON.stringify({ message: 'Signup stubbed', id: 'local-uid-123' }), { status: 200 });
  } catch (err) {
    console.error('local-signup error', err);
    return new Response(JSON.stringify({ message: 'Invalid request' }), { status: 400 });
  }
}
