import { NextResponse } from 'next/server';
import { db, client } from '@/lib/db';
import { eq } from 'drizzle-orm';

type ClientParams = {
  clientId: string;
};

export async function GET(
  req: Request,
  { params }: { params: Promise<ClientParams> },
) {
  try {
    // Properly await the params Promise before accessing properties
    const resolvedParams = await params;
    const clientId = resolvedParams.clientId;

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 },
      );
    }

    const [clientData] = await db
      .select()
      .from(client)
      .where(eq(client.id, clientId))
      .limit(1);

    if (!clientData) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(clientData);
  } catch (error) {
    console.error('Failed to fetch client:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
