# Live Google Meet Transcription Feature (Phase III) - Implementation Plan

This document outlines the sequential steps to implement the live Google Meet transcription feature, streaming transcripts from a Vexa Bot, through the Next.js backend (using Deepgram for ASR), to the client's UI via Server-Sent Events (SSE).

**Overall Architecture:**

1.  **Client (Browser):** Initiates transcription, connects to SSE stream, displays transcripts in `LiveTranscriptModal`.
2.  **Next.js API (`POST /api/transcript/start`):** Validates, generates `connectionId`, stores `BOT_CONFIG` (including `connectionId` and `wsUrl` for audio intake). Does NOT spawn Docker.
3.  **Next.js API (`GET /api/transcript/stream` - SSE):** Client connects via `EventSource`. Retrieves `BOT_CONFIG`, spawns Vexa Bot (Docker). Manages SSE stream, sending transcript segments (received from audio intake handler) and bot status updates to the client. Monitors Vexa Bot STDOUT for info/error logs.
4.  **Next.js Backend (WebSocket Server - `/ws/bot-audio-intake`):** Vexa Bot connects here (identified by `connectionId`). Receives raw audio from bot, sends to Deepgram, receives transcripts from Deepgram, forwards transcripts to the corresponding SSE stream handler.
5.  **Vexa Bot (Docker):** Joins Google Meet, captures audio, streams raw audio to Next.js WebSocket audio intake endpoint. Logs info/debug/errors to STDOUT as structured JSON.
6.  **Next.js API (`POST /api/transcript/stop`):** Terminates Docker, Deepgram connection, SSE stream, and cleans up resources.

**Shared State Management (Next.js Backend):**

*   A shared module (e.g., `lib/active-streams.ts`) will manage an `activeStreams` Map (`Map<string, ActiveStreamData>`) to store state for each `connectionId` (e.g., `BOT_CONFIG`, Docker process, SSE controller, bot audio WebSocket, Deepgram connection).

---

## Implementation Checklist:

### **Phase 3.1: Modify Vexa Bot**

*   **Target Files:**
    *   `vexa-bot/core/src/types.ts`
    *   `vexa-bot/core/src/docker.ts`
    *   `vexa-bot/core/src/platforms/google.ts`

*   **Tasks:**
    *   [ ] **`types.ts`:** Add `wsUrl: string;` to the `BotConfig` interface/type.
    *   [ ] **`docker.ts`:** Update the Zod schema `BotConfigSchema` to include `wsUrl: z.string().url()`.
    *   [ ] **`platforms/google.ts` (within `page.evaluate` in `startRecording`):**
        *   [ ] Retrieve `wsUrl` and `connectionId` from the `config` (BotConfig) object passed into `page.evaluate`.
        *   [ ] Change the WebSocket connection URL from the hardcoded `ws://whisperlive:9090` to the dynamic `config.wsUrl` (which will be like `ws://host.docker.internal:PORT/ws/bot-audio-intake?connectionId=${config.connectionId}`).
        *   [ ] Review and simplify/remove the existing WebSocket handshake payload previously sent to `whisperlive`. The primary identification will now be the `connectionId` in the `wsUrl`'s query parameters.
        *   [ ] Modify all `(window as any).logBot("message")` calls to output structured JSON strings.
            *   Example for info: `(window as any).logBot(JSON.stringify({ type: "info", source: "vexa-bot", timestamp: new Date().toISOString(), message: "Navigated to meet." }));`
            *   Example for error: `(window as any).logBot(JSON.stringify({ type: "error", source: "vexa-bot", timestamp: new Date().toISOString(), message: "Failed to find element X", details: "..." }));`
            *   **Note:** Transcript data will *not* be sent via these logs.
        *   [ ] Ensure the existing audio capture logic (`Float32Array` from `recorder.onaudioprocess`) correctly sends this audio data over the *new* WebSocket connection to `config.wsUrl`.

---

### **Phase 3.2: Implement Next.js Backend - WebSocket Audio Intake & Deepgram Integration**

