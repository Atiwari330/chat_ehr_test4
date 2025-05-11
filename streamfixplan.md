

Epic: Implement Accurate and Smooth Real-Time Transcript Streaming

Goal:
To provide users with a clear, accurate, and real-time display of live audio transcripts within the application. The transcript should update smoothly as words are spoken, with interim results refining the current utterance in place, and new utterances appearing on new lines without duplication or jumbling. This will enhance the user experience for the live meeting transcription feature.

User Story 1: Verify Server-Side SSE Payload Integrity and Enhance Server Logging

Description:
Before modifying the client, we must ensure the server (server.ts and app/api/transcript/stream/route.ts) is correctly packaging and sending all necessary transcript data (segment, isFinal, speechFinal) via Server-Sent Events (SSE). We also need to enhance server-side logging around this process for better observability and future troubleshooting.

Tasks for AI Agent Builder:

Context & File Review:

[x] - Review server.ts.

Purpose: This file handles the WebSocket connection from VexaBot, receives audio, sends it to Deepgram, and processes Deepgram's responses.

Key Sections: Focus on the wss.on('connection', ...) block, specifically the dgConnection.on(LiveTranscriptionEvents.Transcript, ...) handler where Deepgram data is received and prepared for SSE.

Dependencies: lib/active-streams.ts (for streamData.sseStreamController), Deepgram SDK (@deepgram/sdk).

Control: Ensure no changes are made to the Deepgram SDK options (interim_results: true should remain).

[x] - Review app/api/transcript/stream/route.ts.

Purpose: This route establishes the SSE connection with the client and is responsible for spawning the VexaBot Docker container. It receives data from server.ts (indirectly via activeStreams.ts and the sseStreamController).

Key Sections: The ReadableStream's start(controller) method where activeStreams.get(connectionId).sseStreamController = controller is set.

Dependencies: lib/active-streams.ts.

Control: No changes to Docker spawning logic or SSE header setup are needed for this story.

[x] - Review lib/active-streams.ts.

Purpose: Manages shared state for active transcription streams, including the sseStreamController.

Key Sections: How sseStreamController is stored and accessed.

Control: No changes expected here for this story.

Implementation & Verification (Server-Side - server.ts):

[x] - Verify SSE Payload: In server.ts, within the dgConnection.on(LiveTranscriptionEvents.Transcript, ...) handler, confirm that the JSON object being enqueued to streamData.sseStreamController already includes type: 'transcript', segment: transcript, isFinal: data.is_final, and speechFinal: data.speech_final.

Code Snippet for Verification (already exists, just confirm):

// server.ts
// Inside dgConnection.on(LiveTranscriptionEvents.Transcript, (data) => { ... })
// streamData.sseStreamController.enqueue(
//   new TextEncoder().encode(
//     `data: ${JSON.stringify({
//       type: 'transcript',
//       segment: transcript,
//       isFinal: data.is_final,
//       speechFinal: data.speech_final // Ensure this is present
//     })}\n\n`
//   )
// );


[x] - Add Detailed Logging (Server-Side - server.ts):

Before enqueuing to SSE in server.ts, add a console.log to show the exact payload being sent.

Example Log:

// server.ts
// Inside dgConnection.on(LiveTranscriptionEvents.Transcript, (data) => { ... })
const ssePayload = {
  type: 'transcript',
  segment: transcript,
  isFinal: data.is_final,
  speechFinal: data.speech_final
};
console.log(`[SERVER_SSE_SEND ${connectionId}] Payload:`, JSON.stringify(ssePayload)); // New Log
// ... existing enqueue logic ...
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
TypeScript
IGNORE_WHEN_COPYING_END

Log when Deepgram connection opens, closes, or errors, including connectionId.

Example Logs (some may exist, enhance if needed):

// server.ts
dgConnection.on(LiveTranscriptionEvents.Open, () => {
  console.log(`[DEEPGRAM_OPEN ${connectionId}] Deepgram connection opened.`);
});
dgConnection.on(LiveTranscriptionEvents.Error, (error) => {
  console.error(`[DEEPGRAM_ERROR ${connectionId}] Deepgram error:`, error);
  // ... existing SSE error reporting ...
});
dgConnection.on(LiveTranscriptionEvents.Close, (event) => {
  console.log(`[DEEPGRAM_CLOSE ${connectionId}] Deepgram connection closed. Code: ${event.code}, Reason: ${event.reason}`);
  // ... existing SSE status reporting ...
});
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
TypeScript
IGNORE_WHEN_COPYING_END

[x] - Add Logging (API Route - app/api/transcript/stream/route.ts):

Log when the SSE stream starts for a connectionId.

Log when the VexaBot Docker process stdout/stderr emits data, and when it closes/errors, including connectionId.

