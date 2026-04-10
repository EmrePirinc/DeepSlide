// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useCallback, useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { recordingService, type RecordingState } from '@/lib/recording/recordingService';
import { UploadOrchestrator } from '@/lib/recording/uploadOrchestrator';
import { getMaxResolution, shouldShowUpgradePrompt } from '@/lib/recording/qualityGate';
import { isScreenCaptureSupported } from '@/lib/recording/codecDetector';
import type { RecordingResult } from '@/lib/recording/recordingService';

export type UploadStatus = 'idle' | 'uploading' | 'done' | 'error';

interface UseRecordingOptions {
  isPro: boolean;
}

interface UseRecordingReturn {
  recordingState: RecordingState;
  isSafariMode: boolean;
  uploadStatus: UploadStatus;
  uploadProgress: number;
  shareUrl: string | null;
  shareKey: string | null;
  showUpgradePrompt: boolean;
  lastResult: RecordingResult | null;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  error: string | null;
}

function generateRecordingId(uid: string): string {
  return `${uid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useRecording({ isPro }: UseRecordingOptions): UseRecordingReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [isSafariMode, setIsSafariMode] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareKey, setShareKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<RecordingResult | null>(null);

  useEffect(() => {
    recordingService.on('stateChange', setRecordingState);
    recordingService.on('error', (err) => setError(err.message));
  }, []);

  const getAuthToken = useCallback(async (): Promise<string> => {
    const user = getAuth().currentUser;
    if (!user) throw new Error('Oturum açmanız gerekiyor');
    return user.getIdToken();
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setShareUrl(null);
    setShareKey(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setLastResult(null);

    const user = getAuth().currentUser;
    if (!user) { setError('Oturum açmanız gerekiyor'); return; }

    const recordingId = generateRecordingId(user.uid);
    const quality = getMaxResolution(isPro);

    try {
      const { isSafariMode: safari } = await recordingService.start({
        quality,
        includeScreen: isScreenCaptureSupported(),
        recordingId,
      });
      setIsSafariMode(safari);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt başlatılamadı');
    }
  }, [isPro]);

  const stop = useCallback(async () => {
    try {
      const result = await recordingService.stop();
      setLastResult(result);

      const authToken = await getAuthToken();
      setUploadStatus('uploading');

      const orchestrator = new UploadOrchestrator();
      orchestrator.on('progress', (p) => setUploadProgress(p));
      orchestrator.on('complete', (key, url) => {
        setUploadStatus('done');
        setShareKey(key);
        setShareUrl(url);
      });
      orchestrator.on('error', (err) => {
        setUploadStatus('error');
        setError(err.message);
      });

      await orchestrator.start({
        recordingId: result.recordingId,
        mimeType: result.mimeType,
        extension: result.extension,
        authToken,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt durdurulamadı');
    }
  }, [getAuthToken]);

  return {
    recordingState,
    isSafariMode,
    uploadStatus,
    uploadProgress,
    shareUrl,
    shareKey,
    showUpgradePrompt: shouldShowUpgradePrompt(isPro),
    lastResult,
    start,
    stop,
    error,
  };
}
