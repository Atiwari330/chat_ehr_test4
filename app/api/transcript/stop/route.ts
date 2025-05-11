import { NextRequest, NextResponse } from 'next/server';
import { activeStreams } from '@/lib/active-streams';
import type { WebSocket } from 'ws'; // For checking readyState if needed, though not directly used by cleanup

// Function to handle cleanup of resources for a connectionId
// This should ideally be a shared utility, but defined here for now.
// Ensure it's consistent with the one in stream/route.ts or refactor to shared.
function cleanupResources(connectionId: string) {
  const streamData = activeStreams.get(connectionId);
  if (streamData) {
    console.log(`API_STOP: Cleaning up resources for connectionId: ${connectionId}`);
    
    // Kill Docker process
    if (streamData.dockerProcess && !streamData.dockerProcess.killed) {
      console.log(`API_STOP: Killing Docker process for ${connectionId}`);
      streamData.dockerProcess.kill('SIGTERM');
      setTimeout(() => {
        if (streamData.dockerProcess && !streamData.dockerProcess.killed) {
          console.log(`API_STOP: Forcefully killing Docker process for ${connectionId}`);
          streamData.dockerProcess.kill('SIGKILL');
        }
      }, 5000);
    }

    // Finish Deepgram connection
    if (streamData.deepgramConnection) {
        // Check if deepgramConnection has a 'finish' method and is in a state that can be finished
        if (typeof streamData.deepgramConnection.finish === 'function' && 
            (streamData.deepgramConnection.getReadyState && streamData.deepgramConnection.getReadyState() === 1)) { // 1 usually means OPEN
          console.log(`API_STOP: Finishing Deepgram connection for ${connectionId}`);
          streamData.deepgramConnection.finish();
        } else if (typeof streamData.deepgramConnection.close === 'function') {
            // Fallback or alternative closing method if 'finish' is not appropriate or available
            console.log(`API_STOP: Closing Deepgram connection for ${connectionId}`);
            streamData.deepgramConnection.close();
        }
    }

    // Close bot audio WebSocket
    if (streamData.botAudioSocket && streamData.botAudioSocket.readyState === 1) { // 1 means WebSocket.OPEN
      console.log(`API_STOP: Closing bot audio WebSocket for ${connectionId}`);
      streamData.botAudioSocket.close(1000, "Transcription stopped by user");
    }

    // Close SSE stream controller
    if (streamData.sseStreamController) {
      try {
        console.log(`API_STOP: Closing SSE controller for ${connectionId}`);
        streamData.sseStreamController.close();
      } catch (e) {
        console.warn(`API_STOP: Error closing SSE controller for ${connectionId} (might be already closed):`, e);
      }
    }
    
    activeStreams.delete(connectionId);
    console.log(`API_STOP: Removed connectionId ${connectionId} from activeStreams.`);
  } else {
    console.log(`API_STOP: No active stream data found for connectionId ${connectionId} to clean up.`);
  }
}

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const connectionId = searchParams.get('connectionId');

  if (!connectionId) {
    return NextResponse.json({ error: 'connectionId is required' }, { status: 400 });
  }

  console.log(`Received request to stop transcription for connectionId: ${connectionId}`);
  
  cleanupResources(connectionId);
  
  return NextResponse.json({ message: `Transcription process for connectionId ${connectionId} initiated to stop.` }, { status: 200 });
}
