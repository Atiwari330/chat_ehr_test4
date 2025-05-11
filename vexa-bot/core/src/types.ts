export type BotConfig = {
  platform: "google_meet" | "zoom" | "teams",
  meetingUrl: string | null,
  botName: string,
  token: string,
  connectionId: string,
  nativeMeetingId: string,
  wsUrl: string; // Added for Phase III: WebSocket URL for audio intake
  automaticLeave: {
    waitingRoomTimeout: number,
    noOneJoinedTimeout: number,
    everyoneLeftTimeout: number
  },
  meeting_id?: number
}