*   **Target Files/Modules:**
    *   New: `lib/active-streams.ts`
    *   New/Modified: `server.js` (or equivalent custom Next.js server setup file)
    *   New: Module for WebSocket connection handling logic (e.g., `lib/websocket-audio-handler.ts`)

*   **Tasks:**
    *   [ ] **Create `lib/active-streams.ts`:**
        *   [ ] Define the `ActiveStreamData` interface:
            ```typescript
            // lib/active-streams.ts
            import type { ChildProcess } from 'child_process';
            import type { WebSocket } from 'ws';
            // import type { LiveTranscriptionEvents } from '@deepgram/sdk'; // Or the specific type for Deepgram connection
            import type { BotConfig } from '@/vexa-bot/core/src/types'; // Adjust path if necessary

            export interface ActiveStreamData {
              botConfig: BotConfig;
              sseStreamController?: ReadableStreamDefaultController<Uint8Array>;
              botAudioSocket?: WebSocket; // WebSocket connection from the Vexa Bot
              deepgramConnection?: any; // Instance of Deepgram live transcription
              dockerProcess?: ChildProcess;
              // Add any other necessary state, e.g., for Deepgram event listeners
            }

            export const activeStreams = new Map<string, ActiveStreamData>();
            ```
    *   [ ] **Setup Custom Next.js Server (`server.js` or equivalent):**
        *   [ ] Ensure a custom server is set up to run Next.js.
        *   [ ] Import `ws.Server`.
        *   [ ] Attach the `ws.Server` instance to the same HTTP server that Next.js uses.
        *   [ ] Configure the `ws.Server` to handle upgrade requests specifically for the path `/ws/bot-audio-intake`.
    *   [ ] **Implement WebSocket Connection Handler Logic (for `/ws/bot-audio-intake`):**
        *   [ ] On a new WebSocket connection from Vexa Bot:
            *   [ ] Extract `connectionId` from the WebSocket request URL query parameters.
            *   [ ] Validate `connectionId`: Check if it exists as a key in `activeStreams`. If not, or if `botAudioSocket` is already set, close the new connection with an error.
            *   [ ] Store the new bot WebSocket: `activeStreams.get(connectionId)!.botAudioSocket = ws;`.
            *   [ ] Initialize Deepgram SDK: `const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);`.
            *   [ ] Establish Deepgram Live Transcription connection:
                *   `const dgConnection = deepgram.listen.live({ model: 'nova-2', smart_format: true, interim_results: true, language: 'en-US', punctuate: true, encoding: 'linear16', sample_rate: 16000, channels: 1 });`
                *   Store it: `activeStreams.get(connectionId)!.deepgramConnection = dgConnection;`.
            *   [ ] **Deepgram `on('open', ...)`:** Log successful Deepgram connection.
            *   [ ] **Deepgram `on('transcript', (data) => { ... })`:**
                *   Extract `transcript = data.channel.alternatives[0].transcript;`.
                *   Check `data.is_final` (or handle interim results as needed).
                *   Retrieve `sseStreamController` from `activeStreams.get(connectionId)`.
                *   If controller exists, `sseStreamController.enqueue(\`data: ${JSON.stringify({ type: "transcript", segment: transcript, isFinal: data.is_final })}\\n\\n\`);`.
            *   [ ] **Deepgram `on('error', ...)`:** Log error. Send an error event via SSE to the client (e.g., `{ type: "error", source: "deepgram", message: "..." }`).
            *   [ ] **Deepgram `on('close', ...)`:** Log closure. Potentially notify client via SSE.
        *   [ ] **Bot WebSocket `on('message', (message) => { ... })`:**
            *   Assume `message` is binary audio data from Vexa Bot (e.g., `ArrayBuffer` if `ws` library is configured for binary).
            *   Convert the incoming `Float32Array` audio data to a 16-bit PCM `Buffer`.
                *   Example: `const float32Array = new Float32Array(message as ArrayBuffer); ... convert to Int16Array ... Buffer.from(int16Array.buffer);`
            *   If `dgConnection` is open, send the audio buffer: `dgConnection.send(audioBuffer);`.
        *   [ ] **Bot WebSocket `on('close', ...)` and `on('error', ...)`:**
            *   Log the event.
            *   If `deepgramConnection` exists, call `deepgramConnection.finish();`.
            *   Clean up `botAudioSocket` and `deepgramConnection` from `activeStreams` for that `connectionId`.
            *   Optionally, send a "bot_disconnected" or error event to the client via SSE.

