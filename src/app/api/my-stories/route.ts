import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '../../../lib/mongodb';
import Story from '../../../models/Story';

export async function GET() {
  const user = await currentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  await dbConnect();
  const stories = await Story.find({ authorId: user.id }).sort({ createdAt: -1 });
  return Response.json(stories);
}