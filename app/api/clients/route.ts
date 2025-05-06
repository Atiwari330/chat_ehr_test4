import { NextResponse } from 'next/server';
import { db, client } from '@/lib/db'; // Corrected path for db and client schema

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request

export async function GET() {
  try {
    const clients = await db.select().from(client).orderBy(client.lastName, client.firstName); // Fetch all clients, ordered
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    // Return an appropriate error response
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}
