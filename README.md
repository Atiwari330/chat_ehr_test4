# Mental Health EHR AI Assistant

<p align="center">
  An AI-powered Electronic Health Record (EHR) application specifically designed for mental health outpatient service providers, including psychiatrists, therapists, and social workers. This project aims to streamline workflows, enhance documentation, and provide intelligent clinical decision support.
</p>

<p align="center">
  <a href="#core-technologies"><strong>Core Technologies</strong></a> ·
  <a href="#current-features"><strong>Current Features</strong></a> ·
  <a href="#roadmap-future-features"><strong>Roadmap</strong></a> ·
  <a href="#running-locally"><strong>Running Locally</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a>
</p>
<br/>

## Our Goal

To create a "ChatGPT-style" EHR application that acts as an intelligent assistant for mental health professionals. The system will help automate administrative tasks, generate clinical documentation from session transcripts, provide evidence-based suggestions, and ultimately allow providers to focus more on patient care.

## Core Technologies

This application is built using a modern web stack:

- **[Next.js](https://nextjs.org) App Router:** For a robust and performant web application structure, utilizing React Server Components (RSCs) and Server Actions.
- **[Vercel AI SDK](https://sdk.vercel.ai/docs):** Provides a unified API for interacting with various Large Language Models (LLMs) to power features like note generation and clinical suggestions.
- **[shadcn/ui](https://ui.shadcn.com) & [Tailwind CSS](https://tailwindcss.com):** For a clean, accessible, and modern user interface.
- **Data Persistence:**
  - **[Neon Serverless Postgres](https://vercel.com/marketplace/neon) (or similar Postgres provider):** For storing chat history, user data, client information, and generated documents.
  - **[Vercel Blob](https://vercel.com/storage/blob) (or similar file storage):** For handling file uploads and attachments.
- **[Auth.js](https://authjs.dev):** For secure user authentication.
- **Docker:** Used for running auxiliary services like the "Vexa Bot" for live transcription.

## Current Features (What's Implemented)

As of now, the application has a foundational set of features primarily focused on documentation:

1.  **Live Transcription of Sessions:**
    *   Users can initiate live transcription for Google Meet sessions.
    *   A bot joins the meeting to capture audio, which is then transcribed in real-time.
    *   The transcript is streamed to the user interface.

2.  **AI-Powered SOAP Note Generation:**
    *   **From Live Transcripts:** After a live session, the captured transcript can be used to automatically generate a SOAP (Subjective, Objective, Assessment, Plan) progress note.
    *   **From Uploaded Transcripts:** Users can upload existing transcript files (e.g., PDFs), and the system will extract the text to generate a SOAP note.
    *   **Artifact Display:** Generated notes are displayed as "artifacts" alongside the chat interface, allowing for easy review and editing.
    *   The AI is prompted to base these notes solely on the provided transcript content.

3.  **Basic Client Context:**
    *   The system can associate chats with specific client profiles.
    *   This allows for basic client information to be potentially used by the AI for context in future interactions (though currently, SOAP note generation from transcripts deliberately excludes this to maintain objectivity).

4.  **Core Chat Interface & Artifact System:**
    *   A robust chat interface for interacting with the AI.
    *   A flexible "artifact" system that can display various types of content (currently focused on text for notes, but extendable for code, sheets, images).

## Roadmap: Future Features

The vision for this EHR assistant is comprehensive. Key features planned for future development include (referencing `features.md`):

### 1. Enhanced Documentation Features
-   **AI-Generated Treatment Plans:** Based on session content and client history.
-   **Risk Assessment AI:** To detect warning signs from session transcripts or client data and suggest appropriate screening tools (e.g., PHQ-9, C-SSRS).

### 2. Clinical Decision Support
-   **Evidence-Based Intervention Suggestions:** With real-time searches of research databases (e.g., ArXiv, PubMed).
-   **Up-to-Date Treatment Recommendations:** For specific diagnoses, drawing from current guidelines.
-   **Therapeutic Strategy Suggestions:** Backed by current research.
-   **Google Drive Integration:**
    -   Link specific Google Drive folders to client profiles.
    -   Search and analyze client documents stored in Google Drive.
    -   Extract relevant information from files to answer clinical questions.

### 3. Administrative Tools
-   **One-Click Billing Summary Generation:** To simplify the billing process.
-   **Google Calendar Integration:** For automatic follow-up scheduling and reminders.
-   **Available Appointment Slot Listings:** Based on the provider's calendar.

### 4. Patient Engagement
-   **Internet Search Capability:** For client interests to help build rapport.
-   **Screening Tool Integration:** For comprehensive patient assessments (e.g., digital versions of PHQ-9).
-   **Document Sharing and Completion Portal for Patients:**
    -   Secure link via text message to a patient portal.
    -   Simple authentication (e.g., DOB verification).
    -   User-friendly interface for completing paperwork and signing forms.
    -   Optional payment information collection.

### 5. Financial Management
-   **Cash-Pay Focused Payment Dashboard:** (Initially focusing on non-insurance workflows).

## Model Providers

This application leverages the Vercel AI SDK, allowing flexibility in choosing Large Language Models. While a default might be set (e.g., from xAI, OpenAI, Anthropic), the architecture supports switching between various providers as needed.

## Deploy Your Own

You can deploy your own version of this application to Vercel with one click (Note: This button points to the original template, ensure your repository is configured for Vercel deployment):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fai-chatbot&env=AUTH_SECRET&envDescription=Generate%20a%20random%20secret%20to%20use%20for%20authentication&envLink=https%3A%2F%2Fgenerate-secret.vercel.app%2F32&project-name=mental-health-ehr-ai&repository-name=mental-health-ehr-ai&demo-title=Mental%20Health%20EHR%20AI&demo-description=An%20AI-powered%20EHR%20for%20mental%20health%20professionals.&demo-url=https%3A%2F%2Fyour-deployment-url.vercel.app&products=%5B%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22ai%22%2C%22productSlug%22%3A%22grok%22%2C%22integrationSlug%22%3A%22xai%22%7D%2C%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22storage%22%2C%22productSlug%22%3A%22neon%22%2C%22integrationSlug%22%3A%22neon%22%7D%2C%7B%22type%22%3A%22blob%22%7D%5D)

**Important:** Update the `repository-url`, `project-name`, `repository-name`, `demo-title`, `demo-description`, and `demo-url` in the Vercel deploy button link to match your project's details.

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run the application. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a local `.env` file is also sufficient for development.

> **Note:** Do not commit your `.env` file to version control as it will expose secrets that could compromise your AI provider accounts, database, and authentication services.

1.  **Install Vercel CLI (if not already installed):**
    ```bash
    npm i -g vercel
    ```
2.  **Link to your Vercel project (optional, for Vercel envs):**
    ```bash
    vercel link
    ```
3.  **Pull environment variables (if linked to Vercel):**
    ```bash
    vercel env pull .env.development.local
    ```
    Alternatively, copy `.env.example` to `.env.local` (or `.env.development.local`) and fill in the values manually.
4.  **Install dependencies:**
    ```bash
    pnpm install
    ```
5.  **Run the development server:**
    ```bash
    pnpm dev
    ```

Your application should now be running on [http://localhost:3000](http://localhost:3000).
