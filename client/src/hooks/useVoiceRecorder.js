import { useState, useCallback } from 'react';

/**
 * Custom hook for voice recording using Web Speech API
 * Supports Tamil (ta-IN), Hindi (hi-IN), and English (en-IN)
 */
export function useVoiceRecorder(language = 'ta-IN') {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  // Check if Web Speech API is supported
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    if (isSupported) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser');
    }
  }

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      switch (event.error) {
        case 'not-allowed':
          setError('Microphone access denied. Please allow microphone access.');
          break;
        case 'no-speech':
          setError('No speech detected. Please try again.');
          break;
        case 'network':
          setError('Network error. Please check your connection.');
          break;
        default:
          setError(`Error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();

    // Store recognition instance for stopping
    window.currentRecognition = recognition;
  }, [language, SpeechRecognition]);

  const stopListening = useCallback(() => {
    if (window.currentRecognition) {
      window.currentRecognition.stop();
      window.currentRecognition = null;
    }
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    clearTranscript
  };
}

export default useVoiceRecorder;
