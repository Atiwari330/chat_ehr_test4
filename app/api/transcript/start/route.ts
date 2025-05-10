import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid'; // For generating unique connectionId

// Define the structure of the BOT_CONFIG based on Vexa Bot's requirements
interface BotConfig {
  platform: "google_meet" | "zoom" | "teams";
  meetingUrl: string | null;
  botName: string;
  token: string; // Purpose to be clarified, using empty string for now
  connectionId: string;
  nativeMeetingId: string;
  automaticLeave: {
    waitingRoomTimeout: number;
    noOneJoinedTimeout: number;
    everyoneLeftTimeout: number;
  };
  meeting_id?: number; // Optional internal ID
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const meetLink = body.meetLink as string;

    // 1. Validate Meet Link
    if (!meetLink || typeof meetLink !== 'string' || !meetLink.startsWith('https://meet.google.com/')) {
      return NextResponse.json({ error: "Invalid Google Meet link provided. It must start with 'https://meet.google.com/'." }, { status: 400 });
    }

    // 2. Read VEXA_BOT_DOCKER_SCRIPT_PATH from environment variables
    // Note: VEXA_BOT_DOCKER_SCRIPT_PATH was for direct node execution.
    // For Docker, we just need the image name. The script path is internal to the Docker image.
    // We will use the image name 'vexa-bot-test' as built in Phase 0.
    const dockerImageName = 'vexa-bot-test'; // Or a production image name from env var later

    // 3. Construct BOT_CONFIG
    const connectionId = uuidv4();
    const meetIdMatch = meetLink.match(/meet.google.com\/([a-zA-Z0-9-]+)/);
    const nativeMeetingId = meetIdMatch ? meetIdMatch[1] : '';

    if (!nativeMeetingId) {
        return NextResponse.json({ error: "Could not extract meeting ID from the link." }, { status: 400 });
    }

    const botConfig: BotConfig = {
      platform: "google_meet",
      meetingUrl: meetLink,
      botName: `EHRVexaBot-${connectionId.substring(0, 8)}`,
      token: "", // Placeholder - purpose to be clarified
      connectionId: connectionId,
      nativeMeetingId: nativeMeetingId,
      automaticLeave: {
        waitingRoomTimeout: 300000, // 5 minutes
        noOneJoinedTimeout: 300000, // 5 minutes
        everyoneLeftTimeout: 300000, // 5 minutes
      }
    };

    const botConfigString = JSON.stringify(botConfig);
    const containerName = `vexa-bot-session-${connectionId}`;

    console.log(`Attempting to start VexaBot for connection ${connectionId} with config: ${botConfigString}`);
    console.log(`Docker image: ${dockerImageName}, Container name: ${containerName}`);

    // 4. Spawn Docker process
    const botProcess = spawn('docker', [
      'run',
      '--rm', // Automatically remove the container when it exits
      `--name=${containerName}`, // Assign a unique name to the container
      '-e', `BOT_CONFIG=${botConfigString}`,
      dockerImageName
    ]);

    botProcess.stdout.on('data', (data) => {
      console.log(`[VexaBot ${connectionId} STDOUT]: ${data.toString().trim()}`);
      // Later: Stream this to the client via WebSocket
    });

    botProcess.stderr.on('data', (data) => {
      console.error(`[VexaBot ${connectionId} STDERR]: ${data.toString().trim()}`);
      // Later: Stream this to the client via WebSocket
    });

    botProcess.on('close', (code) => {
      console.log(`VexaBot container ${containerName} (Connection ID: ${connectionId}) exited with code ${code}`);
      // Later: Notify client via WebSocket that the process has ended
    });

    botProcess.on('error', (err) => {
      console.error(`Failed to start Docker container ${containerName} for VexaBot (Connection ID: ${connectionId}):`, err);
      // This typically means 'docker run' command itself failed.
      // Note: This might not be catchable by the try/catch block if spawn itself succeeds but the command fails.
      // The client won't get an immediate error response here, but we log it.
      // A more robust solution would involve a way to communicate this failure back.
    });

    // Return a success response to the client immediately
    // The actual transcript data will be streamed via WebSockets (Phase III)
    return NextResponse.json({ 
        message: "Live transcript process initiated.",
        connectionId: connectionId, // Client might need this for WebSocket connection
        containerName: containerName 
    }, { status: 200 });

  } catch (error) {
    console.error("Error in /api/transcript/start:", error);
    let errorMessage = "Failed to start live transcript process.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
