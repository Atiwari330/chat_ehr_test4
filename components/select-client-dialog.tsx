'use client';

import { useState, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetcher } from '@/lib/utils';
import type { Client } from '@/lib/db/schema';
import { LoadingSpinner } from './ui/loading-spinner'; // Assuming a loading spinner exists

interface SelectClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientSelect: (clientId: string) => void;
}

export function SelectClientDialog({
  open,
  onOpenChange,
  onClientSelect,
}: SelectClientDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Fetch clients using SWR
  const { data: clients, error, isLoading } = useSWR<Client[]>('/api/clients', fetcher);

  // Filter clients based on search term
  const filteredClients = useMemo(() => {
    if (!clients) return [];
    const term = searchTerm.toLowerCase();
    return clients.filter(
      (client) =>
        client.firstName.toLowerCase().includes(term) ||
        client.lastName.toLowerCase().includes(term) ||
        client.medicalRecordNumber?.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  // Reset selection when dialog closes or search term changes
  useEffect(() => {
    if (!open) {
        setSelectedClientId(null);
        setSearchTerm(''); // Optionally clear search on close
    }
  }, [open]);

  const handleSelect = () => {
    if (selectedClientId) {
      onClientSelect(selectedClientId);
      onOpenChange(false); // Close dialog after selection
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Client</DialogTitle>
          <DialogDescription>
            Choose a client to associate with this new chat session.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Search by name or MRN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-2"
          />
          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            {isLoading && (
              <div className="flex justify-center items-center h-full">
                <LoadingSpinner />
              </div>
            )}
            {error && (
              <p className="text-red-500 text-center">
                Failed to load clients.
              </p>
            )}
            {clients && filteredClients.length === 0 && (
              <p className="text-muted-foreground text-center">
                No clients found.
              </p>
            )}
            {filteredClients.map((client) => (
              <div
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={`p-2 mb-1 rounded-md cursor-pointer hover:bg-muted ${
                  selectedClientId === client.id ? 'bg-muted font-semibold' : ''
                }`}
              >
                {client.firstName} {client.lastName}
                {client.medicalRecordNumber && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (MRN: {client.medicalRecordNumber})
                  </span>
                )}
              </div>
            ))}
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={!selectedClientId}>
            Start Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