Example Logs (some may exist, enhance if needed):

// app/api/transcript/stream/route.ts
// Inside ReadableStream start(controller)
console.log(`[STREAM_ROUTE_SSE_START ${connectionId}] SSE stream starting.`);
// ...
botProcess.stdout.on('data', (data) => {
  // ...
  console.log(`[VEXA_STDOUT ${connectionId}] Data: ${line.substring(0, 100)}...`); // New or enhanced log
  // ...
});
botProcess.stderr.on('data', (data) => {
  // ...
  console.error(`[VEXA_STDERR ${connectionId}] Error: ${message}`); // Existing, ensure connectionId
  // ...
});
botProcess.on('close', (code) => {
  console.log(`[VEXA_CLOSE ${connectionId}] VexaBot container exited with code ${code}.`); // Existing, ensure connectionId
  // ...
});
botProcess.on('error', (err) => {
  console.error(`[VEXA_PROC_ERROR ${connectionId}] Failed to start/run Docker:`, err); // Existing, ensure connectionId
  // ...
});
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
TypeScript
IGNORE_WHEN_COPYING_END

Testing & Verification (Human Steps):

[x] - Start the application (pnpm dev).

[x] - Open the application in your browser and initiate a live transcript session with a Google Meet link.

[x] - Observe Terminal Logs (for server.ts):

Look for [SERVER_SSE_SEND <connectionId>] Payload: {...} logs.

Verify that each payload contains type: "transcript", a segment (string), isFinal (boolean), and speechFinal (boolean).

Observe [DEEPGRAM_OPEN], [DEEPGRAM_CLOSE], [DEEPGRAM_ERROR] logs to understand the Deepgram connection state.

[x] - Observe Terminal Logs (for app/api/transcript/stream/route.ts):

Look for [STREAM_ROUTE_SSE_START <connectionId>] when the stream is requested.

Observe [VEXA_STDOUT <connectionId>], [VEXA_STDERR <connectionId>], [VEXA_CLOSE <connectionId>], [VEXA_PROC_ERROR <connectionId>] logs to monitor the VexaBot container.

[x] - Observe Browser Network Tab:

Open browser developer tools, go to the "Network" tab.

Filter for "event-stream" or the /api/transcript/stream?connectionId=... request.

Inspect the "EventStream" tab for this request.

Verify that the data: lines received match the structure logged by [SERVER_SSE_SEND], especially the presence and values of isFinal and speechFinal.

At this stage, the UI will still be "wonky" - that's expected. The focus here is on server-side correctness of the data being sent.

User Story 2: Implement Client-Side Interim and Final Transcript Handling

Description:
Modify the client-side SSE message handler (chat-header.tsx) to correctly process interim and final transcript segments. Interim results should update the current line of text, while final results (indicated by speechFinal: true) should "commit" the current line, and the next utterance should start on a new line.

Tasks for AI Agent Builder:

Context & File Review:

[] - Review components/chat-header.tsx.

Purpose: This component handles the UI for initiating live transcripts and processing incoming SSE messages for transcripts.

Key Sections: The handleStartLiveTranscript function, specifically the evtSource.onmessage handler, and the liveTranscripts state variable (useState<string[]>([])).

Dependencies: React state management (useState, useEffect), potentially toast for notifications.

Control: The goal is to change how setLiveTranscripts is updated.

[] - Review components/live-transcript-modal.tsx.

Purpose: Displays the live transcript.

Key Sections: How it receives and renders the transcripts prop.

Control: No direct code changes here, but its rendering will be affected by changes in chat-header.tsx.

Implementation (components/chat-header.tsx):

[] - Modify evtSource.onmessage Handler:

Inside handleStartLiveTranscript, locate the evtSource.onmessage callback.

Change the logic within if (messageData.type === 'transcript' && messageData.segment) to implement the client-side collapsing strategy.

