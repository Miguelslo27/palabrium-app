import Navbar from '@/components/Navbar';
import EditStoryClient from '@/components/Editor/EditStoryClient';
import EditorLayout from '@/components/Editor/EditorLayout';

export default function EditStoryPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <EditorLayout>
      <Navbar />
      <EditStoryClient storyId={id} />
    </EditorLayout>
  );
}

