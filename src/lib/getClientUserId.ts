import getClerkClient from './clerk-client';

export default async function getClientUserId(): Promise<string | null> {
  try {
    const clerk = getClerkClient() as {
      load?: () => Promise<void>;
      user?: { id?: string };
      client?: { user?: { id?: string } }
    };
    if (typeof clerk.load === 'function') await clerk.load();
    const id = clerk?.user?.id || (clerk?.client && clerk.client.user && clerk.client.user.id) || null;
    if (id) return String(id);
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined') {
    return (window as { __USER_ID__?: string }).__USER_ID__ || null;
  }
  return null;
}
