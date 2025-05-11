import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Explicitly load .env.local

// At the very top of server.ts
console.log("--- Environment Variables Check ---");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("DEEPGRAM_API_KEY (raw):", process.env.DEEPGRAM_API_KEY);
console.log("Does .env.local DEEPGRAM_API_KEY exist?", !!process.env.DEEPGRAM_API_KEY);
console.log("--- End Environment Variables Check ---");

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer, WebSocket } from 'ws';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { activeStreams, ActiveStreamData } from './lib/active-streams'; // Path alias should work

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Ensure DEEPGRAM_API_KEY is set

if (!process.env.DEEPGRAM_API_KEY) {
  console.error("DEEPGRAM_API_KEY environment variable is not set. WebSocket server for audio intake will not function correctly.");
  // process.exit(1); // Or handle more gracefully depending on requirements
}

app.prepare().then(() => {
  const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling HTTP request:', err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    const { pathname, query } = parse(request.url!, true);

    if (pathname === '/ws/bot-audio-intake') {
      const connectionId = query.connectionId as string;

      if (!connectionId) {
        console.log('WebSocket upgrade rejected: No connectionId provided.');
        socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
        socket.destroy();
        return;
      }

      const streamData = activeStreams.get(connectionId);
      if (!streamData) {
        console.log(`WebSocket upgrade rejected: No active stream data found for connectionId ${connectionId}.`);
        socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        socket.destroy();
        return;
      }

      if (streamData.botAudioSocket && streamData.botAudioSocket.readyState === WebSocket.OPEN) {
        console.log(`WebSocket upgrade rejected: Bot audio socket already open for connectionId ${connectionId}.`);
        socket.write('HTTP/1.1 409 Conflict\r\n\r\n'); // 409 Conflict or similar
        socket.destroy();
        return;
      }
      
      console.log(`Attempting WebSocket upgrade for /ws/bot-audio-intake with connectionId: ${connectionId}`);
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request, connectionId, streamData);
      });
    } else {
      console.log(`WebSocket upgrade rejected: Path ${pathname} not handled.`);
      socket.destroy();
    }
  });

  wss.on('connection', (ws: WebSocket, request: IncomingMessage, connectionId: string, streamData: ActiveStreamData) => {
    console.log(`WebSocket connection established for /ws/bot-audio-intake with connectionId: ${connectionId}`);
    streamData.botAudioSocket = ws;

    if (!process.env.DEEPGRAM_API_KEY) {
      console.error(`Cannot start Deepgram for ${connectionId}: DEEPGRAM_API_KEY is not set.`);
      ws.close(1011, "Server configuration error: Deepgram API key missing."); // 1011: Internal Server Error
      return;
    }
    
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    const dgConnection = deepgram.listen.live({
      model: 'nova-2',
      smart_format: true,
      interim_results: true, // As per plan
      language: 'en-US',
      punctuate: true,
      encoding: 'linear16',
      sample_rate: 16000, // VexaBot already resamples to 16kHz
      channels: 1,
    });

    streamData.deepgramConnection = dgConnection;

    dgConnection.on(LiveTranscriptionEvents.Open, () => {
      console.log(`[DEEPGRAM_OPEN ${connectionId}] Deepgram connection opened.`);
    });

    dgConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
      const transcript = data.channel?.alternatives?.[0]?.transcript;
      if (transcript) {
        // console.log(`Deepgram transcript for ${connectionId} (is_final: ${data.is_final}, speech_final: ${data.speech_final}): ${transcript}`);
        if (streamData.sseStreamController) {
          try {
            const ssePayload = {
              type: 'transcript',
              segment: transcript,
              isFinal: data.is_final,
              speechFinal: data.speech_final
            };
            console.log(`[SERVER_SSE_SEND ${connectionId}] Payload:`, JSON.stringify(ssePayload));
            streamData.sseStreamController.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify(ssePayload)}\n\n`
              )
            );
          } catch (error) {
            console.error(`Error enqueuing transcript to SSE for ${connectionId}:`, error);
            // Potentially close SSE stream or handle error
          }
        }
      }
    });

    dgConnection.on(LiveTranscriptionEvents.Error, (error) => {
      console.error(`[DEEPGRAM_ERROR ${connectionId}] Deepgram error:`, error);
      if (streamData.sseStreamController) {
        try {
          streamData.sseStreamController.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ type: 'error', source: 'deepgram', message: error.message || 'Unknown Deepgram error' })}\n\n`
            )
          );
        } catch (sseError) {
            console.error(`Error enqueuing Deepgram error to SSE for ${connectionId}:`, sseError);
        }
      }
      // Optionally close bot audio socket if Deepgram error is fatal
      // ws.close(1011, "Deepgram processing error"); 
    });

    dgConnection.on(LiveTranscriptionEvents.Close, (event) => {
      console.log(`[DEEPGRAM_CLOSE ${connectionId}] Deepgram connection closed. Code: ${event.code}, Reason: ${event.reason}`);
      // No need to explicitly clean up streamData.deepgramConnection here if we re-create on new bot socket.
      // However, if the bot socket is still open, this might indicate an issue.
      if (streamData.sseStreamController && streamData.sseStreamController.desiredSize !== null) { // Check if controller is still active
        try {
            streamData.sseStreamController.enqueue(
              new TextEncoder().encode(
                  `data: ${JSON.stringify({ type: 'status', source: 'deepgram', message: 'Deepgram connection closed.' })}\n\n`
              )
            );
        } catch (e) { /* ignore error if controller already closed */ }
      }
    });

    ws.on('message', (message: Buffer | ArrayBuffer | Buffer[]) => {
      if (dgConnection && dgConnection.getReadyState() === 1 /* OPEN */) {
        // Assuming message is ArrayBuffer as configured in VexaBot (sends float32Array.buffer)
        // Convert Float32Array audio data (from ArrayBuffer) to 16-bit PCM Buffer
        try {
          let audioBuffer: Buffer;
          if (Buffer.isBuffer(message)) {
            audioBuffer = message;
          } else if (message instanceof ArrayBuffer) {
            audioBuffer = Buffer.from(message);
          } else if (Array.isArray(message) && message.every(item => Buffer.isBuffer(item))) {
            audioBuffer = Buffer.concat(message as Buffer[]);
          } else {
            console.error(`Unsupported message type for audio data for ${connectionId}`);
            return;
          }
          
          // The VexaBot sends Float32Array.buffer, which is an ArrayBuffer.
          // We need to interpret this ArrayBuffer as Float32, then convert to Int16 PCM.
          const float32Array = new Float32Array(audioBuffer.buffer, audioBuffer.byteOffset, audioBuffer.byteLength / Float32Array.BYTES_PER_ELEMENT);
          const pcm16Buffer = Buffer.alloc(float32Array.length * 2); // Each Int16 is 2 bytes
          for (let i = 0; i < float32Array.length; i++) {
            let val = float32Array[i];
            val = Math.max(-1, Math.min(1, val)); // Clamp to [-1, 1]
            pcm16Buffer.writeInt16LE(Math.round(val * 32767), i * 2);
          }
          dgConnection.send(pcm16Buffer as any); // Send the Node.js Buffer, cast to any to bypass strict type check
        } catch (conversionError) {
            console.error(`Error converting/sending audio for ${connectionId}:`, conversionError);
            // ws.close(1003, "Audio data processing error"); // 1003: Unsupported Data
        }
      } else {
        // console.warn(`Deepgram connection not open for ${connectionId}. Buffering or dropping audio.`);
      }
    });

    ws.on('close', (code, reason) => {
      console.log(`Bot audio WebSocket closed for ${connectionId}. Code: ${code}, Reason: ${reason?.toString()}`);
      if (streamData.deepgramConnection && streamData.deepgramConnection.getReadyState() === 1) {
        console.log(`Finishing Deepgram connection for ${connectionId} due to bot audio socket closure.`);
        streamData.deepgramConnection.finish();
      }
      streamData.botAudioSocket = undefined; // Clear the reference
      streamData.deepgramConnection = undefined; // Clear Deepgram connection reference

      // Optionally notify client via SSE that bot disconnected, if SSE stream is still active
      // This might be handled by the SSE route when Docker process exits.
      // Consider if activeStreams.delete(connectionId) should happen here or elsewhere (e.g. /stop or SSE close)
    });

    ws.on('error', (error) => {
      console.error(`Bot audio WebSocket error for ${connectionId}:`, error);
      if (streamData.deepgramConnection && streamData.deepgramConnection.getReadyState() === 1) {
        console.error(`Finishing Deepgram connection for ${connectionId} due to bot audio socket error.`);
        streamData.deepgramConnection.finish();
      }
      streamData.botAudioSocket = undefined;
      streamData.deepgramConnection = undefined;
      // ws.close() will be called automatically after 'error'
    });
  });

  httpServer
    .once('error', (err) => {
      console.error('HTTP server error:', err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
