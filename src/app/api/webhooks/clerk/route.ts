import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

// Funciones auxiliares para manejar eventos de Clerk
async function handleUserCreated(userData: any) {
  console.log('👤 Creando nuevo usuario:', userData.id);

  const user = new User({
    clerkId: userData.id,
    email: userData.email_addresses?.[0]?.email_address || '',
    firstName: userData.first_name || '',
    lastName: userData.last_name || '',
    username: userData.username || '',
    imageUrl: userData.image_url || ''
  });

  await user.save();
  console.log('✅ Usuario creado exitosamente en MongoDB');
  return user;
}

async function handleUserUpdated(userData: any) {
  console.log('✏️ Actualizando usuario:', userData.id);

  const user = await User.findOneAndUpdate(
    { clerkId: userData.id },
    {
      email: userData.email_addresses?.[0]?.email_address || '',
      firstName: userData.first_name || '',
      lastName: userData.last_name || '',
      username: userData.username || '',
      imageUrl: userData.image_url || '',
      updatedAt: new Date()
    },
    { new: true, upsert: true }
  );

  console.log('✅ Usuario actualizado exitosamente en MongoDB');
  return user;
}

async function handleUserDeleted(userData: any) {
  console.log('🗑️ Eliminando usuario:', userData.id);

  const result = await User.findOneAndDelete({ clerkId: userData.id });

  if (result) {
    console.log('✅ Usuario eliminado exitosamente de MongoDB');
  } else {
    console.log('⚠️ Usuario no encontrado para eliminar');
  }

  return result;
}

export async function POST(req: NextRequest) {
  try {
    console.log('🎯 Webhook de Clerk recibido');

    // Conectar a la base de datos
    await dbConnect();

    const payload = await req.json();
    const { type, data } = payload;

    console.log('📦 Evento recibido:', type);
    console.log('� Datos del usuario:', data?.id);

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
        console.log('⚠️ Tipo de evento no manejado:', type);
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
    console.error('❌ Error procesando webhook:', error);
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