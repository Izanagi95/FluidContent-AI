import { useState, useRef, useCallback } from 'react';
import axios from 'axios';


export const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // const speak = useCallback((text: string) => {
  //   if (!('speechSynthesis' in window)) {
  //     console.error('Speech synthesis not supported');
  //     return;
  //   }

  //   // Stop any current speech
  //   window.speechSynthesis.cancel();

  //   // Clean HTML tags from text
  //   const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  //   const utterance = new SpeechSynthesisUtterance(cleanText);
  //   utteranceRef.current = utterance;

  //   utterance.rate = 0.9;
  //   utterance.pitch = 1;
  //   utterance.volume = 1;

  //   utterance.onstart = () => {
  //     setIsPlaying(true);
  //     setIsPaused(false);
  //   };

  //   utterance.onend = () => {
  //     setIsPlaying(false);
  //     setIsPaused(false);
  //   };

  //   utterance.onerror = () => {
  //     setIsPlaying(false);
  //     setIsPaused(false);
  //   };

  //   window.speechSynthesis.speak(utterance);
  // }, []);



  const speak = async (text: string) => {
  try {
    const payload = {
      user: {
        user_id: "user001",
        name: "Alice",
        age: 8,
        preferred_voice_gender: "female",
        preferred_voice_style: "energetic",
        interests: ["cartoons", "fairy tales"]
      },
      content: {
        title: "",
        original_text: text
      }
    };

    // Chiamata POST a FastAPI
    const response = await axios.post(`${ import.meta.env.VITE_API_URL }/text2speech/`, payload, {
      responseType: 'blob'  // IMPORTANTISSIMO per ricevere dati audio binari
    });

    // Creiamo un URL per l’audio ricevuto
    const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);

    // Riproduciamo l’audio
    const audio = new Audio(audioUrl);
    audio.play();

  } catch (error) {
    console.error("Errore nella sintesi vocale:", error);
  }
};

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  return {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    isSupported: 'speechSynthesis' in window
  };
};
