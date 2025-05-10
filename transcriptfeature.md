# Epic: PDF Transcript Upload & AI Progress Note Generation

This epic covers the implementation of a feature allowing users to upload a PDF transcript of a patient-provider conversation and have the system generate a SOAP progress note as an artifact using an LLM.

## Story 1: Basic PDF Upload and Text Extraction (Client-Side)

**Goal:** Allow users to select a PDF file, extract its text content on the client-side, and store it in component state.

**Tasks:**
*   [] - Add a new "+" icon button to `components/multimodal-input.tsx` specifically for "Upload Transcript PDF".
*   [] - Implement a new hidden file input element in `components/multimodal-input.tsx` that accepts only PDF files.
*   [] - When the "+" button is clicked, trigger a click on the hidden PDF file input.
*   [] - On file selection, install and use `pdf.js` (or a similar client-side library) to parse the selected PDF and extract its raw text content.
*   [] - Store the extracted text content in a new state variable within `components/multimodal-input.tsx`.
*   [] - If PDF parsing fails, display a toast notification to the user (e.g., "Failed to parse PDF. Please try a different file.").
*   [] - If PDF parsing is successful, log the extracted text to the console for now (for testing).
*   [] - **User Testing Prompt:** After this story, prompt the user to test uploading various PDF files and verify that their text content is logged to the console.

## Story 2: "Generate Progress Note" Modal

**Goal:** Display a modal after successful PDF text extraction, allowing the user to trigger progress note generation.

**Tasks:**
*   [] - Create a new React component `components/transcript-upload-modal.tsx`.
*   [] - The modal should initially be hidden.
*   [] - After successful PDF text extraction (from Story 1), set a state variable to show this modal.
*   [] - The modal should display:
    *   A title (e.g., "Transcript Uploaded").
    *   A brief message (e.g., "Ready to generate progress note from the transcript.").
    *   A "Generate Progress Note" button.
    *   A "Cancel" or "Close" button/icon.
*   [] - If "Cancel" or "Close" is clicked, hide the modal and clear the stored extracted PDF text (discard it).
*   [] - **User Testing Prompt:** After this story, prompt the user to test uploading a PDF, see the modal appear, and test the cancel/close functionality.

## Story 3: Triggering LLM for Progress Note Generation

**Goal:** When "Generate Progress Note" is clicked in the modal, send the extracted transcript text to the LLM with instructions to create a SOAP note artifact.

**Tasks:**
*   [] - When the "Generate Progress Note" button in `components/transcript-upload-modal.tsx` is clicked:
    *   Retrieve the stored extracted PDF text.
    *   Construct a user message. This message should be a clear instruction to the LLM, e.g., "Please generate a SOAP progress note based on the following transcript: [extracted PDF text]".
    *   Use the `append` function (from `useChat` hook, passed down to the modal or accessed via context) to send this message to the backend.
    *   Hide the modal.
    *   Clear the stored extracted PDF text.
*   [] - In `lib/ai/prompts.ts`, review and potentially adjust the `systemPrompt` or the logic in `app/(chat)/api/chat/route.ts` to ensure:
    *   The LLM is clearly instructed to prioritize the provided transcript text for generating the SOAP note.
    *   **Crucial Learning:** The `createDocument` tool itself does not take `content` as a parameter. Instead, it calls a `documentHandler` (e.g., `textDocumentHandler`) which then generates the content, often via a *second* LLM call using a more generic prompt based on the `title`.
    *   **New Task:** Modify the `createDocument` tool in `lib/ai/tools/create-document.ts` to accept a `content: z.string().optional()` parameter.
    *   **New Task:** Update the `systemPrompt` in `lib/ai/prompts.ts` (for `isTranscriptBasedSoapNote = true`) to instruct the primary LLM to:
        1.  Generate the full SOAP note content based on the transcript.
        2.  Call the `createDocument` tool, passing the generated SOAP note text as the new `content` parameter, along with `title` and `kind: 'text'`.
    *   **New Task:** Modify `CreateDocumentCallbackProps` in `lib/artifacts/server.ts` to include `content?: string;`.
    *   **New Task:** Modify `textDocumentHandler` in `artifacts/text/server.ts`:
        *   Its `onCreateDocument` method should now accept this `content` (e.g., as `contentFromTool`).
        *   If `contentFromTool` is provided, it should use this directly to populate `draftContent` and stream it to the client, *bypassing* its own LLM call.
        *   If `contentFromTool` is NOT provided (for other use cases), it can retain its original behavior of calling `streamText` with `artifact-model`.
    *   **New Task:** In `app/(chat)/api/chat/route.ts`, ensure the `systemPrompt` is correctly configured for transcript-based SOAP notes (e.g., using `isTranscriptBasedSoapNote` flag and potentially passing an empty `clientContext` to avoid confusion, as explored during debugging).
*   [] - **User Testing Prompt:** After this story, prompt the user to upload a PDF, click "Generate Progress Note".
    *   Verify server logs:
        *   The primary LLM call includes the transcript and the refined system prompt.
        *   The `createDocument` tool's `execute` method (add logs here) receives `title`, `kind`, AND the `content` (the SOAP note generated by the primary LLM).
        *   The `textDocumentHandler.onCreateDocument` (add logs here) receives and uses this passed `content`.
    *   The artifact display will be tested in the next story.

## Story 4: Displaying the Generated Progress Note Artifact

**Goal:** Ensure the progress note (now generated by the primary LLM and passed through the tool system) is correctly displayed in the `Artifact` component.

**Tasks:**
*   [] - Verify that the `textDocumentHandler`, after receiving the pre-generated content, correctly streams it via `dataStream.writeData({ type: 'text-delta', content: textDelta })`.
*   [] - Confirm that the `Artifact` component (`components/artifact.tsx`) and `useArtifact` hook correctly receive and display this streamed text artifact.
*   [] - **User Testing Prompt:** After this story, prompt the user to perform the full end-to-end flow:
    1.  Upload a PDF transcript.
    2.  Click "Generate Progress Note" in the modal.
    3.  Verify that the generated SOAP note appears as a text artifact in the UI.
    4.  Review the quality and relevance of the generated note based on the input transcript.

## Story 5: Loading Indicators & Refinements (Optional for Initial Prototype)

**Goal:** Improve user experience with loading states.

**Tasks:**
*   [] - In `components/transcript-upload-modal.tsx`, while waiting for the "Generate Progress Note" action to complete (i.e., after clicking the button and before the LLM response/artifact appears), display a loading indicator on the button or within the modal.
*   [] - Consider a loading state for the "+" PDF upload button in `components/multimodal-input.tsx` if client-side PDF parsing takes a noticeable amount of time.
*   [] - Add more robust error handling and user feedback for edge cases (e.g., very large PDFs, network errors during LLM call).
