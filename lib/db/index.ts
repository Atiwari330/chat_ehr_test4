// lib/db/index.ts
import { config as loadEnv } from 'dotenv';
// Load environment variables from .env.local (falls back to .env automatically if not found)
loadEnv({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Re-export all schema types
export * from './schema';

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle(client);
