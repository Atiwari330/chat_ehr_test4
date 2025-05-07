# Epic: Client-Centric Progress-Note Prototype

## Story&nbsp;1 – Add Client Schema & Seed
- [x] Create migration **001_add_clients** with `Client` table
- [x] Create migration **002_chat_add_client_fk** adding `clientId` FK to `Chat`
- [x] Update `lib/db/schema.ts` with new models
- [x] Run `pnpm db:generate` to refresh types
- [x] Add `scripts/seed-clients.ts` to insert 3 demo patients
- [x] Implement `GET /api/clients` route (JSON list)
- [x] **TEST:** run migrations & seed, then visit <http://localhost:3000/api/clients> → list is shown

### Story 1 Summary (context for Story 2 implementer)
The Client feature is fully wired up:
1. `Client` table + FK `chat.clientId` added via migrations (see `lib/db/migrations/*`).
2. Schema updated in `lib/db/schema.ts`; shared `db` instance exported from `lib/db/index.ts`.
3. Seed script `scripts/seed-clients.ts` inserts 3 demo patients.
4. API route `GET /api/clients` (`app/api/clients/route.ts`) returns all clients as JSON (verified).

You can now assume a populated `Client` table and fetch clients via the API. Proceed with Story 2 to require selecting a client when creating a new chat.

## Story&nbsp;2 – "New Chat" Requires Client
- [x] Add `POST /api/chats` API to create chat with clientId FK
- [x] Build `components/select-client-dialog.tsx` (modal + searchable list)
- [x] Modify "New Chat" button to open dialog and create chat on select
- [x] Disable textarea until `chat.clientId` present in `chat-input`
- [x] **TEST:** click "New Chat" → pick client → chat opens, input enabled

## Story&nbsp;3 – Inject Client Context & Generate SOAP Note
- [x] Add `lib/utils/build-client-context.ts` (row → string)
- [x] Patch chat completion handler to prepend client profile
- [x] Add keyword trigger for SOAP progress-note template
- [x] **TEST:** ask "Write a SOAP progress note" → response follows S/O/A/P and includes client facts; verify server logs

## Story&nbsp;4 – Persist & Display Progress-Note Artifact
- [ ] Ensure LLM invokes `createDocument` tool (`kind: "text"`)
- [ ] Verify artifact renders after generation
- [ ] **TEST:** generate note, open fullscreen, confirm content stored

## Story&nbsp;5 – Sidebar Label Includes Client Name
- [ ] Set chat `title` (e.g., "Progress note") on first message if keywords detected
- [ ] Update sidebar query to show "{Client} – {Chat.title}"
- [ ] **TEST:** create new chat → sidebar shows "John Smith – Progress note"

## Story&nbsp;6 – Polishing & Demo Script
- [ ] Add README "Quick demo" section (clone → migrate → seed → dev)
- [ ] Add npm script `pnpm demo` chaining migrate+seed+dev
- [ ] Add console banner listing demo clients on startup
- [x] **TEST:** run `pnpm demo`; complete end-to-end flow in ≤60 s
