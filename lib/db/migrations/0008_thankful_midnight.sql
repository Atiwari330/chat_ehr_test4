ALTER TABLE "Chat" ADD COLUMN "clientId" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Chat" ADD CONSTRAINT "Chat_clientId_Client_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
