// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { use, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { usePresentationStore } from '@/stores/presentationStore';
import { useSpeechStore } from '@/stores/speechStore';
import { usePresentationMode } from '@/hooks/usePresentationMode';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useKeywordMatch } from '@/hooks/useKeywordMatch';
import { useRecording } from '@/hooks/useRecording';
import { useTranscriptCapture } from '@/hooks/useTranscriptCapture';
import { useSubtitles } from '@/hooks/useSubtitles';
import { useAuth } from '@/hooks/useAuth';
import { FocusedSlide } from '@/components/presentation/FocusedSlide';
import { CoverSlide } from '@/components/presentation/CoverSlide';
import { AdaptiveControls } from '@/components/presentation/AdaptiveControls';
import { SlideNavigator } from '@/components/presentation/SlideNavigator';
import { KeywordHint } from '@/components/presentation/KeywordHint';
import { TranscriptOverlay } from '@/components/speech/TranscriptOverlay';
import { PaywallBanner } from '@/components/billing/PaywallBanner';
import { WatermarkOverlay } from '@/components/billing/WatermarkOverlay';
import { RecordingButton } from '@/components/recording/RecordingButton';
import { RecordingTimer } from '@/components/recording/RecordingTimer';
import { UploadProgress } from '@/components/recording/UploadProgress';
import { PostPresentationModal } from '@/components/recording/PostPresentationModal';
import { KvkkConsentModal } from '@/components/recording/KvkkConsentModal';
import { SubtitleStrip } from '@/components/subtitle/SubtitleStrip';
import { LanguageSelector, type SubtitleLanguage } from '@/components/subtitle/LanguageSelector';
import { LiveStreamPanel } from '@/components/livestream/LiveStreamPanel';
import { LiveStatusBadge } from '@/components/livestream/LiveStatusBadge';
import { liveStreamService } from '@/lib/livestream/liveStreamService';
import type { LiveStreamStatus } from '@/lib/livestream/liveStreamService';
import { useSpeechPaywall } from '@/hooks/useSpeechPaywall';
import { getTheme } from '@/lib/themes/presets';
import type { ThemeId } from '@/lib/themes/types';

type PresentMode = 'cover' | 'overview' | 'focused';
type KvkkPendingFeature = 'subtitle' | 'summary' | null;

