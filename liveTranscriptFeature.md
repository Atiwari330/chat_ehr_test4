Okay, I've updated your plan, incorporating the feedback and considerations we discussed, with a continued focus on achieving a functional prototype first. I've marked new additions or significant modifications with ✨ for clarity.

Epic: Integrate Live Meeting Transcription into EHR (Prototype Phase)

Goal: To allow users within the EHR application to initiate a live transcription of a Google Meet session, view the streaming transcript in real-time within a modal, and copy the transcript. This integration will incorporate the Vexa Bot codebase for joining meetings and interfacing with the transcription service (WhisperLive).

Guiding Principles for the Agentic AI Builder:

Context First: Before implementing each story, thoroughly review the specified existing files to understand the current architecture, data flow, and relevant components.

Modular Design: Encapsulate new functionalities where possible (e.g., new API routes, new UI components/modals).

Iterative Implementation: Follow the stories and tasks sequentially as they build upon each other.

Comprehensive Logging: Add detailed logging at critical points in both backend and frontend code to aid in development and troubleshooting.

Human-Centric Testing: Each story includes specific testing steps. Perform these diligently to ensure functionality and identify issues early.

✨ Prototype Focus: Prioritize core functionality to demonstrate the end-to-end flow. Refinements and advanced features can be deferred.

Story 1: Vexa Bot Preparation for Integration (Prototype Focus)

User Story: As a system developer, I need to modify the Vexa Bot codebase to output structured transcript data and be configurable for dynamic invocation, so it can be reliably used by the EHR backend for a prototype.

Agentic Builder - Context & Preparation:

[] - Review Vexa Bot Codebase:

Thoroughly examine the vexa-ai-vexa-bot.git (1).txt file contents, focusing on:

core/src/index.ts: Understand how runBot is initiated.

core/src/platforms/google.ts: Specifically, the socket.onmessage handler within startRecording where data from WhisperLive is received. This is the primary modification point.

core/src/docker.ts and cli/src/index.ts: How the bot is configured (via BOT_CONFIG or CLI config file) and executed.

The BOT_CONFIG structure: platform, meetingUrl, botName, token, connectionId, nativeMeetingId, automaticLeave.

[] - Understand Inter-Process Communication (IPC) Goal:

The goal is for the Vexa Bot, when run as a child process, to send structured data (JSON) to its parent process (the EHR backend) via process.stdout.

Implementation Tasks:

[] - Modify Vexa Bot for Structured JSON Output to stdout:

