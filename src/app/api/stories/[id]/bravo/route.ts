import dbConnect from '@/lib/mongodb';
import Story from '@/models/Story';
import { BravoResponse } from '@/types/api';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const userId = req.headers.get('x-user-id');

  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { id } = await params;
  const story = await Story.findById(id);

  if (!story) return new Response('Not found', { status: 404 });

  // Get current bravos array safely
  const currentBravos = Array.isArray((story as { bravos?: string[] }).bravos) ? (story as { bravos: string[] }).bravos : [];
  const hasBravo = currentBravos.indexOf(userId) > -1;

  try {
    let updatedStory;
    if (hasBravo) {
      // remove from both fields for compatibility
      updatedStory = await Story.findByIdAndUpdate(id, { $pull: { bravos: userId } }, { new: true }).select('bravos').lean() as { bravos?: string[] } | null;
      console.log('>>> [pull updated]', updatedStory);
    } else {
      // add to both fields for compatibility
      updatedStory = await Story.findByIdAndUpdate(id, { $addToSet: { bravos: userId } }, { new: true }).select('bravos').lean() as { bravos?: string[] } | null;
      console.log('>>> [addToSet updated]', updatedStory);
    }

    const bravosCount = Array.isArray(updatedStory?.bravos) ? updatedStory.bravos.length : 0;
    const response: BravoResponse = { bravos: bravosCount, braved: !hasBravo };
    return Response.json(response);
  } catch (err) {
    console.error('>>> [update error]', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
