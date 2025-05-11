import type { ChildProcess } from 'child_process';
import type { WebSocket } from 'ws';
// import type { LiveTranscriptionEvents } from '@deepgram/sdk'; // Using 'any' for now for Deepgram connection
import type { BotConfig } from '@/vexa-bot/core/src/types'; // Assuming @/ maps to project root

export interface ActiveStreamData {
  botConfig: BotConfig;
  sseStreamController?: ReadableStreamDefaultController<Uint8Array>; // Controller for SSE to client
  botAudioSocket?: WebSocket; // WebSocket connection from the Vexa Bot
  deepgramConnection?: any; // Instance of Deepgram live transcription connection
  dockerProcess?: ChildProcess; // Reference to the spawned Docker process
  // Add any other necessary state, e.g., for Deepgram event listeners
}

// Use a global variable to make the activeStreams Map survive across Next.js route reloads / hot-reloads.
declare global {
  // eslint-disable-next-line no-var
  var activeStreamsMap: Map<string, ActiveStreamData> | undefined;
}

let activeStreams: Map<string, ActiveStreamData>;

if (process.env.NODE_ENV === 'production') {
  activeStreams = new Map<string, ActiveStreamData>();
} else {
  if (!global.activeStreamsMap) {
    global.activeStreamsMap = new Map<string, ActiveStreamData>();
    console.log("lib/active-streams.ts: Initialized global activeStreamsMap for development.");
  }
  activeStreams = global.activeStreamsMap;
}

export { activeStreams };
