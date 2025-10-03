"use client";

import getClerkClient from './clerk-client';

type Mode = 'signUp' | 'signIn';

export async function startOAuth(
  mode: Mode,
  strategy: string,
  redirectUrl = '/',
  redirectUrlComplete = '/',
) {
  const clerk = getClerkClient() as {
    load(): Promise<void>;
    signUp?: { authenticateWithRedirect?: (args: unknown) => Promise<unknown> };
    signIn?: { authenticateWithRedirect?: (args: unknown) => Promise<unknown> };
    client?: {
      signUp?: { authenticateWithRedirect?: (args: unknown) => Promise<unknown> };
      signIn?: { authenticateWithRedirect?: (args: unknown) => Promise<unknown> };
    }
  };
  await clerk.load();

  const api = mode === 'signUp'
    ? (clerk.signUp || (clerk.client && clerk.client.signUp))
    : (clerk.signIn || (clerk.client && clerk.client.signIn));

  if (!api || typeof api.authenticateWithRedirect !== 'function') {
    throw new Error(`${mode} OAuth not available on this client instance`);
  }

  return api.authenticateWithRedirect({ strategy, redirectUrl, redirectUrlComplete });
}

export default startOAuth;
