# Epic: Implement Live Google Meet Transcription in Chat EHR

## Phase 0: Vexa Bot Setup, Build, and IPC Configuration

- [x] **Story: Clone Vexa Bot Repository:**
    - As a developer, I need to clone the Vexa Bot repository into the `chat_ehr_test4` project directory.
    - *Action:* User navigated to `c:/Users/Adi/Desktop/chat_ehr_test4/` and ran `git clone https://github.com/Vexa-ai/vexa-bot.git`. (Resulting folder: `vexa-bot`).
    - *Verification:* The directory `c:/Users/Adi/Desktop/chat_ehr_test4/vexa-bot/` exists and contains the bot's source code.
- [x] **Story: Install Vexa Bot Core Dependencies:**
    - As a developer, I need to install the dependencies for the Vexa Bot core module.
    - *Action:* User navigated to `c:/Users/Adi/Desktop/chat_ehr_test4/vexa-bot/core` and ran `pnpm install`.
    - *Verification:* `node_modules` directory created in `core`, and installation completed successfully.
- [x] **Story: Build Vexa Bot Core Module:**
    - As a developer, I need to build the Vexa Bot core TypeScript project.
    - *Action:* User, from `c:/Users/Adi/Desktop/chat_ehr_test4/vexa-bot/core`, ran `pnpm run build`.
    - *Verification:* The `c:/Users/Adi/Desktop/chat_ehr_test4/vexa-bot/core/dist` directory was created and contains `docker.js`, `index.js`, etc.
- [x] **Story: Configure Absolute Path for Vexa Bot Executable:**
    - As a developer, I need to define an environment variable in the EHR application's `.env.local` file to store the absolute path to the Vexa Bot's main executable.
    - *Action:* User added `VEXA_BOT_DOCKER_SCRIPT_PATH=c:/Users/Adi/Desktop/chat_ehr_test4/vexa-bot/core/dist/docker.js` to `.env.local`. (Note: This env var is not directly used when spawning Docker image by name, but good for reference).
    - *Verification:* The variable was set in `.env.local`.
- [x] **Story: Basic Vexa Bot Docker Container Test (Manual):**
    - As a developer, I need to manually test running the Vexa Bot via its Dockerfile to ensure the image builds and the bot can be started with a sample `BOT_CONFIG`.
    - *Action:*
        - User navigated to `c:/Users/Adi/Desktop/chat_ehr_test4/vexa-bot/core`.
        - Cline created `.dockerignore` file.
        - User converted `entrypoint.sh` line endings to LF using `sed`.
        - User ran `docker build -t vexa-bot-test .` successfully.
        - User ran `docker run --rm -e BOT_CONFIG='...' vexa-bot-test` successfully, observing bot logs and successful execution until timeout/completion.
    - *Verification:* Docker image built, container started, `entrypoint.sh` executed, and bot logs appeared, confirming the bot runs and parses `BOT_CONFIG`.

## Phase I: Frontend - UI Elements

- [x] **Story: Add "Collect Live Transcript" Button** (`components/chat-header.tsx`)
    - *Action:* Cline added a button with `MicIcon` to `ChatHeader`, visible when `chatId` exists and not `isReadonly`.
    - *Verification:* Code for button and conditional visibility added.
- [x] **Story: Create "Start Live Transcript" Modal** (`components/live-transcript-modal.tsx`, `components/chat-header.tsx`)
    - *Action:* Cline created `LiveTranscriptModal` with input for Google Meet link and Start/Cancel buttons. Integrated state and click handler in `ChatHeader` to open this modal.
    - *Verification:* Modal component created and integrated into ChatHeader.
- [x] **Story: Display Live Transcript Stream in UI** (`components/live-transcript-modal.tsx`)
    - *Action:* Cline added state for `liveTranscripts` in `ChatHeader` and passed it to `LiveTranscriptModal`. Modal updated with a scrollable area to display incoming transcript segments and a "Stop Transcription" button. `handleStartLiveTranscript` in `ChatHeader` updated to simulate receiving segments after API call.
    - *Verification:* Modal has UI for displaying transcripts; simulation logic in place.

## Phase II: Backend - API Endpoint & Bot Integration

- [x] **Story: Create API Endpoint to Start Bot:**
    - As a developer, I need an API endpoint (e.g., `/api/transcript/start`) that accepts a Google Meet URL.
    - *Action:* Cline created `app/api/transcript/start/route.ts` with a `POST` handler. It uses `vexa-bot-test` as the Docker image name.
    - *Verification:* API route file created.
- [x] **Story: API Endpoint Validates Meet Link & Constructs `BOT_CONFIG`:**
    - As a developer, the `/api/transcript/start` endpoint should validate the Google Meet URL and construct the `BOT_CONFIG` JSON string.
    - *Action:* Cline implemented link validation. User installed `uuid` for `connectionId`. Cline constructed `BOT_CONFIG` including `platform`, `meetingUrl`, `botName`, placeholder `token`, `connectionId`, `nativeMeetingId`, and `automaticLeave` settings in the API route.
    - *Verification:* Logic for validation and config construction is in place in the API route.
- [x] **Story: API Endpoint Launches Vexa Bot Docker Container:**
    - As a developer, the API endpoint should execute the `docker run` command with the `vexa-bot-test` image and the constructed `BOT_CONFIG` passed as an environment variable.
    - *Action:* Cline used Node.js `child_process.spawn` in the API route to execute `docker run --rm --name=vexa-bot-session-<connectionId> -e BOT_CONFIG='<json_config>' vexa-bot-test`. Added listeners for `stdout`, `stderr`, `close`, and `error` events from the spawned process. `handleStartLiveTranscript` in `ChatHeader` updated to call this API.
    - *Verification:* Docker spawning logic implemented and tested successfully by user via UI, confirming API call and bot launch.

## Phase III: Backend - Transcript Streaming & Handling

- [ ] **Story: Modify Vexa Bot to Send Transcripts via WebSocket to Next.js Backend** (`vexa-ai-vexa-bot.git/core/src/platforms/google.ts` or `transcript-adapter.js`)
- [ ] **Story: Create WebSocket Endpoint in Next.js for Receiving Transcripts** (Custom server setup or library in Next.js)
- [ ] **Story: Stream Transcripts from Next.js Backend to Frontend** (Next.js WebSocket handler, `components/live-transcript-modal.tsx`)

## Phase IV: Bot & System Management

- [ ] **Story: Ensure Vexa Bot Docker Image is Built and Available** (DevOps/Build process for `vexa-bot` image)
- [ ] **Story: Handle Bot Stop/Cleanup** (`components/live-transcript-modal.tsx`, `app/api/transcript/stop/route.ts` (new))