---

### **Phase 3.3: Implement Next.js Backend - SSE Route & Refactor `/api/transcript/start`**

*   **Target Files:**
    *   `app/api/transcript/start/route.ts` (Refactor)
    *   New: `app/api/transcript/stream/route.ts` (SSE)

*   **Tasks for `POST /api/transcript/start/route.ts` (Refactor):**
    *   [ ] Remove Docker spawning logic.
    *   [ ] Generate a unique `connectionId` (e.g., using `uuidv4` or `crypto.randomUUID()`).
    *   [ ] Construct the full `wsUrl` for the audio intake endpoint (e.g., `ws://localhost:3000/ws/bot-audio-intake?connectionId=${connectionId}` for dev, or use environment variables for host/port in production).
    *   [ ] Construct the `BOT_CONFIG` object, ensuring it includes the generated `connectionId` and the `wsUrl`.
    *   [ ] Store the `BOT_CONFIG` in the shared `activeStreams` map: `activeStreams.set(connectionId, { botConfig: constructedBotConfig });`.
    *   [ ] Return a JSON response to the client: `{ connectionId }` with status 200.

*   **Tasks for `GET /api/transcript/stream/route.ts` (New SSE Route):**
    *   [ ] Set appropriate headers for SSE: `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`.
    *   [ ] Extract `connectionId` from the request URL query parameters.
    *   [ ] Validate `connectionId`: Check if it exists in `activeStreams` and if `sseStreamController` is not already set. If invalid, return an error response.
    *   [ ] Retrieve `botConfig` from `activeStreams.get(connectionId)`. If not found, return error.
    *   [ ] Create a `ReadableStream` for the SSE response.
        *   In the `start(controller)` method of the stream:
            *   Store the `controller`: `activeStreams.get(connectionId)!.sseStreamController = controller;`.
            *   Send an initial "connected" event to the client if desired: `controller.enqueue(\`data: ${JSON.stringify({ type: "status", message: "SSE connection established" })}\\n\\n\`);`.
            *   Spawn the Vexa Bot Docker container using `child_process.spawn`. Pass the `botConfig` (retrieved from `activeStreams`) as the `BOT_CONFIG` environment variable to Docker.
            *   Store the `ChildProcess` object: `activeStreams.get(connectionId)!.dockerProcess = botProcess;`.
            *   **Vexa Bot `botProcess.stdout.on('data', (data) => { ... })`:**
                *   Assume `data` is a line of structured JSON log from the bot.
                *   Parse the JSON: `const logEntry = JSON.parse(data.toString());`.
                *   If `logEntry.type === "info"` or `"error"`, enqueue it to the SSE stream: `controller.enqueue(\`data: ${JSON.stringify(logEntry)}\\n\\n\`);`.
            *   **Vexa Bot `botProcess.stderr.on('data', ...)`:** Log stderr and potentially send as error events via SSE.
            *   **Vexa Bot `botProcess.on('close', (code) => { ... })`:**
                *   Log bot exit.
                *   Send a "bot_exited" event via SSE: `controller.enqueue(\`data: ${JSON.stringify({ type: "status", message: \`Bot exited with code ${code}\` })}\\n\\n\`);`.
                *   Call `controller.close();`.
                *   Trigger full cleanup for this `connectionId` (see Phase 3.4).
            *   **Vexa Bot `botProcess.on('error', (err) => { ... })`:** Log error, send error event via SSE, close controller, trigger cleanup.
        *   In the `cancel(reason)` method of the stream (client disconnected):
            *   Log client disconnect.
            *   Trigger full cleanup for this `connectionId`.
    *   [ ] Return `new Response(readableStream, { headers })`.

