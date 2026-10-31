import { useState, useEffect, useRef, useCallback } from 'react';

// Declare types for Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

interface UseSpeechToTextOptions {
  onTranscriptChange?: (text: string, isFinal: boolean) => void;
  lang?: string;
}

export function useSpeechToText(options: UseSpeechToTextOptions = {}) {
  const { onTranscriptChange, lang = 'en-US' } = options;
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang;

        recognition.onstart = () => {
          setIsListening(true);
          setErrorMessage(null);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let currentInterim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              if (onTranscriptChange) {
                onTranscriptChange(transcript, true);
              }
            } else {
              currentInterim += transcript;
            }
          }
          setInterimText(currentInterim);
          if (currentInterim && onTranscriptChange) {
            onTranscriptChange(currentInterim, false);
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.warn('Speech recognition error event:', event.error);
          if (event.error === 'not-allowed') {
            setErrorMessage('Microphone access was denied. Please check browser microphone permissions.');
          } else if (event.error === 'no-speech') {
            // normal timeout when quiet
          } else {
            setErrorMessage(`Dictation note: ${event.error}`);
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimText('');
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Error initializing SpeechRecognition:', err);
        setIsSupported(false);
      }
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, [lang, onTranscriptChange]);

  const startListening = useCallback(() => {
    setErrorMessage(null);
    if (!recognitionRef.current) {
      setErrorMessage('Browser speech recognition engine is not active.');
      return;
    }
    try {
      recognitionRef.current.start();
    } catch (e: any) {
      // If already started or pending
      if (e.name !== 'InvalidStateError') {
        setErrorMessage(e.message || 'Could not start microphone');
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Demo injection helper for environments without mic permissions
  const injectSampleDictation = useCallback(
    (phrase: string) => {
      if (onTranscriptChange) {
        onTranscriptChange(phrase, true);
      }
    },
    [onTranscriptChange]
  );

  return {
    isListening,
    isSupported,
    interimText,
    errorMessage,
    startListening,
    stopListening,
    toggleListening,
    injectSampleDictation,
    clearError: () => setErrorMessage(null),
  };
}

