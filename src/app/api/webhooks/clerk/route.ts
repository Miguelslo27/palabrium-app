import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

async function handleUserCreated(userData: any) {
  // Extraer email de diferentes posibles fuentes
  let email = '';
  if (userData.email_addresses && userData.email_addresses.length > 0) {
    email = userData.email_addresses[0].email_address || '';
  }

  // Si no hay email, generar uno temporal para pruebas de Clerk
  if (!email && userData.primary_email_address_id) {
    email = `${userData.id}@clerk-test.com`;
  }

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

async function handleUserUpdated(userData: any) {
  // Extraer email de diferentes posibles fuentes
  let email = '';
  if (userData.email_addresses && userData.email_addresses.length > 0) {
    email = userData.email_addresses[0].email_address || '';
  }

  const user = await User.findOneAndUpdate(
    { clerkId: userData.id },
    {
      email: email,
      firstName: userData.first_name || '',
      lastName: userData.last_name || '',
      username: userData.username || '',
      imageUrl: userData.image_url || userData.profile_image_url || '',
      updatedAt: new Date()
    },
    { new: true, upsert: true }
  );

  return user;
}

async function handleUserDeleted(userData: any) {
  const result = await User.findOneAndDelete({ clerkId: userData.id });
  return result;
}

export async function POST(req: NextRequest) {
  try {
    // Conectar a la base de datos
    await dbConnect();

    // Parsear payload
    const payload = await req.json();
    const { type, data } = payload;

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