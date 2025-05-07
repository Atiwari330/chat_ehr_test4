// app/api/chats/[chatId]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { chat } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

// Update the params type to be a Promise
type ChatParams = {
  chatId: string;
};

export async function GET(
  req: Request,
  { params }: { params: Promise<ChatParams> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }
    const userId = session.user.id;

    // Properly await the params Promise before accessing properties
    const resolvedParams = await params;
    const chatId = resolvedParams.chatId;

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 },
      );
    }

    // Use standard Drizzle query syntax instead of query builder
    const [chatData] = await db
      .select({ clientId: chat.clientId })
      .from(chat)
      .where(
        and(
          eq(chat.id, chatId),
          eq(chat.userId, userId), // Enforce ownership
        ),
      )
      .limit(1);

    if (!chatData) {
      // Return 404 if chat not found OR user doesn't own it
      return NextResponse.json(
        { error: 'Chat not found or access denied' },
        { status: 404 },
      );
    }

    return NextResponse.json(chatData); // Return { clientId: '...' } or { clientId: null }
  } catch (error) {
    console.error('Failed to fetch chat:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
