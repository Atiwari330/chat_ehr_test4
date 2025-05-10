'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';
import { useState } from 'react';

import { ModelSelector } from '@/components/model-selector';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { PlusIcon, VercelIcon, MicIcon } from './icons';
import { useSidebar } from './ui/sidebar';
import { memo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { type VisibilityType, VisibilitySelector } from './visibility-selector';
import type { Session } from 'next-auth';
import { SelectClientDialog } from './select-client-dialog';
import { LiveTranscriptModal } from './live-transcript-modal'; // Import the new modal
import { toast } from './toast';

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  session,
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isLiveTranscriptModalOpen, setIsLiveTranscriptModalOpen] = useState(false);
  const [liveTranscripts, setLiveTranscripts] = useState<string[]>([]); // State for live transcripts

  const { width: windowWidth } = useWindowSize();

  const handleClientSelect = async (clientId: string) => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create chat');
      }

      const { id: newChatId } = await response.json();
      toast({ type: 'success', description: 'New chat created.' });
      router.push(`/chat/${newChatId}`);
    } catch (error) {
      console.error('Failed to create chat:', error);
      toast({ type: 'error', description: `Error creating chat: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  };

  const handleStartLiveTranscript = async (
    meetLink: string,
    onTranscriptSegment: (segment: string) => void // Callback from modal, though modal doesn't use it directly
  ) => {
    console.log('Attempting to start live transcript for:', meetLink);
    setLiveTranscripts([]); // Clear previous transcripts

    toast({ type: 'success', description: `Attempting to start transcript for: ${meetLink}` });

    // TODO: Replace with actual API call to backend to start the bot
    // For now, simulate receiving transcript segments
    // This simulation logic will be replaced by WebSocket messages from the backend
    const simulateTranscription = async () => {
      const segments = [
        "Hello, this is the first segment.",
        "Testing live transcription feature.",
        "The bot seems to be working.",
        "More updates will follow shortly.",
        "This is a longer segment to test scrolling and display of multiple lines of text to see how it behaves in the UI.",
        "Almost done with the simulation."
      ];
      for (const segment of segments) {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
        setLiveTranscripts(prev => [...prev, segment]);
        // The onTranscriptSegment callback is available if needed, but modal reads from liveTranscripts prop
      }
      toast({ type: 'success', description: 'Live transcript simulation finished.'});
      // In a real scenario, the modal's isTranscribing state would be managed by WebSocket events
      // or a stop signal from the backend/user.
    };

    simulateTranscription().catch(error => {
      console.error("Transcription simulation error:", error);
      toast({ type: 'error', description: 'Error during transcript simulation.' });
    });
    // We don't close the modal here; it stays open to display transcripts.
  };

  const clearLiveTranscripts = () => {
    setLiveTranscripts([]);
  };

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <SidebarToggle />

      {(!open || windowWidth < 768) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
              onClick={() => {
                setIsClientDialogOpen(true);
              }}
            >
              <PlusIcon />
              <span className="md:sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      )}

      {!isReadonly && (
        <ModelSelector
          session={session}
          selectedModelId={selectedModelId}
          className="order-1 md:order-2"
        />
      )}

      {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          className="order-1 md:order-3"
        />
      )}

      {chatId && !isReadonly && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-3 md:order-4 md:px-2 px-2 md:h-fit"
              onClick={() => {
                setIsLiveTranscriptModalOpen(true);
              }}
            >
              <MicIcon />
              <span className="sr-only md:not-sr-only md:ml-2">Live Transcript</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Collect Live Transcript</TooltipContent>
        </Tooltip>
      )}

      <Button
        className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-900 hidden md:flex py-1.5 px-2 h-fit md:h-[34px] order-5 md:ml-auto"
        asChild
      >
        <Link
          href={`https://vercel.com/new/clone?repository-url=https://github.com/vercel/ai-chatbot&env=AUTH_SECRET&envDescription=Learn more about how to get the API Keys for the application&envLink=https://github.com/vercel/ai-chatbot/blob/main/.env.example&demo-title=AI Chatbot&demo-description=An Open-Source AI Chatbot Template Built With Next.js and the AI SDK by Vercel.&demo-url=https://chat.vercel.ai&products=[{"type":"integration","protocol":"ai","productSlug":"grok","integrationSlug":"xai"},{"type":"integration","protocol":"storage","productSlug":"neon","integrationSlug":"neon"},{"type":"blob"}]`}
          target="_noblank"
        >
          <VercelIcon size={16} />
          Deploy with Vercel
        </Link>
      </Button>

      <SelectClientDialog
        open={isClientDialogOpen}
        onOpenChange={setIsClientDialogOpen}
        onClientSelect={handleClientSelect}
      />
      <LiveTranscriptModal
        open={isLiveTranscriptModalOpen}
        onOpenChange={setIsLiveTranscriptModalOpen}
        onStartSubmit={handleStartLiveTranscript}
        transcripts={liveTranscripts}
        clearTranscripts={clearLiveTranscripts}
      />
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
