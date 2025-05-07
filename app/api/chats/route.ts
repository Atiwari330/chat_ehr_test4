import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { chat } from '@/lib/db/schema';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const { clientId } = body;

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    // Insert new chat associated with the client
    const newChat = await db
      .insert(chat)
      .values({
        userId,
        clientId, // Associate chat with the selected client
        createdAt: new Date(),
        title: 'New Chat', // Placeholder title
        // visibility defaults to 'private'
      })
      .returning({ id: chat.id });

    if (!newChat || newChat.length === 0) {
      return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
    }

    return NextResponse.json({ id: newChat[0].id }, { status: 201 });
  } catch (error) {
    console.error('Failed to create chat:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
