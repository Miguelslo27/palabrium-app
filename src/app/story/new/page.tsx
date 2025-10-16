import Navbar from '@/components/Navbar';
import EditorLayout from '@/components/Editor/EditorLayout';
import StoryFormClient from '@/components/Editor/StoryFormClient';

export default function CreateStoryPage() {
  return (
    <EditorLayout>
      <Navbar />
      <StoryFormClient mode="create" />
    </EditorLayout>
  );
}
