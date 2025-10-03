import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

// TypeScript interfaces for Clerk webhook data
interface ClerkEmailAddress {
  email_address: string;
  id: string;
}

interface ClerkUserData {
  id: string;
  email_addresses: ClerkEmailAddress[];
  first_name?: string;
  last_name?: string;
  username?: string;
  image_url?: string;
  profile_image_url?: string;
  primary_email_address_id?: string;
}

interface ClerkWebhookEvent {
  type: string;
  data: ClerkUserData;
}

// Utility function to extract email from Clerk user data
function extractEmail(userData: ClerkUserData): string {
  let email = '';

  // Try to find the email address with the matching primary_email_address_id
  if (userData.primary_email_address_id && userData.email_addresses && userData.email_addresses.length > 0) {
    const primaryEmailObj = userData.email_addresses.find(
      (e) => e.id === userData.primary_email_address_id
    );
    if (primaryEmailObj && primaryEmailObj.email_address) {
      email = primaryEmailObj.email_address;
    }
  }

  // Fallback: use the first email address if primary not found
  if (!email && userData.email_addresses && userData.email_addresses.length > 0) {
    email = userData.email_addresses[0].email_address || '';
  }

  // If there is still no email, generate a temporary one for Clerk tests
  if (!email) {
    email = `${userData.id}@clerk-test.com`;
  }

  return email;
}

async function handleUserCreated(userData: ClerkUserData) {
  const email = extractEmail(userData);

  const user = new User({
    clerkId: userData.id,
    email: email,
    firstName: userData.first_name || '',
    lastName: userData.last_name || '',
    username: userData.username || '',
    imageUrl: userData.image_url || userData.profile_image_url || ''
  });

  await user.save();
  return user;
}

async function handleUserUpdated(userData: ClerkUserData) {
  const email = extractEmail(userData);

  const user = await User.findOneAndUpdate(
    { clerkId: userData.id },
    {
      email: email,
      firstName: userData.first_name || '',
      lastName: userData.last_name || '',
      username: userData.username || '',
      imageUrl: userData.image_url || userData.profile_image_url || ''
    },
    { new: true, upsert: true }
  );

  return user;
}

async function handleUserDeleted(userData: ClerkUserData) {
  const result = await User.findOneAndDelete({ clerkId: userData.id });
  return result;
}

export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature for security
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Get raw body for signature verification
    const rawBody = await req.text();
    const headers = req.headers;

    // Verify webhook signature
    const wh = new Webhook(webhookSecret);
    let evt: ClerkWebhookEvent;

    try {
      evt = wh.verify(rawBody, {
        'svix-id': headers.get('svix-id') || '',
        'svix-timestamp': headers.get('svix-timestamp') || '',
        'svix-signature': headers.get('svix-signature') || '',
      }) as ClerkWebhookEvent;
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    // Connect to database
    await dbConnect();

    // Parse payload
    const { type, data } = evt;

    let result;

    switch (type) {
      case 'user.created':
        result = await handleUserCreated(data);
        break;

      case 'user.updated':
        result = await handleUserUpdated(data);
        break;

      case 'user.deleted':
        result = await handleUserDeleted(data);
        break;

      default:
        return NextResponse.json({
          message: 'Event type not handled',
          type
        }, { status: 200 });
    }

    return NextResponse.json({
      message: 'Webhook processed successfully',
      type,
      userId: data?.id,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({
      error: 'Webhook processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Clerk webhook endpoint is ready',
    timestamp: new Date().toISOString()
  }, { status: 200 });
}