import { NextRequest, NextResponse } from 'next/server';
import { spawn, ChildProcess } from 'child_process';
import { activeStreams } from '@/lib/active-streams';
import type { BotConfig } from '@/vexa-bot/core/src/types';
import type { WebSocket } from 'ws'; // Import WebSocket type for botAudioSocket readyState check

// Helper function to safely stringify and enqueue data to SSE stream
function sendSseMessage(controller: ReadableStreamDefaultController<Uint8Array>, data: object) {
  try {
    if (controller.desiredSize === null || controller.desiredSize <= 0) {
      // console.warn("SSE Controller is closed or backed up, cannot enqueue:", data);
      return;
    }
    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
  } catch (e) {
    console.error("Error enqueuing to SSE stream (stream might be closed):", e);
  }
}

// Function to handle cleanup of resources for a connectionId
function cleanupResources(connectionId: string) {
  const streamData = activeStreams.get(connectionId);
  if (streamData) {
    console.log(`STREAM_ROUTE: Cleaning up resources for connectionId: ${connectionId}`);
    
    if (streamData.dockerProcess && !streamData.dockerProcess.killed) {
      console.log(`STREAM_ROUTE: Killing Docker process for ${connectionId}`);
      streamData.dockerProcess.kill('SIGTERM'); 
      setTimeout(() => {
        if (streamData.dockerProcess && !streamData.dockerProcess.killed) {
          console.log(`STREAM_ROUTE: Forcefully killing Docker process for ${connectionId}`);
          streamData.dockerProcess.kill('SIGKILL');
        }
      }, 5000); 
    }

    if (streamData.deepgramConnection) {
        if (typeof streamData.deepgramConnection.finish === 'function' && 
            (streamData.deepgramConnection.getReadyState && streamData.deepgramConnection.getReadyState() === 1)) {
          console.log(`STREAM_ROUTE: Finishing Deepgram connection for ${connectionId}`);
          streamData.deepgramConnection.finish();
        } else if (typeof streamData.deepgramConnection.close === 'function' && (!streamData.deepgramConnection.getReadyState || streamData.deepgramConnection.getReadyState() !== 0)) {
             console.log(`STREAM_ROUTE: Closing Deepgram connection (alternative) for ${connectionId}`);
             streamData.deepgramConnection.close();
        }
    }

    if (streamData.botAudioSocket && streamData.botAudioSocket.readyState === 1) { // WebSocket.OPEN
      console.log(`STREAM_ROUTE: Closing bot audio WebSocket for ${connectionId}`);
      streamData.botAudioSocket.close(1000, "Stream ended by server");
    }

    if (streamData.sseStreamController) {
        try {
            if (streamData.sseStreamController.desiredSize !== null) { // Check if it's not already closed
                 console.log(`STREAM_ROUTE: Closing SSE controller for ${connectionId}`);
                 streamData.sseStreamController.close();
            }
        } catch (e) {
            console.warn(`STREAM_ROUTE: Error closing SSE controller for ${connectionId} (might be already closed):`, e);
        }
    }
    activeStreams.delete(connectionId);
    console.log(`STREAM_ROUTE: Removed connectionId ${connectionId} from activeStreams.`);
  } else {
    // console.log(`STREAM_ROUTE: No active stream data found for connectionId ${connectionId} to clean up.`);
  }
}


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const connectionId = searchParams.get('connectionId');

  if (!connectionId) {
    return NextResponse.json({ error: 'connectionId is required' }, { status: 400 });
  }

  const streamData = activeStreams.get(connectionId);

  if (!streamData || !streamData.botConfig) {
    console.error(`/api/transcript/stream: Invalid or expired connectionId: ${connectionId}`);
    return NextResponse.json({ error: 'Invalid or expired connectionId' }, { status: 404 });
  }
  // Allow re-connection if sseStreamController is not set, or if docker process is killed (implies previous attempt failed/stopped)
  if (streamData.sseStreamController && (streamData.dockerProcess && !streamData.dockerProcess.killed)) {
    console.warn(`/api/transcript/stream: Stream already active for connectionId: ${connectionId}`);
    return NextResponse.json({ error: 'Stream already active for this connectionId' }, { status: 409 });
  }

  const { botConfig } = streamData;
  // Ensure VEXA_BOT_DOCKER_IMAGE is defined in .env.local or use a sensible default
  const dockerImageName = process.env.VEXA_BOT_DOCKER_IMAGE || 'vexa-bot-test'; 

  const stream = new ReadableStream({
    start(controller) {
      console.log(`[STREAM_ROUTE_SSE_START ${connectionId}] SSE stream starting.`);
      // It's crucial to update the sseStreamController in the activeStreams map
      // If streamData was retrieved before a previous controller was cleaned up, ensure it's fresh.
      const currentStreamData = activeStreams.get(connectionId);
      if(currentStreamData) {
        currentStreamData.sseStreamController = controller;
      } else {
        // This case should ideally not happen if connectionId validation is robust
        console.error(`SSE Start: No streamData found for ${connectionId} after initial check. Aborting.`);
        try { controller.close(); } catch(e) {}
        return;
      }
      
      sendSseMessage(controller, { type: "status", source:"server", message: "SSE connection established. Starting Vexa Bot..." });

      const botConfigString = JSON.stringify(botConfig);
      const containerName = `vexa-bot-session-${connectionId}`; 

      console.log(`Spawning Docker container ${containerName} for ${connectionId} with image ${dockerImageName}`);
      
      const botProcess = spawn('docker', [
        'run',
        '--rm', // Automatically remove the container when it exits
        `--name=${containerName}`,
        '-e', `BOT_CONFIG=${botConfigString}`,
        // For Linux hosts, to allow Docker container to reach host network for wsUrl (host.docker.internal):
        // '--add-host=host.docker.internal:host-gateway', 
        // For Docker Desktop (Mac/Windows), host.docker.internal usually works by default.
        dockerImageName,
      ]);

      if(currentStreamData) { // Re-check as it might have been deleted by a concurrent /stop request
        currentStreamData.dockerProcess = botProcess;
      } else {
        console.error(`SSE Start: streamData for ${connectionId} disappeared before Docker spawn. Killing spawned process.`);
        botProcess.kill();
        try { controller.close(); } catch(e) {}
        return;
      }


      botProcess.stdout.on('data', (data) => {
        const logLines = data.toString().trim().split('\n');
        logLines.forEach((line: string) => {
          console.log(`[VEXA_STDOUT ${connectionId}] Data: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
          if (!controller.desiredSize) return; // Stop if stream closed
          try {
            const logEntry = JSON.parse(line); 
            sendSseMessage(controller, logEntry); 
          } catch (e) {
            sendSseMessage(controller, { type: "log", source: "vexa-bot-stdout", message: line });
          }
        });
      });

      botProcess.stderr.on('data', (data) => {
        if (!controller.desiredSize) return;
        const message = data.toString().trim();
        console.error(`[VEXA_STDERR ${connectionId}] Error: ${message}`);
        sendSseMessage(controller, { type: "error", source: "vexa-bot-stderr", message });
      });

      botProcess.on('close', (code) => {
        console.log(`[VEXA_CLOSE ${connectionId}] VexaBot container ${containerName} exited with code ${code}.`);
        sendSseMessage(controller, { type: "status", source:"server", message: `Bot exited with code ${code}. Stream closing.` });
        cleanupResources(connectionId); 
      });

      botProcess.on('error', (err) => {
        console.error(`[VEXA_PROC_ERROR ${connectionId}] Failed to start/run Docker container ${containerName}:`, err);
        sendSseMessage(controller, { type: "error", source: "docker-process", message: `Failed to run bot: ${err.message}` });
        cleanupResources(connectionId); 
      });
    },
    cancel(reason) {
      console.log(`SSE stream cancelled by client for connectionId: ${connectionId}. Reason:`, reason);
      cleanupResources(connectionId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Useful for Nginx environments
      // 'Access-Control-Allow-Origin': '*', // If needed for CORS
    },
  });
}
