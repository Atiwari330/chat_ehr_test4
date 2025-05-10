'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CrossSmallIcon } from '@/components/icons';
import { toast } from 'sonner';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { Dispatch, SetStateAction } from 'react';

interface TranscriptUploadModalProps {
  isOpen: boolean;
  onClose: () => void; // This is the original handleCloseTranscriptModal from parent
  append: UseChatHelpers['append'];
  chatId: string; // Keep if needed for append's data or context
  extractedText: string | null;
  setExtractedPdfText: Dispatch<SetStateAction<string | null>>;
  setShowTranscriptModal: Dispatch<SetStateAction<boolean>>;
}

export function TranscriptUploadModal({
  isOpen,
  onClose,
  append,
  chatId,
  extractedText,
  setExtractedPdfText,
  setShowTranscriptModal,
}: TranscriptUploadModalProps) {
  if (!isOpen) {
    return null;
  }

  const handleGenerate = async () => {
    if (!extractedText) {
      console.error("No extracted text to generate from.");
      setShowTranscriptModal(false); // Hide modal
      setExtractedPdfText(null);   // Clear text
      onClose(); // Call original onClose to reset file input etc.
      return;
    }

    const userMessage = `Please generate a SOAP progress note based on the following transcript: ${extractedText}`;

    try {
      await append({
        id: crypto.randomUUID(), // Ensure a unique ID for the message
        role: 'user',
        content: userMessage,
        // Example: Pass data if your backend needs to identify this type of message
        // data: { isTranscriptBasedSoapNote: true, chatId: chatId }
      });
    } catch (error) {
      console.error("Error appending message for transcript:", error);
      toast.error("Failed to send transcript for processing. Please try again.");
    } finally {
      // Whether append succeeds or fails, close modal and clear text
      setShowTranscriptModal(false);
      setExtractedPdfText(null);
      // Call the original onClose from multimodal-input to handle any other cleanup like resetting file input
      // This is important because the original onClose in multimodal-input.tsx also resets pdfFileInputRef.current.value
      onClose();
    }
  };

  const handleCancel = () => {
    // Clear text on explicit cancel, then call the original onClose
    setExtractedPdfText(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        // This handles closing via Esc key or overlay click
        handleCancel();
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transcript Uploaded</DialogTitle>
          <DialogDescription>
            Ready to generate progress note from the transcript.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleGenerate}>Generate Progress Note</Button>
        </DialogFooter>
        <button
          onClick={handleCancel}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          aria-label="Close"
        >
          <CrossSmallIcon size={16} />
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
}