export default function PresentationModePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { isPremium } = useAuth();

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

  // UI state
  const [showKvkk, setShowKvkk] = useState(false);
  const [kvkkPendingFeature, setKvkkPendingFeature] = useState<KvkkPendingFeature>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [liveStatus, setLiveStatus] = useState<LiveStreamStatus>('idle');
  const [subtitleEnabled, setSubtitleEnabled] = useState(false);
  const [subtitleLang, setSubtitleLang] = useState<SubtitleLanguage>('tr');

  const { isPaused, startPresentation, stopPresentation, togglePause } =
    usePresentationMode();
  const { start: startSpeech, stop: stopSpeech } = useSpeechRecognition();

  const settings = currentPresentation?.settings;
  const theme = getTheme((settings?.selectedTheme ?? 'dark') as ThemeId);
  const matchThreshold = settings?.matchThreshold ?? 0.7;
  const overviewTimeout = (settings?.overviewReturnTimeout ?? 10) * 1000;

  // Recording integration
  const {
    recordingState,
    isSafariMode,
    uploadStatus,
    uploadProgress,
    shareUrl,
    lastResult,
    start: startRecording,
    stop: stopRecording,
  } = useRecording({ isPro: isPremium });

  // Transcript capture (bridges speech → transcript store)
  useTranscriptCapture(mode !== 'cover' && !isPaused);

  // Subtitle hook
  const { currentText: currentSubtitle } = useSubtitles({
    enabled: subtitleEnabled && mode !== 'cover',
    language: subtitleLang,
    provider: isPremium ? 'deepgram' : 'webspeech',
  });

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

  // Kayıt bitince post-presentation modal göster
  useEffect(() => {
    if (uploadStatus === 'done' || uploadStatus === 'uploading') {
      if (!showPostModal) {
        setShowPostModal(true);
      }
    }
  }, [uploadStatus, showPostModal]);

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
      ? 0
      : mode === 'overview' ? 200 : 500;

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
        resetOverviewTimeout();
      }
    }
  }, [matches, mode, isPaused, focusedImageId, focusOnImage, resetOverviewTimeout]);

  // İleri/geri navigasyon
  const goNext = useCallback(() => {
    if (!currentPresentation) return;
    const imgs = currentPresentation.images;
    if (mode === 'overview') {
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
      setMode('overview');
      setFocusedImage(null);
    }
  }, [currentPresentation, mode, focusedImageId, focusOnImage, setFocusedImage]);

  const currentIdx = useMemo(() => {
    if (!focusedImageId || !currentPresentation) return -1;
    return currentPresentation.images.findIndex((img) => img.id === focusedImageId);
  }, [focusedImageId, currentPresentation]);

  const handleExit = useCallback(async () => {
    stopSpeech();
    stopPresentation();
    setFocusedImage(null);
    // Kayıt devam ediyorsa durdur
    if (recordingState === 'recording') {
      await stopRecording();
      // PostPresentationModal upload effect ile açılacak
      return;
    }
    router.push(`/presentation/${id}`);
  }, [stopSpeech, stopPresentation, setFocusedImage, router, id, recordingState, stopRecording]);

  // Alt yazı toggle — KVKK gerektiriyor (Pro Deepgram için)
  const handleToggleSubtitle = useCallback(() => {
    if (!subtitleEnabled && isPremium) {
      // Pro Deepgram için KVKK onayı iste
      setKvkkPendingFeature('subtitle');
      setShowKvkk(true);
    } else {
      setSubtitleEnabled((v) => !v);
    }
  }, [subtitleEnabled, isPremium]);

  // KVKK onay/red
  const handleKvkkAccept = useCallback(() => {
    setShowKvkk(false);
    if (kvkkPendingFeature === 'subtitle') {
      setSubtitleEnabled(true);
    }
    setKvkkPendingFeature(null);
  }, [kvkkPendingFeature]);

  const handleKvkkDeny = useCallback(() => {
    setShowKvkk(false);
    // Alt yazıyı WebSpeech ile aç (KVKK gerektirmez)
    if (kvkkPendingFeature === 'subtitle') {
      setSubtitleEnabled(true);
    }
    setKvkkPendingFeature(null);
  }, [kvkkPendingFeature]);

  // Keyboard
  useEffect(() => {
    if (mode === 'cover' || !currentPresentation) return;

    const handleKey = (e: KeyboardEvent) => {
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
        case ' ':
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

  // Canlı yayın status dinle
  useEffect(() => {
    liveStreamService.on('statusChange', setLiveStatus);
    setLiveStatus(liveStreamService.getStatus());
  }, []);

  // Cleanup
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

  const imageCount = currentPresentation?.images.length ?? 0;
  const { isPaywalled } = useSpeechPaywall(imageCount, Math.max(0, currentIdx));

  // Paywall geçişlerini takip et: true→false olunca sesi yeniden başlat
  const prevIsPaywalledRef = useRef<boolean | null>(null);
  useEffect(() => {
    const prev = prevIsPaywalledRef.current;
    prevIsPaywalledRef.current = isPaywalled;

    if (isPaywalled && !isPaused) {
      stopSpeech();
    } else if (!isPaywalled && prev === true && !isPaused && mode !== 'cover' && settings) {
      // Paywall kalktı (örn. önceki slayta döndü), sesi yeniden başlat
      startSpeech(settings.speechProvider, settings.language);
    }
  }, [isPaywalled, isPaused, mode, settings, stopSpeech, startSpeech]);

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
      <LayoutGroup>
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
                  layoutId={`slide-${image.id}`}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer ${
                    lastFocusedId === image.id ? 'ring-2 ring-primary' : ''
                  }`}
                  whileHover={{ scale: 1.05, zIndex: 5 }}
                  onClick={() => focusOnImage(image.id)}
                  style={{ filter: lastFocusedId === image.id ? 'brightness(1)' : 'brightness(0.85)' }}
                  transition={{ type: 'spring', stiffness: 200, damping: 30 }}
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
      </LayoutGroup>

      {/* Slide navigator */}
      {mode === 'focused' && currentPresentation && (
        <SlideNavigator
          onPrev={goPrev}
          onNext={goNext}
          canPrev={currentIdx > 0}
          canNext={currentIdx < currentPresentation.images.length - 1}
          theme={theme}
        />
      )}

      {/* Keyword hint */}
      {mode !== 'cover' && (
        <KeywordHint
          images={images}
          focusedImageId={focusedImageId}
          isListening={!isPaused}
          theme={theme}
        />
      )}

      {/* Transcript overlay */}
      {mode !== 'cover' && <TranscriptOverlay />}

      {/* Alt yazı şeridi */}
      {mode !== 'cover' && (
        <SubtitleStrip text={currentSubtitle} isActive={subtitleEnabled && !!currentSubtitle} />
      )}

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
          presentationTitle={currentPresentation.title}
        />
      )}

      {/* Kayıt kontrolleri — sağ üst köşe */}
      {mode !== 'cover' && (
        <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
          {/* Canlı yayın durumu */}
          <LiveStatusBadge status={liveStatus} />

          {/* Kayıt süresi */}
          {recordingState === 'recording' && (
            <RecordingTimer isRecording={true} />
          )}

          {/* Upload ilerleme */}
          {(uploadStatus === 'uploading' || uploadStatus === 'done') && !showPostModal && (
            <UploadProgress
              status={uploadStatus}
              progress={uploadProgress}
              shareUrl={shareUrl ?? undefined}
              onRetry={startRecording}
            />
          )}

          {/* Kayıt butonu */}
          <RecordingButton
            state={recordingState}
            isSafariMode={isSafariMode}
            onStart={startRecording}
            onStop={stopRecording}
          />

          {/* Alt yazı toggle */}
          <button
            onClick={handleToggleSubtitle}
            className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
              subtitleEnabled
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
            }`}
            title="Alt Yazı"
          >
            CC
          </button>

          {/* Dil seçici — alt yazı açıkken */}
          {subtitleEnabled && (
            <LanguageSelector
              value={subtitleLang}
              onChange={setSubtitleLang}
            />
          )}

          {/* Canlı yayın toggle (Pro) */}
          {isPremium && (
            <button
              onClick={() => setShowLiveStream((v) => !v)}
              className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
                showLiveStream
                  ? 'bg-red-500 text-white'
                  : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
              }`}
              title="Canlı Yayın"
            >
              CANLI
            </button>
          )}
        </div>
      )}

      {/* Paywall Banner */}
      {mode !== 'cover' && isPaywalled && (
        <PaywallBanner
          onUpgrade={() => {
            stopSpeech();
            stopPresentation();
            router.push('/billing');
          }}
        />
      )}

      {/* Watermark */}
      {mode !== 'cover' && <WatermarkOverlay />}

      {/* Canlı Yayın Paneli */}
      <AnimatePresence>
        {showLiveStream && (
          <motion.div
            className="fixed bottom-24 right-4 z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="relative">
              <button
                onClick={() => setShowLiveStream(false)}
                className="absolute -top-2 -right-2 z-10 h-5 w-5 rounded-full bg-zinc-700 text-white/60 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
              <LiveStreamPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KVKK Onay Modal */}
      {showKvkk && kvkkPendingFeature && (
        <KvkkConsentModal
          feature={kvkkPendingFeature === 'subtitle' ? 'Deepgram Alt Yazı' : 'AI Özet'}
          onAccept={handleKvkkAccept}
          onDeny={handleKvkkDeny}
        />
      )}

      {/* Post-Presentation Modal */}
      {showPostModal && uploadStatus !== 'idle' && (
        <PostPresentationModal
          recordingId={lastResult?.recordingId ?? null}
          shareUrl={shareUrl}
          uploadStatus={uploadStatus as 'uploading' | 'done' | 'error'}
          uploadProgress={uploadProgress}
          presentationTitle={currentPresentation.title}
          isPro={isPremium}
          onClose={() => {
            setShowPostModal(false);
            if (recordingState === 'idle') {
              router.push(`/presentation/${id}`);
            }
          }}
        />
      )}
    </div>
  );
}
