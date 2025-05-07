'use client';

import type { User } from 'next-auth';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import useSWR from 'swr';

import { PlusIcon } from '@/components/icons';
import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { SelectClientDialog } from './select-client-dialog';
import { ClientDemographics } from './client-demographics';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { fetcher } from '@/lib/utils';

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const params = useParams();
  const chatId = params?.id as string | undefined;

  const { setOpenMobile } = useSidebar();
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [showDemographics, setShowDemographics] = useState(false);

  // Check if artifact is in full-screen mode
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  // Fetch current chat data to get clientId
  const { data: chatData } = useSWR<{ clientId: string | null }>(
    chatId ? `/api/chats/${chatId}` : null,
    fetcher,
    { revalidateOnFocus: false },
  );

  // When chat changes or artifact visibility changes, update the UI
  useEffect(() => {
    if (chatId && chatData?.clientId && !isArtifactVisible) {
      setShowDemographics(true);
    } else {
      setShowDemographics(false);
    }
  }, [chatId, chatData?.clientId, isArtifactVisible]);

  const handleClientSelect = async (clientId: string) => {
    try {
      // Create a new chat with the selected client
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chat');
      }

      const { id: chatId } = await response.json();

      // Navigate to the new chat
      router.push(`/chat/${chatId}`);
      router.refresh();
      setOpenMobile(false);
    } catch (error) {
      console.error('Error creating chat:', error);
      // Could add toast notification here
    }
  };

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center"
            >
              <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
                Chatbot
              </span>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  type="button"
                  className="p-2 h-fit"
                  onClick={() => {
                    setClientDialogOpen(true);
                  }}
                >
                  <PlusIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end">New Chat</TooltipContent>
            </Tooltip>
          </div>
        </SidebarMenu>
      </SidebarHeader>

      {/* Animated content transition between chat history and demographics */}
      <AnimatePresence mode="wait">
        {showDemographics && chatData?.clientId ? (
          <ClientDemographics
            key="demographics"
            clientId={chatData.clientId}
            onBackClick={() => setShowDemographics(false)}
          />
        ) : (
          <SidebarContent key="chat-history">
            <SidebarHistory user={user} />
          </SidebarContent>
        )}
      </AnimatePresence>

      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>

      {/* Client Selection Dialog */}
      <SelectClientDialog
        open={clientDialogOpen}
        onOpenChange={setClientDialogOpen}
        onClientSelect={handleClientSelect}
      />
    </Sidebar>
  );
}
