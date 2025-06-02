import { useState, useRef, useCallback } from 'react';
import axios from 'axios';

export const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string) => {
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

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/text2speech/`, payload, {
        responseType: 'blob'
      });

      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);  // libera vecchio URL
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Aggiorna stato a play
      audio.onplay = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };

      // Aggiorna stato a pausa
      audio.onpause = () => {
        setIsPaused(true);
      };

      // Aggiorna stato a stop / fine
      audio.onended = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      await audio.play();

    } catch (error) {
      console.error("Errore nella sintesi vocale:", error);
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play();
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, []);

  return {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    isSupported: true  // Non usi più speechSynthesis, quindi lo dichiari supportato
  };
};
