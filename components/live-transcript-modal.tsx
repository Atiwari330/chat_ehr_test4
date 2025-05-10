'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from './toast';
import { ScrollArea } from '@/components/ui/scroll-area'; // For displaying transcripts

interface LiveTranscriptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartSubmit: (
    meetLink: string,
    onTranscriptSegment: (segment: string) => void
  ) => Promise<void>;
  transcripts: string[];
  clearTranscripts: () => void;
}

export function LiveTranscriptModal({
  open,
  onOpenChange,
  onStartSubmit,
  transcripts,
  clearTranscripts,
}: LiveTranscriptModalProps) {
  const [meetLink, setMeetLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleModalOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      // Reset state when modal is closed
      setMeetLink('');
      setIsLoading(false);
      setIsTranscribing(false);
      clearTranscripts();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!meetLink.trim()) {
      toast({
        type: 'error',
        description: 'Please enter a Google Meet link.',
      });
      return;
    }
    // Basic validation for Google Meet link
    if (!meetLink.includes('meet.google.com/')) {
        toast({
            type: 'error',
            description: 'Invalid Google Meet link format.',
        });
        return;
    }

    setIsLoading(true);
    setIsTranscribing(true); // Assume transcription starts on submit
    try {
      await onStartSubmit(meetLink, (segment: string) => {
        // This callback is invoked by ChatHeader when a new transcript segment arrives.
        // The modal itself doesn't need to do anything with the segment directly here,
        // as it receives the full 'transcripts' array as a prop.
        // console.log('Modal received segment (via prop):', segment); // Keep for debugging if needed
      });
      // Don't close modal automatically, user might want to see transcript
    } catch (error) {
      setIsTranscribing(false); // Stop transcribing on error
      // Error toast is handled by the caller (onStartSubmit)
    } finally {
      setIsLoading(false);
      // setIsTranscribing will be set to false when the stream ends or is stopped by user/error.
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleModalOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isTranscribing ? 'Live Transcript Active' : 'Collect Live Transcript'}
          </DialogTitle>
          {!isTranscribing && (
            <DialogDescription>
              Enter the Google Meet link to start collecting the live transcript.
              The bot will attempt to join the meeting.
            </DialogDescription>
          )}
        </DialogHeader>
        {!isTranscribing ? (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="meet-link" className="text-right">
                  Meet Link
                </Label>
                <Input
                  id="meet-link"
                  value={meetLink}
                  onChange={(e) => setMeetLink(e.target.value)}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  className="col-span-3"
                  disabled={isLoading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleModalOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Starting...' : 'Start Transcription'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">
              Transcription in progress for: {meetLink}
            </p>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              {transcripts.length > 0 ? (
                transcripts.map((transcript, index) => (
                  <p key={index} className="text-sm mb-1">
                    {transcript}
                  </p>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Waiting for transcript...
                </p>
              )}
            </ScrollArea>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setIsTranscribing(false);
                  // TODO: Add logic to actually stop the backend transcription process
                  toast({ type: 'success', description: 'Live transcript stopped by user.' });
                }}
              >
                Stop Transcription
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
