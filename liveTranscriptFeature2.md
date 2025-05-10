# Epic: Implement Live Google Meet Transcription in Chat EHR

## Phase 0: Vexa Bot Setup, Build, and IPC Configuration

- [x] **Story: Clone Vexa Bot Repository:**
    - As a developer, I need to clone the Vexa Bot repository into the `chat_ehr_test4` project directory.
    - *Action:* Navigate to `c:/Users/Adi/Desktop/chat_ehr_test4/` and run `git clone https://github.com/Vexa-ai/vexa-bot.git`. (Used `vexa-bot` as the directory name).
    - *Verification:* The directory `c:/Users/Adi/Desktop/chat_ehr_test4/vexa-bot/` exists and contains the bot's source code.
- [x] **Story: Install Vexa Bot Core Dependencies:**
    - As a developer, I need to install the dependencies for the Vexa Bot core module.
    - *Action:* Navigate to `c:/Users/Adi/Desktop/chat_ehr_test4/vexa-bot/core` and run `pnpm install`.
    - *Verification:* `node_modules` directory is created in `core`, and no critical installation errors occur.
- [x] **Story: Build Vexa Bot Core Module:**
    - As a developer, I need to build the Vexa Bot core TypeScript project.
    - *Action:* From `c:/Users/Adi/Desktop/chat_ehr_test4/vexa-bot/core`, run `pnpm run build`.
    - *Verification:* The `c:/Users/Adi/Desktop/chat_ehr_test4/vexa-bot/core/dist` directory is created and contains `docker.js`, `index.js`, and other compiled JavaScript files and type definitions.
- [x] **Story: Configure Absolute Path for Vexa Bot Executable:**
    - As a developer, I need to define an environment variable in the EHR application's `.env.local` file to store the absolute path to the Vexa Bot's main executable.
    - *Action:* Add `VEXA_BOT_DOCKER_SCRIPT_PATH=c:/Users/Adi/Desktop/chat_ehr_test4/vexa-bot/core/dist/docker.js` to `.env.local`.
    - *Verification:* The variable is set in `.env.local`.
- [x] **Story: Basic Vexa Bot Docker Container Test (Manual):**
    - As a developer, I need to manually test running the Vexa Bot via its Dockerfile to ensure the image builds and the bot can be started with a sample `BOT_CONFIG`.
    - *Action:*
        - Navigate to `c:/Users/Adi/Desktop/chat_ehr_test4/vexa-bot/core`.
        - Create/update `.dockerignore` to exclude `node_modules`, `.git`, `.gitignore`, `dist`.
        - Convert `entrypoint.sh` line endings to LF.
        - Run `docker build -t vexa-bot-test .`
        - Run `docker run --rm -e BOT_CONFIG='{"platform": "google_meet", "meetingUrl": "https://meet.google.com/xxx-xxxx-xxx", "botName": "ManualTestBot", "token": "testtoken", "connectionId": "testconnid", "nativeMeetingId": "xxx-xxxx-xxx", "automaticLeave": {"waitingRoomTimeout": 30000, "noOneJoinedTimeout": 30000, "everyoneLeftTimeout": 30000}}' vexa-bot-test`.
    - *Verification:* Docker image builds, container starts, `entrypoint.sh` executes, and initial bot logs appear, confirming the bot runs and can parse `BOT_CONFIG`.

## Phase I: Frontend - UI Elements

- [x] **Story: Add "Collect Live Transcript" Button** (`components/chat-header.tsx`)
    - *Action:* Added a button with `MicIcon` to `ChatHeader`, visible when `chatId` exists and not `isReadonly`.
    - *Verification:* Button appears as expected.
- [x] **Story: Create "Start Live Transcript" Modal** (`components/live-transcript-modal.tsx`, `components/chat-header.tsx`)
    - *Action:* Created `LiveTranscriptModal` with input for Google Meet link and Start/Cancel buttons. Integrated state and click handler in `ChatHeader` to open this modal.
    - *Verification:* Modal opens on button click, form elements are present.
- [x] **Story: Display Live Transcript Stream in UI** (`components/live-transcript-modal.tsx`)
    - *Action:* Added state for `liveTranscripts` in `ChatHeader` and passed it to `LiveTranscriptModal`. Modal now has a scrollable area to display incoming transcript segments and a "Stop Transcription" button. `handleStartLiveTranscript` in `ChatHeader` simulates receiving segments.
    - *Verification:* Modal can display simulated transcript segments.

## Phase II: Backend - API Endpoint & Bot Integration

- [ ] **Story: Create API Endpoint to Start Bot:**
    - As a developer, I need an API endpoint (e.g., `/api/transcript/start`) that accepts a Google Meet URL.
    - *Action:*
        - Create `app/api/transcript/start/route.ts`.
        - The route should read `process.env.VEXA_BOT_DOCKER_SCRIPT_PATH`. If not set, log a critical error and return 500.
    - *Files to create:* `app/api/transcript/start/route.ts`.
- [ ] **Story: API Endpoint Validates Meet Link & Constructs `BOT_CONFIG`:**
    - As a developer, the `/api/transcript/start` endpoint should validate the Google Meet URL and construct the `BOT_CONFIG` JSON string.
    - *Action:* Include `meetingUrl`, `botName` (e.g., "EHRVexaBot"), `token` (if your EHR system uses tokens for such services, otherwise a placeholder), `connectionId` (generate a unique ID for this session), `nativeMeetingId` (extract from URL or use URL).
    - *Files to modify:* `app/api/transcript/start/route.ts`.
- [ ] **Story: API Endpoint Launches Vexa Bot Docker Container:**
    - As a developer, the API endpoint should execute the `docker run` command with the `vexa-bot` image (built in Phase 0 or a pre-built image) and the constructed `BOT_CONFIG` passed as an environment variable.
    - *Action:* Use Node.js `child_process.spawn` to run the `docker run ...` command.
    - Log `stdout` and `stderr` from the Docker process.
    - *Files to modify:* `app/api/transcript/start/route.ts`.
    - *Testing:* Call the API (e.g., with Postman) and verify the Docker container starts and the bot attempts to join the meeting.

## Phase III: Backend - Transcript Streaming & Handling

- [ ] **Story: Modify Vexa Bot to Send Transcripts via WebSocket to Next.js Backend** (`vexa-ai-vexa-bot.git/core/src/platforms/google.ts` or `transcript-adapter.js`)
- [ ] **Story: Create WebSocket Endpoint in Next.js for Receiving Transcripts** (Custom server setup or library in Next.js)
- [ ] **Story: Stream Transcripts from Next.js Backend to Frontend** (Next.js WebSocket handler, `components/live-transcript-modal.tsx`)

## Phase IV: Bot & System Management

- [ ] **Story: Ensure Vexa Bot Docker Image is Built and Available** (DevOps/Build process for `vexa-bot` image)
- [ ] **Story: Handle Bot Stop/Cleanup** (`components/live-transcript-modal.tsx`, `app/api/transcript/stop/route.ts` (new))
