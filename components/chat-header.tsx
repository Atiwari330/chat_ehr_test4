'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';
import { useState, useRef, useEffect } from 'react'; // Added useRef, useEffect

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
  const [liveTranscripts, setLiveTranscripts] = useState<string[]>([]);
  const [currentConnectionId, setCurrentConnectionId] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false); // Added to manage transcription state

  const eventSourceRef = useRef<EventSource | null>(null);
  const { width: windowWidth } = useWindowSize();

  // Effect to clean up EventSource on component unmount or when connectionId changes
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        console.log("ChatHeader unmounting or connectionId changing, closing EventSource.");
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []); // Empty dependency array means this runs on unmount

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
    // onTranscriptSegment callback is not used here for API call,
    // but its presence in the function signature was from previous structure.
    // We can keep it or remove if LiveTranscriptModal no longer needs to pass it.
    // For now, it's unused in this new SSE-driven logic.
    _onTranscriptSegment: (segment: string) => void // Renamed to indicate it's unused
  ) => {
    if (isTranscribing && eventSourceRef.current) {
      toast({ type: 'info', description: 'A live transcript is already in progress.' } as any);
      return;
    }
    console.log('Attempting to start live transcript for:', meetLink);
    setLiveTranscripts([]); 
    setIsTranscribing(true); // Set transcribing state

    try {
      const startResponse = await fetch('/api/transcript/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetLink }),
      });

      const startResult = await startResponse.json();

      if (!startResponse.ok) {
        throw new Error(startResult.error || 'Failed to initiate transcript process.');
      }
      
      const { connectionId } = startResult;
      if (!connectionId) {
        throw new Error('No connectionId received from server.');
      }
      setCurrentConnectionId(connectionId);
      toast({ type: 'success', description: 'Transcript process initiated. Connecting to stream...' });

      // Close any existing EventSource
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const evtSource = new EventSource(`/api/transcript/stream?connectionId=${connectionId}`);
      eventSourceRef.current = evtSource;

      evtSource.onmessage = (event) => {
        const messageData = JSON.parse(event.data);
        // console.log('SSE Message:', messageData);

        if (messageData.type === 'transcript' && messageData.segment) {
          setLiveTranscripts((prev) => [...prev, messageData.segment]);
        } else if (messageData.type === 'status') {
          toast({ type: 'info', description: `Bot status: ${messageData.message}` } as any);
          if (messageData.message?.includes('Bot exited')) {
            stopActiveTranscription(connectionId, false); // Don't call API again if bot exited
          }
        } else if (messageData.type === 'error') {
          toast({ type: 'error', description: `Error from bot/server: ${messageData.message}` });
          stopActiveTranscription(connectionId, true); // Call API to ensure cleanup
        } else if (messageData.type === 'log') {
          // console.log(`VexaBot Log (${messageData.source}): ${messageData.message}`); 
        }
      };

      evtSource.onerror = (err) => {
        console.error("EventSource failed:", err);
        toast({ type: 'error', description: 'Connection to transcript server lost.' });
        stopActiveTranscription(connectionId, true); // Call API to ensure cleanup
        evtSource.close(); // Ensure it's closed on error
      };

    } catch (error) {
      console.error("Error starting live transcript:", error);
      toast({ type: 'error', description: `Failed to start live transcript: ${error instanceof Error ? error.message : 'Unknown error'}` });
      setIsTranscribing(false);
      setCurrentConnectionId(null);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    }
  };

  const stopActiveTranscription = async (connIdToStop: string | null, callApi = true) => {
    if (!connIdToStop) return;

    console.log(`Stopping transcription for connectionId: ${connIdToStop}, callApi: ${callApi}`);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (callApi) {
      try {
        const stopResponse = await fetch(`/api/transcript/stop?connectionId=${connIdToStop}`, {
          method: 'POST',
        });
        if (!stopResponse.ok) {
          const stopResult = await stopResponse.json();
          throw new Error(stopResult.error || 'Failed to stop transcript process via API.');
        }
        toast({ type: 'success', description: 'Live transcript stopped successfully.' });
      } catch (error) {
        console.error("Error stopping transcript via API:", error);
        toast({ type: 'error', description: `Failed to stop transcript: ${error instanceof Error ? error.message : 'Unknown error'}` });
      }
    }

    setIsTranscribing(false);
    setCurrentConnectionId(null);
    // setLiveTranscripts([]); // Optionally clear transcripts on stop, or keep them visible
  };

  const clearLiveTranscripts = () => {
    setLiveTranscripts([]);
  };

  // Pass isTranscribing and stopActiveTranscription to LiveTranscriptModal

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
        onOpenChange={(open) => {
          setIsLiveTranscriptModalOpen(open);
          if (!open && isTranscribing && currentConnectionId) {
            // If modal is closed while transcribing, stop the transcription
            stopActiveTranscription(currentConnectionId);
          }
        }}
        onStartSubmit={handleStartLiveTranscript}
        transcripts={liveTranscripts}
        clearTranscripts={clearLiveTranscripts}
        isTranscribing={isTranscribing} // Pass state
        stopTranscription={() => { // Pass stop function
          if (currentConnectionId) {
            stopActiveTranscription(currentConnectionId);
          }
        }}
      />
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  // Add other relevant props to the comparison if they affect rendering
  return (
    prevProps.selectedModelId === nextProps.selectedModelId &&
    prevProps.chatId === nextProps.chatId &&
    prevProps.isReadonly === nextProps.isReadonly &&
    prevProps.selectedVisibilityType === nextProps.selectedVisibilityType
  );
});
