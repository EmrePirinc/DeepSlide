'use client';

import { useState, useCallback, useRef } from 'react';
import type { AIProviderType } from '@/types/presentation';
import { usePresentationStore } from '@/stores/presentationStore';
import {
  analyzeBatch,
  analysisResultToKeywords,
  type BatchProgress,
} from '@/lib/ai/analyzeBatch';

interface AnalysisState {
  isAnalyzing: boolean;
  total: number;
  completed: number;
  failed: number;
}

export function useAIAnalysis() {
  const { currentPresentation, updateImage } = usePresentationStore();
  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    total: 0,
    completed: 0,
    failed: 0,
  });
  const abortRef = useRef(false);

  const stopAnalysis = useCallback(() => {
    abortRef.current = true;
    setState((prev) => ({ ...prev, isAnalyzing: false }));
  }, []);

  const startAnalysis = useCallback(
    async (providerType: AIProviderType, language: string = 'tr') => {
      if (!currentPresentation) return;

      const pendingImages = currentPresentation.images.filter(
        (img) => img.analysisStatus === 'pending' || img.analysisStatus === 'failed'
      );

      if (pendingImages.length === 0) return;

      abortRef.current = false;
      setState({
        isAnalyzing: true,
        total: pendingImages.length,
        completed: 0,
        failed: 0,
      });

      const handleProgress = async (progress: BatchProgress) => {
        if (abortRef.current) return;

        if (progress.status === 'analyzing') {
          await updateImage(progress.imageId, { analysisStatus: 'analyzing' });
        } else if (progress.status === 'completed' && progress.result) {
          const keywords = analysisResultToKeywords(progress.result);
          await updateImage(progress.imageId, {
            analysisStatus: 'completed',
            keywords,
          });
          setState((prev) => ({
            ...prev,
            completed: prev.completed + 1,
          }));
        } else if (progress.status === 'failed') {
          await updateImage(progress.imageId, {
            analysisStatus: 'failed',
            analysisError: progress.error,
          });
          setState((prev) => ({
            ...prev,
            completed: prev.completed + 1,
            failed: prev.failed + 1,
          }));
        }
      };

      await analyzeBatch(pendingImages, providerType, handleProgress, language, () => abortRef.current);

      setState((prev) => ({ ...prev, isAnalyzing: false }));
    },
    [currentPresentation, updateImage]
  );

  const retryFailed = useCallback(
    async (providerType: AIProviderType, language: string = 'tr') => {
      if (!currentPresentation) return;

      const failedImages = currentPresentation.images.filter(
        (img) => img.analysisStatus === 'failed'
      );

      for (const img of failedImages) {
        await updateImage(img.id, {
          analysisStatus: 'pending',
          analysisError: undefined,
        });
      }

      await startAnalysis(providerType, language);
    },
    [currentPresentation, updateImage, startAnalysis]
  );

  const reanalyzeAll = useCallback(
    async (providerType: AIProviderType, language: string = 'tr') => {
      if (!currentPresentation) return;

      for (const img of currentPresentation.images) {
        await updateImage(img.id, {
          analysisStatus: 'pending',
          analysisError: undefined,
          keywords: [],
        });
      }

      await startAnalysis(providerType, language);
    },
    [currentPresentation, updateImage, startAnalysis]
  );

  return {
    ...state,
    startAnalysis,
    stopAnalysis,
    retryFailed,
    reanalyzeAll,
  };
}
