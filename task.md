# Epic: Client-Centric Progress-Note Prototype

## Story&nbsp;1 – Add Client Schema & Seed
- [ ] Create migration **001_add_clients** with `Client` table
- [ ] Create migration **002_chat_add_client_fk** adding `clientId` FK to `Chat`
- [ ] Update `lib/db/schema.ts` with new models
- [ ] Run `pnpm db:generate` to refresh types
- [ ] Add `scripts/seed-clients.ts` to insert 3 demo patients
- [ ] Implement `GET /api/clients` route (JSON list)
- [ ] **TEST:** run migrations & seed, then visit <http://localhost:3000/api/clients> → list is shown

## Story&nbsp;2 – “New Chat” Requires Client
- [ ] Add `POST /api/chat?clientId=` API to create chat with FK
- [ ] Build `components/select-client-dialog.tsx` (modal + searchable list)
- [ ] Modify "New Chat" button to open dialog and create chat on select
- [ ] Disable textarea until `chat.clientId` present in `chat-input`
- [ ] **TEST:** click “New Chat” → pick client → chat opens, input enabled

## Story&nbsp;3 – Inject Client Context & Generate SOAP Note
- [ ] Add `lib/utils/build-client-context.ts` (row → string)
- [ ] Patch chat completion handler to prepend client profile
- [ ] Add keyword trigger for SOAP progress-note template
- [ ] **TEST:** ask “Write a SOAP progress note” → response follows S/O/A/P and includes client facts; verify server logs

## Story&nbsp;4 – Persist & Display Progress-Note Artifact
- [ ] Ensure LLM invokes `createDocument` tool (`kind: "text"`)
- [ ] Verify artifact renders after generation
- [ ] **TEST:** generate note, open fullscreen, confirm content stored

## Story&nbsp;5 – Sidebar Label Includes Client Name
- [ ] Set chat `title` (e.g., "Progress note") on first message if keywords detected
- [ ] Update sidebar query to show "{Client} – {Chat.title}"
- [ ] **TEST:** create new chat → sidebar shows “John Smith – Progress note”

## Story&nbsp;6 – Polishing & Demo Script
- [ ] Add README “Quick demo” section (clone → migrate → seed → dev)
- [ ] Add npm script `pnpm demo` chaining migrate+seed+dev
- [ ] Add console banner listing demo clients on startup
- [ ] **TEST:** run `pnpm demo`; complete end-to-end flow in ≤60 s