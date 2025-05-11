import { NextResponse } from 'next/server';
// import { spawn } from 'child_process'; // No longer spawning Docker here
import { v4 as uuidv4 } from 'uuid';
import { activeStreams } from '@/lib/active-streams'; // For storing BOT_CONFIG
import type { BotConfig } from '@/vexa-bot/core/src/types'; // Use the actual BotConfig type

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const meetLink = body.meetLink as string;

    // 1. Validate Meet Link
    if (!meetLink || typeof meetLink !== 'string' || !meetLink.startsWith('https://meet.google.com/')) {
      return NextResponse.json({ error: "Invalid Google Meet link provided. It must start with 'https://meet.google.com/'." }, { status: 400 });
    }

    // 2. Generate connectionId
    const connectionId = uuidv4();

    // 3. Construct BOT_CONFIG
    const meetIdMatch = meetLink.match(/meet.google.com\/([a-zA-Z0-9-]+)/);
    const nativeMeetingId = meetIdMatch ? meetIdMatch[1] : '';

    if (!nativeMeetingId) {
      return NextResponse.json({ error: "Could not extract meeting ID from the link." }, { status: 400 });
    }

    // Construct wsUrl for the Vexa Bot to connect to the backend WebSocket audio intake
    // Assuming the custom server runs on port 3000 (or NEXT_PUBLIC_PORT if defined)
    // For Docker, Vexa Bot needs to reach the host machine.
    const hostWsUrl = process.env.INTERNAL_WS_HOST || 'host.docker.internal'; // Use env var or default
    const wsPort = process.env.PORT || 3000; // Same port as the main app for custom server
    const wsUrl = `ws://${hostWsUrl}:${wsPort}/ws/bot-audio-intake?connectionId=${connectionId}`;

    const botConfig: BotConfig = {
      platform: "google_meet",
      meetingUrl: meetLink,
      botName: `EHRVexaBot-${connectionId.substring(0, 8)}`,
      token: process.env.VEXA_BOT_TOKEN || "", // Use an env var for token if needed
      connectionId: connectionId,
      nativeMeetingId: nativeMeetingId,
      wsUrl: wsUrl, // Add the WebSocket URL for the bot
      automaticLeave: {
        waitingRoomTimeout: 300000, // 5 minutes
        noOneJoinedTimeout: 300000, // 5 minutes
        everyoneLeftTimeout: 300000, // 5 minutes
      },
      // meeting_id is optional and can be omitted if not used
    };

    // 4. Store BOT_CONFIG in activeStreams
    // The ActiveStreamData interface expects other fields to be optional initially
    activeStreams.set(connectionId, { botConfig });
    console.log(`BOT_CONFIG for connection ${connectionId} stored. wsUrl: ${wsUrl}`);

    // 5. Return connectionId to the client
    // The client will use this to connect to the SSE stream /api/transcript/stream
    return NextResponse.json({ connectionId }, { status: 200 });

  } catch (error) {
    console.error("Error in /api/transcript/start:", error);
    let errorMessage = "Failed to start live transcript process.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