Target file: vexa-ai-vexa-bot.git/core/src/platforms/google.ts (or its equivalent in the actual bot's source code).

Inside the socket.onmessage handler (within startRecording function) that processes messages from WhisperLive:

When a transcript segment is received, construct a JSON object.

✨ Prototype Simplification: For the prototype, the primary goal is to get text through.

Minimum viable JSON: {"type": "transcript_segment", "text": "Hello world."}.

If WhisperLive easily provides speaker/timestamp, include them: {"type": "transcript_segment", "speaker": "Speaker A", "text": "Hello world.", "timestamp": "YYYY-MM-DDTHH:mm:ss.sssZ"}. If not, omit or use defaults (e.g., speaker: "Unknown"). The bot might need to generate its own timestamps if WhisperLive doesn't provide them.

Convert this JSON object to a string.

Print this JSON string to process.stdout, followed by a single newline character (\n). This is critical for line-by-line parsing by the parent.

Add internal logging within the Vexa Bot (e.g., using its log utility) to confirm it's attempting to print this JSON to stdout.

✨ Add basic error handling if data from WhisperLive is malformed before attempting to construct JSON.

[] - Ensure Vexa Bot is Executable with Dynamic Configuration:

Verify that the Vexa Bot can be started (e.g., via its cli/src/index.ts or core/src/docker.ts entry points) and that the meetingUrl and botName can be passed dynamically.

If using the core/dist/docker.js entry point (recommended for EHR spawning), ensure the BOT_CONFIG environment variable is correctly parsed as shown in core/src/docker.ts.

✨ For the prototype, ensure the bot can function even if fields like token, connectionId, nativeMeetingId in BOT_CONFIG are dummy values, as long as it doesn't break the connection to WhisperLive or Google Meet joining.

Testing & Verification (Story 1):

[] - Test Modified Vexa Bot Locally:

Build the modified Vexa Bot.

Run the bot from its command line, configured to join a live Google Meet session (ensure there's audio).

✨ Ensure ws://whisperlive:9090 is accessible or consider a mock for initial stdout tests if WhisperLive setup is complex.

Expected (Terminal - Vexa Bot's stdout):

A stream of newline-delimited JSON strings.

Example:

{"type":"transcript_segment","text":"Testing one two."}
{"type":"transcript_segment","text":"This is a test."}


(or with speaker/timestamp if implemented)

Expected (Terminal - Vexa Bot's internal logs):

Confirmation of meeting join, WhisperLive data reception, and attempts to print JSON to stdout.

[] - Verify Robustness (Simplified for Prototype):

Test with a meeting URL that is invalid.

Expected: The bot should exit, stopping the stdout stream. Perfect error messages are less critical for the prototype than clean exit.

Story 2: EHR Backend API for Vexa Bot Invocation and Transcript Relaying (Prototype Focus)

User Story: As an EHR backend system, I need an API endpoint that can receive a meeting URL, invoke the prepared Vexa Bot, capture its structured transcript output, and stream this data to a connected client for a prototype demonstration.

Agentic Builder - Context & Preparation:

[] - Review EHR Backend Chat API & Streaming:

File: app/(chat)/api/chat/route.ts.

Focus on createDataStream and API route structure.

[] - Node.js Child Process Management:

child_process.spawn.

Listening to stdout, stderr, error, and exit/close.

[] - Authentication and Error Handling Patterns in EHR:

Review auth() usage and basic error responses.

Implementation Tasks:

[] - Create New EHR API Route File:

Create app/api/live-transcription/route.ts.

[] - Implement POST Handler in /api/live-transcription/route.ts:

Accept JSON body: { "meetingUrl": "google_meet_url_here" }.

Authentication: Implement user authentication (copy pattern from app/(chat)/api/chat/route.ts).

Vexa Bot Invocation:

Use child_process.spawn.

Command: node.

Arguments: [<path_to_vexa_bot_project>/core/dist/docker.js]. ✨ For prototype, this path can be relative/absolute for local dev.

Environment Variables (BOT_CONFIG):

Include meetingUrl from request.

botName: e.g., "EHR_TranscriptBot_Proto".

✨ token, connectionId, nativeMeetingId: Use "dummy" or placeholder values. Ensure these don't break basic bot operation or WhisperLive handshake if it's sensitive to them.

platform: "google_meet".

automaticLeave: Use default values from bot's example config.

Log the command, args, and environment variables.

Data Streaming Setup (Vercel AI SDK):

Use createDataStream().

Process Vexa Bot's stdout:

Inside createDataStream's execute function:

Listen to the bot's stdout. Use readline or similar for line-by-line JSON.

For each line:

Attempt JSON.parse.

If successful, dataStream.writeData({ type: 'live_transcript_delta', content: parsedJsonObject });.

Log received and sent data.

✨ If JSON parsing fails, log the error and the line. For prototype, can send a simplified error down the stream: dataStream.writeData({ type: 'live_transcript_parse_error', content: { message: 'Error parsing bot output' } });.

Handle Vexa Bot Process Lifecycle Events:

✨ Listen to stderr: Log any output from the bot's stderr in the EHR backend logs. This is crucial for debugging the bot.

On error (spawn error): Log. dataStream.writeData({ type: 'live_transcript_error', content: { message: 'Bot process failed to start', details: error.message } });.

On exit/close: Log exit code. dataStream.writeData({ type: 'live_transcript_finish', content: { message: 'Transcription ended.' } });. Call dataStream.close();.

✨ Process Cleanup (Simplified for Prototype): Acknowledge that for a prototype, manual cleanup of bot processes might be needed if the stream is aborted by the client. Full cleanup (killing child process on stream abort) can be deferred.

Return the Response object with the stream.

[] - (Deferred) DELETE Handler: Not essential for prototype.

Testing & Verification (Story 2):

[] - Test API with a Streaming Client:

Ensure Vexa Bot (Story 1) is built and accessible.

POST to /api/live-transcription with a Google Meet URL.

Expected (EHR Backend Logs):

API hit, auth success.

child_process.spawn details.

"Vexa Bot process started...".

✨ Logs from Vexa Bot's stderr (if any).

"Received from Vexa Bot stdout: [parsed JSON]".

"Sent to client stream: [parsed JSON]".

"Vexa Bot process exited...".

"Sent live_transcript_finish...".

Expected (Client Output Stream):

Stream of data: {"type":"live_transcript_delta", ...}\n\n.

Eventually data: {"type":"live_transcript_finish", ...}\n\n.

[] - Test Error Case (Bot Fails to Start):

Expected (EHR Backend Logs): child_process.spawn error.

Expected (Client Output Stream): live_transcript_error or graceful connection failure.

[] - Test Error Case (Bot Crashes Mid-Stream):

Expected (EHR Backend Logs): Bot exit log.

Expected (Client Output Stream): Stream terminates with live_transcript_finish or live_transcript_error.

Story 3: Frontend - UI for Initiating and Displaying Live Transcript (Prototype Focus)

User Story: As a clinician, I want to click a button, enter a Google Meet URL, and see a modal open up where live transcription will be displayed, demonstrating the core real-time feed for a prototype.

Agentic Builder - Context & Preparation:

[] - Review EHR UI Components:

Modals (components/transcript-upload-modal.tsx), buttons (components/ui/button.tsx).

[] - Review EHR Chat API Client-Side Usage:

How app/(chat)/api/chat/route.ts is called and streams handled (e.g., components/chat.tsx).

✨ Consider if useChat is appropriate or if direct fetch with manual stream reading is simpler for this non-chat-like stream. For prototype, simpler might be better.

Implementation Tasks:

[] - Create "Start Live Transcript" Button:

✨ Place this button in an accessible, even if temporary, location in the UI (e.g., components/chat-header.tsx or a new test page). Client association can be deferred for the prototype.

Log button click.

[] - Create Meeting URL Input Modal:

On button click, show modal.

Title, URL input, "Start Transcription" button, "Cancel" button.

Basic "not empty" URL validation.

Log modal interactions.

[] - Create Live Transcript Display Modal:

Shown after URL submission.

Title, scrollable <div> for transcript, "Copy Transcript" button (functionality in Story 4), "Close" button.

✨ "Stop Transcription" button can just close the modal for the prototype.

Log modal open.

[] - Implement API Call and Stream Handling (Client-Side):

On "Start Transcription" click:

POST to /api/live-transcription with meetingUrl.

Handle streaming response:

On live_transcript_delta, append content.text to the display area. ✨ Basic formatting (new line per segment) is sufficient for prototype.

Ensure display area auto-scrolls.

On live_transcript_finish, show "Transcription ended."

Basic error display in modal if API call or stream fails.

Log API request, stream data, UI updates, errors.

Open Live Transcript Display Modal on stream initiation.

Testing & Verification (Story 3):

[] - UI Element Verification:

Button visible -> URL Modal appears.

Enter URL, click "Start".

Expected (Browser Console Logs): Button/modal logs, API POST log.

Expected (Browser Network Tab): POST request, streaming response.

Expected (UI):

URL Modal closes, Transcript Display Modal opens.

✨ Transcript text (even if unformatted initially) appears in real-time.

View scrolls.

[] - Error Handling (UI - Basic):

Invalid URL / backend error.

Expected: Modal shows a simple error message.

[] - Modal Closure:

"Close" button works. ✨ Stream cleanup on client-side (aborting fetch) is good, but less critical for prototype if backend bot eventually times out.

Story 4: Basic Transcript Display Formatting and Copy Functionality (Prototype Focus)

User Story: As a clinician viewing the live transcript, I want the text to be minimally formatted, and I want a button to easily copy the entire accumulated transcript.

Agentic Builder - Context & Preparation:

[] - Review Client-Side Stream Handling (from Story 3).

[] - Research Clipboard API (navigator.clipboard.writeText()).

Implementation Tasks:

[] - Refine Transcript Display (Basic):

Client-side: When appending segments from live_transcript_delta:

✨ If content.speaker is available and simple to integrate, prepend it (e.g., <div><strong>{content.speaker || 'Unknown'}:</strong> {content.text}</div>). Otherwise, just display content.text.

Ensure each new segment appears on a new line.

Log formatting.

[] - Implement "Copy Transcript" Button Functionality:

In Live Transcript Display Modal:

On click: Collect all displayed text.

Concatenate into a single string (maintain line breaks).

Use navigator.clipboard.writeText().

✨ Simple feedback (e.g., alert('Copied!') or console log) is fine for prototype.

Log copy action.

[] - State Management for Accumulated Transcript:

Maintain accumulated transcript text in a client-side state variable for the copy function.

Testing & Verification (Story 4):

[] - Formatted Display Verification (Basic):

Start transcription.

Expected (UI): Segments appear on new lines. Speaker prefix if implemented.

Expected (Browser Console Logs): Logs of received deltas.

[] - Copy Functionality Test:

Accumulate transcript, click "Copy".

Expected (UI): Basic copy feedback.

Paste into editor.

Expected (Text Editor): Pasted text matches modal content.

[] - Copy Empty/Partial Transcript:

Expected: Works without errors.

(Further stories for persisting transcripts, advanced speaker diarization, robust error recovery, proper bot lifecycle management, client association, and deployment considerations can be added after this prototype phase.)