Recommended Logic (AI's Story 2, adapted):

// components/chat-header.tsx
// Inside evtSource.onmessage = (event) => { ... const messageData = JSON.parse(event.data); ... }

if (messageData.type === 'transcript' && typeof messageData.segment === 'string') {
  const segmentText = messageData.segment.trim();
  const isSpeechFinal = messageData.speechFinal === true; // Ensure boolean comparison

  console.log(`[CLIENT_SSE_RECV ${currentConnectionId}] Segment: "${segmentText}", speechFinal: ${isSpeechFinal}, isFinal: ${messageData.isFinal}`); // New Log

  setLiveTranscripts(prev => {
    if (isSpeechFinal) {
      // Utterance is complete.
      // If the previous line was an interim, finalize it. Otherwise, add new.
      if (prev.length === 0) {
        return [segmentText]; // First final segment
      }
      // Replace the last segment (which was the ongoing interim) with its final version.
      // The *next* interim will then be appended by the logic below.
      return [...prev.slice(0, -1), segmentText];
    } else {
      // Interim result.
      if (prev.length === 0) {
        return [segmentText]; // First interim segment
      }
      // Check if the *previous segment added to the array* was from a `speechFinal: true` event.
      // This is tricky without storing more state about the *previous event type*.
      // For a robust solution, `liveTranscripts` might need to store objects like `{ text: string, wasFinalized: boolean }`.

      // Let's use a common simpler pattern:
      // If the last segment in `prev` was for a *different, already finalized* utterance,
      // then this new interim starts a new line (append).
      // Otherwise (if the last segment was also an interim for the *current* utterance),
      // then this new interim *updates* that last line (replace).

      // To implement this simpler pattern:
      // We need to know if the *last segment that was pushed to `prev`* was due to a `speechFinal: true` event.
      // Let's refine the logic:
      // If the current event is an interim:
      //   - If `prev` is empty, add it.
      //   - If `prev` is not empty:
      //     - We need to know if the *last segment in `prev`* is already "finalized".
      //     - This implies `liveTranscripts` should perhaps store more than just strings,
      //       or we need another state variable to track if the last written line was final.

      // Simplest approach based on AI's Story 2 (interim updates last, final appends):
      // This means the "live typing" happens on the last line.
      // When an utterance is complete (speechFinal: true), that line is "finalized" by being added.
      // The next interim starts updating that new last line.
      // This is a good UX.

      // Corrected logic for AI's Story 2:
      // If speechFinal: append (starts new line for the *next* utterance's interim)
      // If interim: replace last (updates current line)

      // Let's re-evaluate the AI's Story 2 logic:
      // if (msg.isFinal) return [...prev, msg.segment.trim()]; // This was for adding a new line on final
      // // interim -> replace last line or add first
      // return prev.length===0
      // ? [msg.segment]
      // : [...prev.slice(0,-1), msg.segment];

      // Applying this with speechFinal:
      // This means an interim result updates the last line.
      // A speechFinal result *adds* that completed utterance as a new line.
      // The *next* interim will then start updating that newly added last line.
      // This is the most common and good UX.

      // If it's an interim result (speechFinal is false)
      if (prev.length === 0) {
          return [segmentText]; // First interim
      } else {
          // Replace the last segment (which was the previous interim for the current utterance)
          return [...prev.slice(0, -1), segmentText];
      }
    }
  });
} else if (messageData.type === 'status') {
  // ... existing status handling ...
  console.log(`[CLIENT_SSE_STATUS ${currentConnectionId}] Status: ${messageData.message}`); // New Log
} else if (messageData.type === 'error') {
  // ... existing error handling ...
  console.error(`[CLIENT_SSE_ERROR ${currentConnectionId}] Error: ${messageData.message}`); // New Log
}
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
TypeScript
IGNORE_WHEN_COPYING_END

[] - Add Client-Side Logging: Add console.log within the evtSource.onmessage handler in chat-header.tsx to display the received messageData (segment, isFinal, speechFinal) and the state of liveTranscripts before and after setLiveTranscripts is called. This will be crucial for debugging the array manipulation.

Example Log (already incorporated above):

// console.log(`[CLIENT_SSE_RECV ${currentConnectionId}] Segment: "${segmentText}", speechFinal: ${isSpeechFinal}, isFinal: ${messageData.isFinal}`);
// console.log(`[CLIENT_SSE_STATE_BEFORE ${currentConnectionId}] Prev transcripts:`, JSON.stringify(prev));
// const newState = ... // calculate new state
// console.log(`[CLIENT_SSE_STATE_AFTER ${currentConnectionId}] Next transcripts:`, JSON.stringify(newState));
// return newState;
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
TypeScript
IGNORE_WHEN_COPYING_END

Testing & Verification (Human Steps):

[] - Start the application and initiate a live transcript session.

[] - Observe UI in LiveTranscriptModal:

As you speak, verify that the current sentence/utterance appears to "type out" or update on a single line.

When you pause or finish an utterance, that line should become "final."

When you start a new utterance, it should begin on a new line in the modal.

There should be no repeated full sentences or jumbled partial sentences from the same utterance.

[] - Observe Browser Console Logs (for chat-header.tsx):

Look for [CLIENT_SSE_RECV] logs. Confirm speechFinal is false for interim results and true for final results of an utterance.

Examine the [CLIENT_SSE_STATE_BEFORE] and [CLIENT_SSE_STATE_AFTER] logs. Trace how the liveTranscripts array is being modified.

For interim results: Does the last element of the array get replaced?

For speechFinal: true results: Does the last element get finalized, and is the array ready for a new line to be appended for the next utterance's interim? (The AI's Story 2 logic: final appends, interim replaces last. This is simpler and effective.)

