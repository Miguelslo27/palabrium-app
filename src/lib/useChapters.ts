import getClerkClient from '@/lib/clerk-client';

interface ChapterData {
  title: string;
  content: string;
  order?: number;
  published?: boolean;
}

async function detectUserId(): Promise<string | null> {
  try {
    const clerk = getClerkClient() as {
      load(): Promise<void>;
      user?: { id?: string };
      client?: { user?: { id?: string } }
    };
    await clerk.load();
    return clerk?.user?.id || (clerk?.client && clerk.client.user && clerk.client.user.id) || null;
  } catch {
    if (typeof window !== 'undefined') return (window as { __USER_ID__?: string }).__USER_ID__ || null;
    return null;
  }
}

export { detectUserId };

export async function fetchChapters(storyId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/stories/${storyId}/chapters`)
  if (!res.ok) throw new Error('Failed to fetch chapters')
  return res.json()
}

export async function createChapter(storyId: string, data: ChapterData) {
  const userId = await detectUserId();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (userId) headers['x-user-id'] = String(userId);
  const res = await fetch(`/api/stories/${storyId}/chapters`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create chapter')
  return res.json()
}

export async function updateChapter(id: string, data: ChapterData) {
  const userId = await detectUserId();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (userId) headers['x-user-id'] = String(userId);
  const res = await fetch(`/api/chapters/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update chapter')
  return res.json()
}

export async function deleteChapter(id: string) {
  const userId = await detectUserId();
  const headers: Record<string, string> = {};
  if (userId) headers['x-user-id'] = String(userId);
  const res = await fetch(`/api/chapters/${id}`, { method: 'DELETE', headers })
  if (!res.ok) throw new Error('Failed to delete chapter')
  return res.json()
}

export async function toggleChapterPublish(id: string, published: boolean) {
  const userId = await detectUserId();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (userId) headers['x-user-id'] = String(userId);
  const res = await fetch(`/api/chapters/${id}/publish`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ published }),
  });
  if (!res.ok) throw new Error('Failed to toggle publish chapter');
  return res.json();
}
