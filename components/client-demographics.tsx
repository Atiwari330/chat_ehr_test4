'use client';

import { format } from 'date-fns';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { CrossIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { SidebarContent } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import type { Client } from '@/lib/db/schema';
import { fetcher } from '@/lib/utils';

interface ClientDemographicsProps {
  clientId: string;
  onBackClick: () => void;
}

export function ClientDemographics({
  clientId,
  onBackClick,
}: ClientDemographicsProps) {
  const { data: client, isLoading } = useSWR<Client>(
    `/api/clients/${clientId}`,
    fetcher,
  );

  return (
    <SidebarContent
      className="overflow-hidden"
      style={{ position: 'relative' }}
    >
      <motion.div
        className="flex flex-col h-full"
        initial={{ opacity: 0, x: -20 }}
        animate={{
          opacity: 1,
          x: 0,
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 25,
          },
        }}
        exit={{
          opacity: 0,
          x: -20,
          transition: {
            duration: 0.2,
          },
        }}
      >
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBackClick}
            className="mr-2"
          >
            <CrossIcon />
          </Button>
          <h2 className="text-lg font-semibold">Client Information</h2>
        </div>

        {isLoading ? (
          <DemographicsSkeleton />
        ) : client ? (
          <motion.div
            className="space-y-4 px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30,
              },
            }}
          >
            <InfoCard title="Name">
              <p className="text-base">
                {client.firstName} {client.lastName}
              </p>
            </InfoCard>

            <InfoCard title="Date of Birth">
              <p className="text-base">
                {client.dateOfBirth
                  ? format(new Date(client.dateOfBirth), 'MMMM d, yyyy')
                  : 'Not provided'}
              </p>
            </InfoCard>

            <InfoCard title="Medical Record Number">
              <p className="text-base">
                {client.medicalRecordNumber || 'Not provided'}
              </p>
            </InfoCard>

            <InfoCard title="Profile Notes">
              <p className="text-base whitespace-pre-wrap">
                {client.profileNotes || 'No notes available'}
              </p>
            </InfoCard>
          </motion.div>
        ) : (
          <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
            Client information not available.
          </div>
        )}
      </motion.div>
    </SidebarContent>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="bg-muted rounded-lg p-3"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: {
          type: 'spring',
          stiffness: 500,
          damping: 30,
          delay: Math.random() * 0.3,
        },
      }}
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

function DemographicsSkeleton() {
  return (
    <div className="space-y-4 px-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-muted rounded-lg p-3">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-6 w-full" />
        </div>
      ))}
    </div>
  );
}
