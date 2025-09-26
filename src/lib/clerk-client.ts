"use client";
import { Clerk } from "@clerk/clerk-js";

let clerkInstance: Clerk | null = null;

export function getClerkClient(): Clerk {
  if (clerkInstance) return clerkInstance;
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
  if (!key) {
    console.error('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Clerk client may not initialize correctly.');
  }
  // Some @clerk/clerk-js types don't declare the 'load' option here; it's safe at runtime.
  // @ts-ignore - allow passing runtime options the types may not reflect
  clerkInstance = new Clerk(key, { load: true });
  return clerkInstance;
}

export default getClerkClient;
