import Navbar from '@/components/Navbar';
import StoryFormClient from '@/components/Editor/StoryFormClient';
import EditorLayout from '@/components/Editor/EditorLayout';

export default function EditStoryPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <EditorLayout>
      <Navbar />
      <StoryFormClient mode="edit" storyId={id} />
    </EditorLayout>
  );
}

