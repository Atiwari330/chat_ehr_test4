# Epic: Integrate Real-Time Voice Transcription for Enhanced Note Input

**Goal:** To allow clinicians to use their voice to input session content in real-time, which can then be used as the basis for AI-generated clinical notes, improving efficiency and user experience. This will be achieved by integrating Deepgram for live speech-to-text.

---

## Story 1: Setup Deepgram Service & Backend Authentication

**Goal:** Establish the foundational connection and authentication mechanisms required to use the Deepgram API securely.

**Tasks:**
- [ ] **Account & API Key:**
    - [ ] Create a Deepgram account at [https://console.deepgram.com/signup](https://console.deepgram.com/signup).
    - [ ] Obtain a Deepgram API Key.
- [ ] **Environment Configuration:**
    - [ ] Add `DEEPGRAM_API_KEY=YOUR_KEY_HERE` to the `.env.local` file.
    - [ ] Add `DEEPGRAM_API_KEY=` to the `.env.example` file.
- [ ] **Install Dependencies:**
    - [ ] Add the `@deepgram/sdk` package to the project: `pnpm install @deepgram/sdk`.
- [ ] **Backend Authentication Route:**
    - [ ] Create a new API route: `app/api/deepgram-auth/route.ts`.
    - [ ] Implement logic in this route to securely provide a short-lived Deepgram API key or token to the frontend. This can be based on the `app/api/authenticate/route.ts` from the Deepgram Next.js starter example.
        - [ ] Ensure this route is protected and only accessible by authenticated users.
    - [ ] Implement server-side logging for the `app/api/deepgram-auth/route.ts` (e.g., log request, success/failure of key generation, errors).

---

## Story 2: Develop Transcription Modal UI & Trigger

**Goal:** Create the user interface elements for initiating and interacting with the transcription feature within a modal.

**Tasks:**
- [ ] **Transcription Modal Component:**
    - [ ] Create a new React component: `components/transcription-modal.tsx`.
    - [ ] Design the basic layout of the modal.
        - [ ] Include a clear title (e.g., "Live Transcription").
        - [ ] Add a button: "Start Transcription".
        - [ ] Add a button: "Stop Transcription".
        - [ ] Add a designated area (e.g., a `<div>` or `<textarea readonly>`) to display the streaming transcript.
        - [ ] Add a button: "Copy Transcript".
        - [ ] Add a button or icon: "Close Modal".
    - [ ] Define initial enabled/disabled states for modal buttons (e.g., 'Stop' and 'Copy' initially disabled).
    - [ ] Use existing UI components (e.g., from `components/ui/dialog.tsx`, `components/ui/button.tsx`) for consistency if applicable.
- [ ] **Modal Trigger:**
    - [ ] Add a new button (e.g., "Transcribe Session" or a microphone icon) to the main chat interface (e.g., near the message input field in `components/chat.tsx` or `components/multimodal-input.tsx`).
    - [ ] Verify that adding the 'Transcribe Session' button does not negatively impact existing chat functionalities or UI layout.
- [ ] **Modal State Management:**
    - [ ] Implement state (e.g., using `useState` in the parent component or a shared context) to control the visibility of the `TranscriptionModal`.
    - [ ] Connect the "Transcribe Session" button to set the modal visibility state to true.
    - [ ] Connect the "Close Modal" button/icon within the modal to set the visibility state to false.
- [ ] **Verification:**
    - [ ] Manually test: Click 'Transcribe Session' button, verify modal appears.
    - [ ] Verify all buttons ('Start', 'Stop', 'Copy', 'Close') are visible and in their correct initial enabled/disabled states.
    - [ ] Verify 'Close' button hides the modal.

---

## Story 3: Integrate Microphone Access & Deepgram Connection (Client-Side in Modal)

**Goal:** Enable the modal to access the user's microphone and establish a live streaming connection to Deepgram.

**Tasks:**
- [ ] **Microphone Access Logic (within `TranscriptionModal` or a new hook/context):**
    - [ ] Adapt microphone access logic from the Deepgram Next.js example (`app/context/MicrophoneContextProvider.tsx`).
    - [ ] Implement a function to request microphone permission when "Start Transcription" is clicked.
    - [ ] Handle microphone permission denial gracefully (e.g., show an error message).
    - [ ] Display user-friendly error messages in the modal for: microphone permission denied, no microphone detected.
    - [ ] Manage microphone state (e.g., NotSetup, Ready, Opening, Open, Error).
    - [ ] Add console logging for: microphone setup steps (requesting, success, error).
- [ ] **Deepgram Connection Logic (within `TranscriptionModal` or a new hook/context):**
    - [ ] Adapt Deepgram connection logic from the Deepgram Next.js example (`app/context/DeepgramContextProvider.tsx`).
    - [ ] Implement a function to fetch the temporary API key from the `app/api/deepgram-auth/route.ts` backend route.
    - [ ] Implement a function to connect to the Deepgram streaming service using the fetched key and appropriate options (e.g., `model`, `interim_results`, `smart_format`).
    - [ ] Manage Deepgram connection state (e.g., Connecting, Open, Closed, Error).
    - [ ] Display user-friendly error messages in the modal for: Deepgram connection failure, API key issues.
    - [ ] Add console logging for: Deepgram API key fetch (request, success, error), Deepgram connection attempts (connecting, open, error, close events).
- [ ] **Wire "Start Transcription" Button:**
    - [ ] On click:
        - [ ] Request microphone permission.
        - [ ] If permission granted, fetch Deepgram API key.
        - [ ] If key fetched, connect to Deepgram.
        - [ ] If connected, start the microphone and begin sending audio data to Deepgram.
        - [ ] Update UI to indicate transcription is active (e.g., change button text/style, show a loading indicator, enable/disable relevant buttons).
- [ ] **Wire "Stop Transcription" Button:**
    - [ ] On click:
        - [ ] Stop sending audio data.
        - [ ] Close the Deepgram connection.
        - [ ] Stop/release the microphone.
        - [ ] Update UI to indicate transcription has stopped (enable/disable relevant buttons).
- [ ] **Verification:**
    - [ ] Manually test: Open browser console. Click 'Start Transcription.'
    - [ ] Verify microphone permission is requested. Grant permission.
    - [ ] Check console for successful API key fetch and Deepgram 'open' event logs.
    - [ ] Verify UI updates to show transcription is active (e.g., 'Stop' button enabled, 'Start' button disabled).
    - [ ] Click 'Stop Transcription.' Check console for Deepgram 'close' event logs.
    - [ ] Verify UI updates to show transcription is stopped (e.g., 'Start' button enabled, 'Copy' button potentially enabled if there's text).
    - [ ] Test error scenarios: Deny microphone permission, simulate network error for API key fetch. Verify user-friendly messages appear.

---

## Story 4: Display Streaming Transcript & Implement Copy Functionality

**Goal:** Show the live transcribed text in the modal and allow the user to copy it.

**Tasks:**
- [ ] **Receive & Display Transcripts:**
    - [ ] Add event listeners to the Deepgram connection to receive `LiveTranscriptionEvents.Transcript` (similar to `App.tsx` in the Deepgram example).
    - [ ] On receiving transcript data:
        - [ ] Extract the transcribed text.
    - [ ] Update a state variable that holds the current full transcript.
    - [ ] Append new interim and final results to the display area in the modal in real-time.
    - [ ] Add console logging for received transcript data (both interim and final results) to observe the data flow.
- [ ] **Accumulate Final Transcript:**
    - [ ] Maintain a separate state variable or ref to store the complete, finalized transcript (concatenating final segments).
- [ ] **Implement "Copy Transcript" Button:**
    - [ ] On click, use the `navigator.clipboard.writeText()` API to copy the content of the accumulated final transcript to the user's clipboard.
    - [ ] Ensure "Copy Transcript" button is enabled only when there is a final transcript to copy.
    - [ ] Provide user feedback (e.g., a temporary message "Transcript copied!") upon successful copy.
- [ ] **Verification:**
    - [ ] Manually test: Start transcription, speak a few words.
    - [ ] Verify text appears in the modal's display area.
    - [ ] Verify interim results update and final results appear. Check console logs for transcript data.
    - [ ] Click 'Stop Transcription.'
    - [ ] Verify 'Copy Transcript' button is enabled. Click 'Copy Transcript.'
    - [ ] Paste into a text editor and verify the spoken text is present.
    - [ ] Verify "Transcript copied!" feedback is shown.

---

## Future Considerations (Post-MVP):

- [ ] **Direct Integration with Note Generation:** Instead of a copy button, directly pass the final transcript to the AI note generation service.
- [ ] **Speaker Diarization:** If multi-speaker transcription is needed in the future.
- [ ] **Enhanced Error Handling & UI Feedback:** More robust error messages and visual cues for different states.
- [ ] **Configuration Options:** Allow users to select language or other Deepgram features if necessary.
- [ ] **Visual Audio Feedback:** Implement a voice visualizer like in the Deepgram example.
