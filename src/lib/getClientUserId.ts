import getClerkClient from './clerk-client';

export default async function getClientUserId(): Promise<string | null> {
  try {
    const clerk: any = getClerkClient();
    if (typeof clerk.load === 'function') await clerk.load();
    const id = clerk?.user?.id || (clerk?.client && clerk.client.user && clerk.client.user.id) || null;
    if (id) return String(id);
  } catch (e) {
    // ignore
  }
  if (typeof window !== 'undefined') {
    return (window as any).__USER_ID__ || null;
  }
  return null;
}
