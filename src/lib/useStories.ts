import { detectUserId } from '@/lib/useChapters';

export async function toggleStoryPublish(id: string, published: boolean) {
  const userId = await detectUserId();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (userId) headers['x-user-id'] = String(userId);
  const res = await fetch(`/api/stories/${id}/publish`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ published }),
  });
  if (!res.ok) throw new Error('Failed to toggle publish story');
  return res.json();
}
