'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePresentationStore } from '@/stores/presentationStore';

export function usePresentationMode() {
  const { setIsPresenting } = usePresentationStore();
  const [isPaused, setIsPaused] = useState(false);

  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // Fullscreen izni verilmemiş olabilir
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // Zaten fullscreen değil
    }
  }, []);

  const startPresentation = useCallback(async () => {
    setIsPresenting(true);
    setIsPaused(false);
    await enterFullscreen();
  }, [setIsPresenting, enterFullscreen]);

  const stopPresentation = useCallback(async () => {
    setIsPresenting(false);
    setIsPaused(false);
    await exitFullscreen();
  }, [setIsPresenting, exitFullscreen]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // Klavye kısayolları
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          stopPresentation();
          break;
        case ' ':
          e.preventDefault();
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stopPresentation, togglePause]);

  // Fullscreen değişikliğini izle
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsPresenting(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [setIsPresenting]);

  return {
    isPaused,
    startPresentation,
    stopPresentation,
    togglePause,
  };
}
