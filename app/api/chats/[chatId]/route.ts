// app/api/chats/[chatId]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { chat } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }
    const userId = session.user.id;
    const chatId = params.chatId;

    if (!chatId) {
        return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    // Fetch the specific chat, ensuring the user owns it
    const chatData = await db.query.chat.findFirst({
        where: (chat, { and, eq }) => and(
            eq(chat.id, chatId),
            eq(chat.userId, userId) // Enforce ownership
        ),
        columns: {
            clientId: true // Only fetch clientId for efficiency
        }
    });

    if (!chatData) {
      // Return 404 if chat not found OR user doesn't own it
      return NextResponse.json({ error: 'Chat not found or access denied' }, { status: 404 });
    }

    return NextResponse.json(chatData); // Return { clientId: '...' } or { clientId: null }
  } catch (error) {
    console.error(`Failed to fetch chat ${params.chatId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
