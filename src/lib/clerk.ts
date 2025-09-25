import { createClerkClient } from '@clerk/backend';

// Instantiate a Clerk client for server-side/backend usage.
// Expects CLERK_SECRET_KEY to be set in environment variables.

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY || '' });

export default clerkClient;
