'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  LiveClient,
  LiveConnectionState,
  LiveTranscriptionEvents,
  type LiveSchema,
  type LiveTranscriptionEvent,
  createClient
} from '@deepgram/sdk';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

enum MicrophoneState {
  NotSetup = -1,
  SettingUp = 0,
  Ready = 1,
  Opening = 2,
  Open = 3,
  Error = 4,
  Pausing = 5, // Not strictly used in this modal but part of original enum
  Paused = 6,
}

enum DeepgramConnectionState {
  NotConnected = 0,
  Connecting = 1,
  Open = 2,
  Closing = 3,
  Closed = 4,
  Error = 5,
}

interface TranscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TranscriptionModal({ isOpen, onClose }: TranscriptionModalProps) {
  const [isTranscribing, setIsTranscribing] = useState(false); // Overall transcribing state
  const [transcript, setTranscript] = useState('');
  const [microphone, setMicrophone] = useState<MediaRecorder | null>(null);
  const [microphoneState, setMicrophoneState] = useState<MicrophoneState>(MicrophoneState.NotSetup);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [deepgramConnection, setDeepgramConnection] = useState<LiveClient | null>(null);
  const [deepgramState, setDeepgramState] = useState<DeepgramConnectionState>(DeepgramConnectionState.NotConnected);

  const microphoneRef = useRef<MediaRecorder | null>(null);
  const deepgramConnectionRef = useRef<LiveClient | null>(null);


