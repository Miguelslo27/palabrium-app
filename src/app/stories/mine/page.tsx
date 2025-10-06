import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getMyStories } from '@/lib/data/stories';
import Navbar from '@/components/Navbar';
import EditorLayout from '@/components/Editor/EditorLayout';
import MyStoriesClient from './MyStoriesClient';

export default async function MyStoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect=/stories/mine');
  }

  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const limit = parseInt(params.limit || '10');
  const skip = (page - 1) * limit;

  const { stories, total } = await getMyStories(userId, { skip, limit });

  return (
    <EditorLayout>
      <Navbar />
      <MyStoriesClient
        initialStories={stories}
        total={total}
        page={page}
        limit={limit}
      />
    </EditorLayout>
  );
}
