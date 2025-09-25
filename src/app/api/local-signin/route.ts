import dbConnect from '@/lib/mongodb';

export async function POST(req: Request) {
  await dbConnect().catch(() => { });
  try {
    const body = await req.json();
    console.log('local-signin payload:', JSON.stringify({ email: body.email }, null, 2));
    // In a real implementation you'd verify credentials and return session/token
    return new Response(JSON.stringify({ message: 'Signin stubbed', id: 'local-uid-123' }), { status: 200 });
  } catch (err) {
    console.error('local-signin error', err);
    return new Response(JSON.stringify({ message: 'Invalid request' }), { status: 400 });
  }
}