[] - Observe Terminal Logs (for server.ts):

Cross-reference with [SERVER_SSE_SEND] logs to ensure the client is receiving what the server sent.

User Story 3: Implement Robust EventSource Lifecycle Management and Error Handling

Description:
Ensure the client-side EventSource is correctly initialized, managed, and cleaned up to prevent memory leaks, multiple connections, or stale data display. Improve error feedback to the user if the SSE connection fails.

Tasks for AI Agent Builder:

Context & File Review:

[] - Review components/chat-header.tsx.

Purpose: Manages the EventSource instance.

Key Sections: handleStartLiveTranscript (where EventSource is created), stopActiveTranscription (where it should be closed), eventSourceRef, and any useEffect hooks related to currentConnectionId or component unmount.

Dependencies: eventSourceRef.

Implementation (components/chat-header.tsx):

[] - Ensure EventSource Closure on Stop/Error/Unmount:

Verify that eventSourceRef.current.close() is called in stopActiveTranscription.

Verify the existing useEffect cleanup hook correctly closes eventSourceRef.current on component unmount.

// components/chat-header.tsx
useEffect(() => {
  // This runs when the component unmounts
  return () => {
    if (eventSourceRef.current) {
      console.log(`[CLIENT_LIFECYCLE ${currentConnectionId || 'N/A'}] Unmounting ChatHeader, closing EventSource.`);
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };
}, []); // Empty dependency array ensures it's for unmount only
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
TypeScript
IGNORE_WHEN_COPYING_END

Add logic to close any existing eventSourceRef.current at the beginning of handleStartLiveTranscript before creating a new one. This prevents multiple open streams if the start button is clicked again.

// components/chat-header.tsx
// At the beginning of handleStartLiveTranscript
if (eventSourceRef.current) {
  console.log(`[CLIENT_LIFECYCLE ${currentConnectionId || 'N/A'}] Starting new transcript, closing existing EventSource.`);
  eventSourceRef.current.close();
  eventSourceRef.current = null;
}
// ... rest of handleStartLiveTranscript
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
TypeScript
IGNORE_WHEN_COPYING_END

[] - Handle EventSource.onerror More Explicitly:

In evtSource.onerror within handleStartLiveTranscript:

Ensure stopActiveTranscription(connectionId, true) is called to attempt server-side cleanup.

Ensure evtSource.close() is explicitly called.

Provide a user-friendly toast notification about the connection failure.

Log the error event object for detailed debugging.

// components/chat-header.tsx
// Inside handleStartLiveTranscript
evtSource.onerror = (errorEvent) => { // errorEvent is of type Event, not necessarily Error
  console.error(`[CLIENT_SSE_ONERROR ${connectionId}] EventSource failed:`, errorEvent);
  toast({ type: 'error', description: 'Connection to transcript server lost. Please try again.' });
  stopActiveTranscription(connectionId, true); // Attempt server cleanup
  // EventSource will automatically try to reconnect unless closed.
  // If we want to stop retries, we must close it.
  if (evtSource) {
    evtSource.close();
    console.log(`[CLIENT_LIFECYCLE ${connectionId}] EventSource explicitly closed on error.`);
  }
  eventSourceRef.current = null; // Clear the ref
  setIsTranscribing(false); // Update UI state
  setCurrentConnectionId(null);
};
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
TypeScript
IGNORE_WHEN_COPYING_END

Testing & Verification (Human Steps):

[] - Test Start/Stop:

Start a live transcript. Observe [CLIENT_LIFECYCLE] logs for EventSource creation.

Stop the transcript using the UI button. Observe [CLIENT_LIFECYCLE] logs for EventSource closure in stopActiveTranscription.

Verify in the browser's Network tab that the EventSource connection is terminated.

[] - Test Component Unmount (Navigate Away):

Start a live transcript.

Navigate to a different page in the application (e.g., home page or another chat).

Observe [CLIENT_LIFECYCLE] logs for EventSource closure due to component unmount.

Verify in the Network tab that the connection is terminated.

[] - Test Starting a New Transcript While One is Active (or after an error):

Start a transcript.

Without stopping, try to start another one (e.g., by closing and reopening the modal and clicking start again, if UI allows, or simulate).

Observe [CLIENT_LIFECYCLE] logs. The old EventSource should be closed before a new one is initiated.

[] - Test Network Interruption:

Start a live transcript.

Simulate a network disconnection (e.g., turn off Wi-Fi, or use browser dev tools to go offline).

Observe [CLIENT_SSE_ONERROR] logs.

Verify a user-friendly toast message appears.

Verify the UI updates to show transcription has stopped (isTranscribing state).

Verify the EventSource connection is closed in the Network tab.

Reconnect the network and try starting a new transcript; it should work without issues from the previous failed connection.
