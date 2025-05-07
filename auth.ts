import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google'; // Example: Add Google provider
import { DrizzleAdapter } from '@auth/drizzle-adapter';
// Import the Drizzle client **and** the auth-related table definitions so we can
// explicitly map them for the adapter. This prevents Auth.js from looking for
// the lower-case default table names (e.g. `session`) that do not exist.
import {
  db,
  user,
  accounts,
  sessions,
  verificationTokens,
} from '@/lib/db'; 

// You might need to define or import your database tables (users, accounts, sessions, verificationTokens)
// if they are not automatically picked up by the adapter.

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: user,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }), // Pass your Drizzle instance
  providers: [
    GitHub, // Requires GITHUB_ID and GITHUB_SECRET env variables
    // Google, // Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env variables
    // Add other providers as needed
  ],
  callbacks: {
    // You can add custom callbacks here if needed
    // Example: jwt, session
    session({ session, user }) {
      // Add user id to the session
      session.user.id = user.id;
      return session;
    },
  },
  // Add any other NextAuth configuration options here
  // pages: {
  //   signIn: '/auth/signin', // Example custom sign-in page
  // },
});