---

### **Phase 3.4: Implement `/api/transcript/stop` Endpoint & Client-Side Stop Logic**

*   **Target Files:**
    *   New: `app/api/transcript/stop/route.ts`
    *   `components/chat-header.tsx` (or wherever `EventSource` is managed)
    *   `components/live-transcript-modal.tsx`

*   **Tasks for `POST /api/transcript/stop/route.ts` (New API Route):**
    *   [ ] Extract `connectionId` from request (e.g., query param or request body).
    *   [ ] Retrieve `ActiveStreamData` from `activeStreams.get(connectionId)`.
    *   [ ] If found:
        *   [ ] If `dockerProcess` exists, kill it: `dockerProcess.kill();`.
        *   [ ] If `deepgramConnection` exists, finish it: `deepgramConnection.finish();`.
        *   [ ] If `botAudioSocket` exists and is open, close it.
        *   [ ] If `sseStreamController` exists, close it: `sseStreamController.close();` (if not already closed).
        *   [ ] Remove the entry: `activeStreams.delete(connectionId);`.
        *   [ ] Return success response (e.g., 200 OK).
    *   [ ] If not found, return appropriate error (e.g., 404 Not Found).

*   **Tasks for Frontend Client (e.g., `components/chat-header.tsx`):**
    *   [ ] Store the `EventSource` instance (e.g., in a `useRef`).
    *   [ ] Implement a function `stopActiveTranscription(connectionIdToStop)`:
        *   [ ] If `EventSource` ref exists and corresponds to `connectionIdToStop`, call `eventSourceRef.current.close();`.
        *   [ ] Make a `POST` request to `/api/transcript/stop?connectionId=${connectionIdToStop}`.
        *   [ ] Update UI state (e.g., `isTranscribing = false`, clear `liveTranscripts`).
    *   [ ] **`LiveTranscriptModal`:**
        *   The "Stop Transcription" button should call this `stopActiveTranscription` function (passed via props or context from `ChatHeader`).
        *   When the modal is closed (via 'x', 'Cancel', or Esc), also call `stopActiveTranscription` if a transcription is active for the current `connectionId`.

---

### **Phase 3.5: Frontend UI Updates for SSE**

*   **Target Files:**
    *   `components/chat-header.tsx` (or state management location)
    *   `components/live-transcript-modal.tsx`

*   **Tasks for `components/chat-header.tsx` (or equivalent state manager):**
    *   [ ] Maintain state for `liveTranscripts: string[]` and `currentConnectionId: string | null`.
    *   [ ] In `handleStartLiveTranscript` (after `POST /api/transcript/start` succeeds and returns `connectionId`):
        *   [ ] Set `currentConnectionId`.
        *   [ ] Clear previous `liveTranscripts`.
        *   [ ] Create `const evtSource = new EventSource(\`/api/transcript/stream?connectionId=\${connectionId}\`);`.
        *   [ ] Store `evtSource` in a `useRef`.
        *   [ ] **`evtSource.onmessage = (event) => { ... }`:**
            *   `const messageData = JSON.parse(event.data);`
            *   If `messageData.type === "transcript"`:
                *   Append `messageData.segment` to the `liveTranscripts` state array.
            *   If `messageData.type === "status"` or `"error"`:
                *   Display toast or update modal UI with `messageData.message`.
                *   If it's a terminal error/status (e.g., "bot_exited"), consider closing `evtSource` and resetting UI.
        *   [ ] **`evtSource.onerror = (err) => { ... }`:**
            *   Log error.
            *   Update UI (e.g., show error toast "Connection to transcript server lost").
            *   Call `stopActiveTranscription` for cleanup.
    *   [ ] Pass `liveTranscripts` array to `LiveTranscriptModal` as a prop.
    *   [ ] Ensure `stopActiveTranscription` function is callable by the modal.

---

This checklist should provide a very clear path forward.