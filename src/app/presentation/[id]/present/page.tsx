'use client';

import { use, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { usePresentationStore } from '@/stores/presentationStore';
import { useSpeechStore } from '@/stores/speechStore';
import { usePresentationMode } from '@/hooks/usePresentationMode';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useKeywordMatch } from '@/hooks/useKeywordMatch';
import { FocusedSlide } from '@/components/presentation/FocusedSlide';
import { CoverSlide } from '@/components/presentation/CoverSlide';
import { AdaptiveControls } from '@/components/presentation/AdaptiveControls';
import { SlideNavigator } from '@/components/presentation/SlideNavigator';
import { KeywordHint } from '@/components/presentation/KeywordHint';
import { TranscriptOverlay } from '@/components/speech/TranscriptOverlay';
import { getTheme } from '@/lib/themes/presets';
import type { ThemeId } from '@/lib/themes/types';

type PresentMode = 'cover' | 'overview' | 'focused';

export default function PresentationModePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const {
    currentPresentation,
    loadPresentation,
    focusedImageId,
    setFocusedImage,
    isPresenting,
  } = usePresentationStore();
  const { matches } = useSpeechStore();

  const [mode, setMode] = useState<PresentMode>('cover');
  const [lastFocusedId, setLastFocusedId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isPaused, startPresentation, stopPresentation, togglePause } =
    usePresentationMode();
  const { start: startSpeech, stop: stopSpeech } = useSpeechRecognition();

  const settings = currentPresentation?.settings;
  const theme = getTheme((settings?.selectedTheme ?? 'dark') as ThemeId);
  const matchThreshold = settings?.matchThreshold ?? 0.7;
  const overviewTimeout = (settings?.overviewReturnTimeout ?? 10) * 1000;

  useKeywordMatch(matchThreshold);

  // Sunum yükle
  useEffect(() => {
    loadPresentation(id);
  }, [id, loadPresentation]);

  // Sunum başlat
  useEffect(() => {
    if (currentPresentation && !isPresenting) {
      startPresentation();
    }
    return () => { stopSpeech(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPresentation?.id]);

  // Kapaktan çık → overview + ses başlat
  const handleCoverContinue = useCallback(() => {
    setMode('overview');
    if (settings) {
      startSpeech(settings.speechProvider, settings.language);
    }
  }, [settings, startSpeech]);

  // Overview dönüş timeout'u yönet
  const resetOverviewTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setMode('overview');
      setFocusedImage(null);
    }, overviewTimeout);
  }, [overviewTimeout, setFocusedImage]);

  // Görsele odaklan — exact match anında, fuzzy match kısa debounce
  const focusOnImage = useCallback((imageId: string, isExactMatch: boolean = false) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const delay = isExactMatch
      ? 0                              // Exact match → anında
      : mode === 'overview' ? 200 : 500; // Overview→focused: 200ms, focused→focused: 500ms

    if (delay === 0) {
      setFocusedImage(imageId);
      setLastFocusedId(imageId);
      setMode('focused');
      resetOverviewTimeout();
    } else {
      debounceRef.current = setTimeout(() => {
        setFocusedImage(imageId);
        setLastFocusedId(imageId);
        setMode('focused');
        resetOverviewTimeout();
      }, delay);
    }
  }, [setFocusedImage, resetOverviewTimeout, mode]);

  // Keyword eşleşme → focus tetikle
  useEffect(() => {
    if (mode === 'cover' || isPaused) return;
    if (matches.length === 0) return;

    const topMatch = matches[0];
    if (topMatch.imageIds.length > 0) {
      const targetId = topMatch.imageIds[0];
      const isExact = topMatch.score === 1.0;
      if (targetId !== focusedImageId) {
        focusOnImage(targetId, isExact);
      } else {
        // Aynı görsel tekrar eşleşti → timeout resetle
        resetOverviewTimeout();
      }
    }
  }, [matches, mode, isPaused, focusedImageId, focusOnImage, resetOverviewTimeout]);

  // İleri/geri navigasyon fonksiyonları
  const goNext = useCallback(() => {
    if (!currentPresentation) return;
    const imgs = currentPresentation.images;
    if (mode === 'overview') {
      // Overview'den ilk görsele git
      if (imgs.length > 0) focusOnImage(imgs[0].id, true);
      return;
    }
    const idx = imgs.findIndex((img) => img.id === focusedImageId);
    if (idx < imgs.length - 1) {
      focusOnImage(imgs[idx + 1].id, true);
    }
  }, [currentPresentation, mode, focusedImageId, focusOnImage]);

  const goPrev = useCallback(() => {
    if (!currentPresentation || mode !== 'focused') return;
    const imgs = currentPresentation.images;
    const idx = imgs.findIndex((img) => img.id === focusedImageId);
    if (idx > 0) {
      focusOnImage(imgs[idx - 1].id, true);
    } else {
      // İlk görseldeyken geri → overview
      setMode('overview');
      setFocusedImage(null);
    }
  }, [currentPresentation, mode, focusedImageId, focusOnImage, setFocusedImage]);

  // Mevcut pozisyon bilgisi
  const currentIdx = useMemo(() => {
    if (!focusedImageId || !currentPresentation) return -1;
    return currentPresentation.images.findIndex((img) => img.id === focusedImageId);
  }, [focusedImageId, currentPresentation]);

  const handleExit = useCallback(() => {
    stopSpeech();
    stopPresentation();
    setFocusedImage(null);
    router.push(`/presentation/${id}`);
  }, [stopSpeech, stopPresentation, setFocusedImage, router, id]);

  // Keyboard: ok, space, escape + tüm modlarda çalışır
  useEffect(() => {
    if (mode === 'cover' || !currentPresentation) return;

    const handleKey = (e: KeyboardEvent) => {
      // Input/textarea içindeyse atla
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          goPrev();
          break;
        case ' ': // Space = ileri
          e.preventDefault();
          goNext();
          break;
        case 'Escape':
          e.preventDefault();
          if (mode === 'focused') {
            setMode('overview');
            setFocusedImage(null);
          } else {
            handleExit();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mode, currentPresentation, goNext, goPrev, setFocusedImage, handleExit]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleTogglePause = () => {
    if (isPaused) {
      if (settings) startSpeech(settings.speechProvider, settings.language);
    } else {
      stopSpeech();
    }
    togglePause();
  };

  const matchedKeyword = matches.length > 0 ? matches[0].keyword : undefined;

  const focusedImage = useMemo(() => {
    if (!focusedImageId || !currentPresentation) return null;
    return currentPresentation.images.find((img) => img.id === focusedImageId) ?? null;
  }, [focusedImageId, currentPresentation]);

  if (!currentPresentation) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { images } = currentPresentation;

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ backgroundColor: theme.bg }}>
      <AnimatePresence mode="wait">
        {/* COVER MODE */}
        {mode === 'cover' && (
          <CoverSlide
            key="cover"
            title={currentPresentation.title}
            theme={theme}
            onContinue={handleCoverContinue}
          />
        )}

        {/* OVERVIEW MODE */}
        {mode === 'overview' && (
          <motion.div
            key="overview"
            className="w-full h-full p-6 overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="grid gap-3 max-w-7xl mx-auto"
              style={{
                gridTemplateColumns: `repeat(${settings?.columnCount ?? 4}, minmax(0, 1fr))`,
              }}
            >
              {images.map((image) => (
                <motion.div
                  key={image.id}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer ${
                    lastFocusedId === image.id ? 'ring-2 ring-primary' : ''
                  }`}
                  whileHover={{ scale: 1.05, zIndex: 5 }}
                  onClick={() => focusOnImage(image.id)}
                  style={{ filter: lastFocusedId === image.id ? 'brightness(1)' : 'brightness(0.85)' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.thumbnailDataUrl}
                    alt={image.fileName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {image.keywords.length > 0 && (
                    <div
                      className="absolute bottom-0 left-0 right-0 p-1.5"
                      style={{ background: theme.overlayGradient }}
                    >
                      <p
                        className="text-xs truncate"
                        style={{ color: theme.textColor }}
                      >
                        {image.keywords[0]?.text}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* FOCUSED MODE */}
        {mode === 'focused' && focusedImage && (
          <FocusedSlide
            key={`focused-${focusedImage.id}`}
            image={focusedImage}
            allImages={images}
            transitionType={settings?.transitionType ?? 'zoom'}
            theme={theme}
            matchedKeyword={matchedKeyword}
            onImageClick={(imgId) => focusOnImage(imgId)}
          />
        )}
      </AnimatePresence>

      {/* İleri/geri ok navigasyonu (focused modda) */}
      {mode === 'focused' && currentPresentation && (
        <SlideNavigator
          onPrev={goPrev}
          onNext={goNext}
          canPrev={currentIdx > 0}
          canNext={currentIdx < currentPresentation.images.length - 1}
          theme={theme}
        />
      )}

      {/* Keyword hatırlatıcı (sessizlikte) */}
      {mode !== 'cover' && (
        <KeywordHint
          images={images}
          focusedImageId={focusedImageId}
          isListening={!isPaused}
          theme={theme}
        />
      )}

      {/* Transkript — overview ve focused'da göster */}
      {mode !== 'cover' && <TranscriptOverlay />}

      {/* Kontroller */}
      {mode !== 'cover' && settings && (
        <AdaptiveControls
          onExit={handleExit}
          onTogglePause={handleTogglePause}
          isPaused={isPaused}
          speechProvider={settings.speechProvider}
          lang={settings.language}
          onSpeechStart={startSpeech}
          onSpeechStop={stopSpeech}
        />
      )}
    </div>
  );
}
