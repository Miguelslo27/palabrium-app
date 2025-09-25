"use client";
import { Clerk } from "@clerk/clerk-js";

let clerkInstance: Clerk | null = null;

export function getClerkClient(): Clerk {
  if (clerkInstance) return clerkInstance;
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
  clerkInstance = new Clerk(key, { load: true });
  return clerkInstance;
}

export default getClerkClient;
