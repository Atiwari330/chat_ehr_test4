import { NextResponse, type NextRequest } from 'next/server';
import { createClient, DeepgramError } from '@deepgram/sdk';
import { auth } from '@/app/(auth)/auth'; // Assuming your auth setup is here

export const revalidate = 0; // Disable caching for this route

export async function GET(request: NextRequest) {
  console.log('Deepgram Auth: Received request for API key');
  try {
    const session = await auth();
    if (!session?.user?.id) {
      console.error('Deepgram Auth: Unauthorized - No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log(`Deepgram Auth: User ${session.user.id} authenticated`);

    const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

    if (!deepgramApiKey) {
      console.error('Deepgram Auth: DEEPGRAM_API_KEY not configured on server');
      return NextResponse.json({ error: 'Deepgram API key not configured on server' }, { status: 500 });
    }

    const deepgram = createClient(deepgramApiKey);

    // Create a short-lived key for the client
    // Adjust scopes and time_to_live_in_seconds as needed for your application
    // For a simple transcription MVP, 'usage:write' might be sufficient if client directly transcribes.
    // However, for better security, the client should ideally only get a key to *listen* if transcription happens server-side,
    // or a key with very limited scope if client-side transcription is a must for MVP.
    // The example from deepgram-starters uses "usage:write" for client-side temp keys.
    const { result: newKeyResult, error: newKeyError } = await deepgram.manage.createProjectKey(
      (await deepgram.manage.getProjects())?.result?.projects[0]?.project_id ?? '', // Get the first project ID
      {
        comment: `Temporary API key for user ${session.user.id}`,
        scopes: ['usage:write'], // Allows client to use STT services
        tags: ['realtime-transcription-ehr'],
        time_to_live_in_seconds: 60 * 5, // 5 minutes
      }
    );

    if (newKeyError) {
      console.error('Deepgram Auth: Error creating temporary API key:', newKeyError);
      return NextResponse.json({ error: 'Failed to create temporary Deepgram key', details: newKeyError.message }, { status: 500 });
    }

    if (!newKeyResult || !newKeyResult.key) {
      console.error('Deepgram Auth: New key result is invalid or missing key property.');
      return NextResponse.json({ error: 'Failed to retrieve temporary Deepgram key data' }, { status: 500 });
    }

    console.log('Deepgram Auth: Successfully created temporary API key for user', session.user.id);
    return NextResponse.json({ key: newKeyResult.key });

  } catch (error) {
    console.error('Deepgram Auth: Unexpected error in GET handler:', error);
    if (error instanceof DeepgramError) {
      return NextResponse.json({ error: 'Deepgram service error', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
