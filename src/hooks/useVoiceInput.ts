import { useState, useRef, useCallback, useEffect } from 'react';

type RecognitionStatus = 'idle' | 'listening' | 'processing' | 'error' | 'unsupported';

interface UseVoiceInputResult {
  status: RecognitionStatus;
  transcript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useVoiceInput(): UseVoiceInputResult {
  const [status, setStatus] = useState<RecognitionStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const isSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) {
      setStatus('unsupported');
    }
  }, [isSupported]);

  const start = useCallback(() => {
    if (!isSupported) {
      setStatus('unsupported');
      setError('Voice input is not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('error');
      setError('Speech recognition not available');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setStatus('listening');
      setError(null);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      let final = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcriptPart;
        } else {
          interim += transcriptPart;
        }
      }
      setTranscript(final + interim);
    };

    recognition.onerror = (event: any) => {
      setStatus('error');
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone permission in your browser settings.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please try speaking again or use the touch options below.');
      } else if (event.error === 'network') {
        setError('Network error during voice recognition. Please use the touch options below.');
      } else if (event.error === 'service-not-allowed') {
        setError('Voice recognition needs HTTPS. Please use the touch options below.');
      } else {
        setError('Voice input unavailable. Please use the touch options below.');
      }
    };

    recognition.onend = () => {
      setStatus((prev) => (prev === 'listening' ? 'idle' : prev));
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setStatus('error');
      setError('Could not start voice input. Please try again.');
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setStatus('idle');
    }
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
    setStatus('idle');
  }, []);

  return { status, transcript, error, start, stop, reset };
}
