import dbConnect from '@/lib/mongodb';
import Story from '@/models/Story';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const userId = req.headers.get('x-user-id');

  if (!userId) return new Response('Unauthorized', { status: 401 });

  const { id } = await params;
  const story = await Story.findById(id);

  if (!story) return new Response('Not found', { status: 404 });

  const currentBravos = Array.isArray((story as any).bravos) ? (story as any).bravos : undefined;
  const arrayToCheck = currentBravos ?? [];
  const hasBravo = arrayToCheck.indexOf(userId) > -1;

  try {
    let updated: any = null;
    if (hasBravo) {
      // remove from both fields for compatibility
      updated = await Story.findByIdAndUpdate(id, { $pull: { bravos: userId } }, { new: true }).select('bravos');
      console.log('>>> [pull updated]', updated);
    } else {
      // add to both fields for compatibility
      updated = await Story.findByIdAndUpdate(id, { $addToSet: { bravos: userId } }, { new: true }).select('bravos');
      console.log('>>> [addToSet updated]', updated);
    }

    const bravosCount = (updated?.bravos || []).length;
    return Response.json({ bravos: bravosCount, braved: !hasBravo });
  } catch (err) {
    console.error('>>> [update error]', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
