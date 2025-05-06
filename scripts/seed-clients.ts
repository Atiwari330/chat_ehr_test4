import 'dotenv/config'; // Ensure environment variables are loaded
import { db, client } from '../lib/db'; // Corrected path for db and client schema
import { sql } from 'drizzle-orm';

async function seedClients() {
  console.log('Seeding clients...');

  const demoClients = [
    {
      firstName: 'John',
      lastName: 'Smith',
      dateOfBirth: new Date('1985-03-15T00:00:00Z'),
      medicalRecordNumber: 'MRN001',
      profileNotes: 'History of hypertension, managed with Lisinopril. Allergic to penicillin.',
    },
    {
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: new Date('1992-07-22T00:00:00Z'),
      medicalRecordNumber: 'MRN002',
      profileNotes: 'Type 2 Diabetes, well-controlled on Metformin. Non-smoker.',
    },
    {
      firstName: 'Peter',
      lastName: 'Jones',
      dateOfBirth: new Date('1978-11-01T00:00:00Z'),
      medicalRecordNumber: 'MRN003',
      profileNotes: 'Asthma, uses Albuterol inhaler as needed. No known drug allergies.',
    },
  ];

  try {
    // Using onConflictDoNothing to avoid errors if MRNs already exist
    await db.insert(client).values(demoClients).onConflictDoNothing({
        target: client.medicalRecordNumber // Specify the unique constraint column
    });

    console.log(`Successfully seeded ${demoClients.length} clients (or skipped existing ones).`);

  } catch (error) {
    console.error('Error seeding clients:', error);
    process.exit(1); // Exit with error code
  } finally {
    // Drizzle doesn't require explicit connection closing like some ORMs,
    // but if using node-postgres directly, you'd close here.
    // For drizzle-kit scripts, the process usually ends automatically.
    // If running as a long process, ensure connections are managed properly.
    console.log('Client seeding process finished.');
    // Explicitly exit if needed, e.g., if db connection keeps script alive
    // await db.end(); // This depends on the underlying driver if needed
  }
}

seedClients();
