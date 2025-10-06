import { auth } from '@clerk/nextjs/server';
import { getComments } from '@/lib/data/comments';
import CommentsClient from './CommentsClient';
import clerkClient from '@/lib/clerk';

interface CommentsServerProps {
  storyId: string;
}

export default async function CommentsServer({ storyId }: CommentsServerProps) {
  const { userId } = await auth();
  const comments = await getComments(storyId);
  
  // Enrich comments with author info from Clerk
  const enrichedComments = await Promise.all(
    comments.map(async (comment) => {
      let authorName = 'Unknown';
      let authorImage: string | null = null;
      
      try {
        if (comment.authorId && process.env.CLERK_SECRET_KEY) {
          const user = await clerkClient.users.getUser(comment.authorId);
          authorName = user.fullName || user.primaryEmailAddress?.emailAddress || 'Unknown';
          authorImage = user.imageUrl || null;
        }
      } catch {
        // Ignore errors, use defaults
      }
      
      return {
        _id: comment._id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        authorId: comment.authorId,
        authorName,
        authorImage,
      };
    })
  );
  
  return <CommentsClient storyId={storyId} initialComments={enrichedComments} userId={userId} />;
}
