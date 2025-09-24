import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '../../../lib/mongodb';
import Story from '../../../models/Story';

export async function GET() {
  await dbConnect();
  const stories = await Story.find({ published: true }).sort({ createdAt: -1 });
  return Response.json(stories);
}

export async function POST(req: Request) {
  await dbConnect();
  const user = await currentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { title, description, chapters } = await req.json();

  const story = new Story({
    title,
    description,
    authorId: user.id,
    chapters,
    published: true,
  });

  await story.save();

  return Response.json({ message: 'Story created', id: story._id });
}