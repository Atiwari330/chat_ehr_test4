import type { Client } from '@/lib/db/schema';

/**
 * Builds a structured string representation of client data for context injection
 * @param client The client database record
 * @returns A formatted string with client profile information
 */
export function buildClientContext(client: Client): string {
  if (!client) return '';

  // Calculate age from DOB
  const age = client.dateOfBirth
    ? Math.floor(
        (new Date().getTime() - client.dateOfBirth.getTime()) /
          (365.25 * 24 * 60 * 60 * 1000),
      )
    : 'Unknown';

  return `
CLIENT PROFILE:
Name: ${client.firstName} ${client.lastName}
MRN: ${client.medicalRecordNumber || 'Not recorded'}
Age: ${age}
Date of Birth: ${client.dateOfBirth ? client.dateOfBirth.toLocaleDateString() : 'Not recorded'}
Medical History: ${client.profileNotes || 'No notes available'}
`;
}
