CREATE TABLE IF NOT EXISTS "Client" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	"dateOfBirth" timestamp,
	"medicalRecordNumber" varchar(32),
	"profileNotes" text,
	CONSTRAINT "Client_medicalRecordNumber_unique" UNIQUE("medicalRecordNumber")
);