  const setupMicrophone = useCallback(async () => {
    console.log('TranscriptionModal: Setting up microphone...');
    setMicrophoneState(MicrophoneState.SettingUp);
    setUserMessage('Setting up microphone...');
    try {
      const userMedia = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
        },
      });
      const mic = new MediaRecorder(userMedia);
      microphoneRef.current = mic;
      setMicrophone(mic);
      setMicrophoneState(MicrophoneState.Ready);
      setUserMessage('Microphone ready. Click "Start Transcription".');
      console.log('TranscriptionModal: Microphone ready.');
    } catch (err) {
      console.error('TranscriptionModal: Error setting up microphone -', err);
      setMicrophoneState(MicrophoneState.Error);
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setUserMessage('Microphone permission denied. Please allow microphone access in your browser settings.');
      } else {
        setUserMessage('Error setting up microphone. Please ensure you have a microphone connected and permissions are allowed.');
      }
    }
  }, []);

  const connectToDeepgram = useCallback(async () => {
    if (deepgramState === DeepgramConnectionState.Connecting || deepgramState === DeepgramConnectionState.Open) {
      console.log('TranscriptionModal: Already connecting or connected to Deepgram.');
      return;
    }
    console.log('TranscriptionModal: Connecting to Deepgram...');
    setDeepgramState(DeepgramConnectionState.Connecting);
    setUserMessage('Connecting to transcription service...');

    try {
      const response = await fetch('/api/deepgram-auth');
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Failed to fetch Deepgram API key: ${response.statusText}`);
      }
      const data = await response.json();
      const { key } = data;
      console.log('TranscriptionModal: Deepgram API key fetched.');

      const dgClient = createClient(key);
      const connectionOptions: LiveSchema = {
        model: 'nova-2', // Or your preferred model
        interim_results: true,
        smart_format: true,
        filler_words: true,
        utterance_end_ms: 3000,
      };
      const conn = dgClient.listen.live(connectionOptions);
      deepgramConnectionRef.current = conn;
      setDeepgramConnection(conn);

      conn.addListener(LiveTranscriptionEvents.Open, () => {
        console.log('TranscriptionModal: Deepgram connection OPEN.');
        setDeepgramState(DeepgramConnectionState.Open);
        setUserMessage('Listening...');
        // Now that Deepgram is connected, start the microphone
        if (microphoneRef.current && microphoneRef.current.state === 'inactive') {
          console.log('TranscriptionModal: Starting microphone recording for Deepgram.');
          microphoneRef.current.start(250); // Timeslice for dataavailable events
          setMicrophoneState(MicrophoneState.Open);
          setIsTranscribing(true);
        }
      });

      conn.addListener(LiveTranscriptionEvents.Close, (event) => {
        console.log('TranscriptionModal: Deepgram connection CLOSED.', event);
        setDeepgramState(DeepgramConnectionState.Closed);
        // No need to stop mic here as it's handled by overall stop logic or modal close
      });

      conn.addListener(LiveTranscriptionEvents.Error, (error) => {
        console.error('TranscriptionModal: Deepgram connection ERROR -', error);
        setDeepgramState(DeepgramConnectionState.Error);
        setUserMessage(`Transcription service error: ${error.message}`);
        setIsTranscribing(false);
      });

      conn.addListener(LiveTranscriptionEvents.Transcript, (data: LiveTranscriptionEvent) => {
        const transcriptText = data.channel.alternatives[0].transcript;
        if (transcriptText) {
          if (data.is_final) {
            // Append final transcript to the transcript state
            setTranscript((prev) => prev + transcriptText + ' ');
          } else {
            // For interim results, we might want to show them differently or just log
            // For simplicity in MVP, we can append them too, or replace the last part
            // console.log('Interim transcript:', transcriptText);
            // Or, to show only the latest interim:
            // setTranscript(prev => prev.substring(0, prev.lastIndexOf(' ') + 1) + transcriptText);
          }
        }
        if (data.speech_final) {
          // Potentially do something when a full utterance is final
          console.log('TranscriptionModal: Speech final detected.');
        }
      });

      // Listener for microphone data
      if (microphoneRef.current) {
        microphoneRef.current.ondataavailable = (event: BlobEvent) => {
          if (event.data.size > 0 && deepgramConnectionRef.current && deepgramConnectionRef.current.getReadyState() === 1 /* OPEN_STATE */) {
            deepgramConnectionRef.current.send(event.data);
          }
        };
      }

    } catch (error) {
      console.error('TranscriptionModal: Error connecting to Deepgram -', error);
      setDeepgramState(DeepgramConnectionState.Error);
      setUserMessage(error instanceof Error ? error.message : 'Failed to connect to transcription service.');
      setIsTranscribing(false);
    }
  }, [deepgramState]);


  const disconnectFromDeepgram = useCallback(() => {
    if (deepgramConnectionRef.current) {
      console.log('TranscriptionModal: Closing Deepgram connection.');
      setDeepgramState(DeepgramConnectionState.Closing);
      deepgramConnectionRef.current.finish();
      deepgramConnectionRef.current = null;
      setDeepgramConnection(null);
      setDeepgramState(DeepgramConnectionState.Closed); // Assume closed after finish
    }
  }, []);


  useEffect(() => {
    if (isOpen) {
      if (microphoneState === MicrophoneState.NotSetup || microphoneState === MicrophoneState.Error) {
        setupMicrophone();
      }
    } else {
      // Cleanup when modal closes
      if (microphoneRef.current && microphoneRef.current.state !== 'inactive') {
        microphoneRef.current.stop();
      }
      microphoneRef.current?.stream.getTracks().forEach(track => track.stop());
      disconnectFromDeepgram();
      setMicrophone(null);
      setMicrophoneState(MicrophoneState.NotSetup);
      setIsTranscribing(false);
      setTranscript('');
      setUserMessage(null);
      setDeepgramState(DeepgramConnectionState.NotConnected);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, disconnectFromDeepgram]); // setupMicrophone is memoized


  const handleStartTranscription = () => {
    if (microphoneState === MicrophoneState.Ready && deepgramState !== DeepgramConnectionState.Open && deepgramState !== DeepgramConnectionState.Connecting) {
      setTranscript(''); // Clear previous transcript
      connectToDeepgram();
    } else if (microphoneState === MicrophoneState.Error || microphoneState === MicrophoneState.NotSetup) {
      setUserMessage('Microphone not ready. Trying to set up again...');
      setupMicrophone();
    } else if (deepgramState === DeepgramConnectionState.Open) {
       setUserMessage('Already transcribing.');
    } else {
      console.log('TranscriptionModal: Cannot start, microphone or Deepgram not ready.');
      setUserMessage('System not ready. Please wait or check permissions.');
    }
  };

  const handleStopTranscription = () => {
    console.log('TranscriptionModal: Stop Transcription clicked by user.');
    if (microphoneRef.current && microphoneRef.current.state === 'recording') {
      microphoneRef.current.stop(); // This will trigger dataavailable with last chunk
      console.log('TranscriptionModal: Microphone stopped by user.');
    }
    setMicrophoneState(MicrophoneState.Ready); // Or Paused
    disconnectFromDeepgram();
    setIsTranscribing(false);
    setUserMessage('Transcription stopped.');
  };

  const handleCopyTranscript = () => {
    if (transcript) {
      navigator.clipboard.writeText(transcript);
      console.log('TranscriptionModal: Transcript copied -', transcript);
      setUserMessage('Transcript copied!');
      setTimeout(() => setUserMessage(isTranscribing ? 'Listening...' : null), 2000);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Live Transcription</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="h-40 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 overflow-y-auto" aria-live="polite">
            {transcript || userMessage || 'Click "Start Transcription" to begin.'}
          </div>
          {microphoneState === MicrophoneState.Error && userMessage && (
            <p className="text-sm text-red-500">{userMessage}</p>
          )}
        </div>
        <DialogFooter className="gap-2 sm:flex-col sm:space-y-2 md:flex-row md:justify-between">
          <div className="flex gap-2">
            <Button
              onClick={handleStartTranscription}
              disabled={isTranscribing || microphoneState === MicrophoneState.SettingUp || microphoneState === MicrophoneState.Opening}
              variant="outline"
            >
              {isTranscribing ? 'Transcribing...' : 'Start Transcription'}
            </Button>
            <Button
              onClick={handleStopTranscription}
              disabled={!isTranscribing}
              variant="outline"
            >
              Stop Transcription
            </Button>
          </div>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <Button
              onClick={handleCopyTranscript}
              disabled={isTranscribing || !transcript.trim()}
              variant="outline"
            >
              Copy Transcript
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
