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
    // The onTranscriptSegment callback from modal is not directly used here for API call,
    // but kept if direct UI updates from this function were ever needed.
    // For now, transcript updates will be driven by WebSocket in Phase III.
    onTranscriptSegment: (segment: string) => void 
  ) => {
    console.log('Attempting to start live transcript for:', meetLink);
    setLiveTranscripts([]); // Clear previous transcripts
    // isLoading state is managed within LiveTranscriptModal

    try {
      const response = await fetch('/api/transcript/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meetLink }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to start transcript process via API');
      }

      toast({ type: 'success', description: result.message || 'Live transcript process initiated.' });
      console.log('API response:', result); // Log connectionId, containerName

      // Keep the simulation for now to show UI feedback.
      // This will be replaced by WebSocket handling in Phase III.
      const simulateTranscription = async () => {
        const segments = [
          "Hello, this is the first segment (simulated).",
          "API call successful, bot process should be starting.",
          "Waiting for real transcripts via WebSocket (Phase III)...",
        ];
        for (const segment of segments) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          setLiveTranscripts(prev => [...prev, segment]);
        }
        // toast({ type: 'success', description: 'Live transcript simulation finished.'});
      };
      simulateTranscription().catch(simError => {
         console.error("Transcription simulation error:", simError);
         toast({ type: 'error', description: 'Error during transcript simulation.' });
      });

    } catch (error) {
      console.error("Error starting live transcript via API:", error);
      toast({ type: 'error', description: `API Error: ${error instanceof Error ? error.message : 'Unknown error'}` });
      // If API call fails, the LiveTranscriptModal's isTranscribing state should be reset.
      // This might require passing a setter for isTranscribing or having the modal handle this.
      // For now, the modal's own isLoading will reset, but isTranscribing might stay true.
      // This will be refined when actual WebSocket connection status is available.
    }
    // Do not set isLoading here, it's managed by the modal.
    // Modal also stays open to show transcripts or errors.
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
