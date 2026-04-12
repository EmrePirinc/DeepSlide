// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState, useCallback } from 'react';
import type { PresentationImage } from '@/types/presentation';

type ExportState = 'idle' | 'rendering' | 'done' | 'error';

/**
 * Client-side vertical (9:16) video export using Canvas + MediaRecorder.
 * Each slide is drawn for `durationPerSlide` seconds, then recorded.
 */
export function useVerticalExport() {
  const [state, setState] = useState<ExportState>('idle');
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const exportVertical = useCallback(
    async (images: PresentationImage[], durationPerSlideMs = 3000) => {
      if (typeof window === 'undefined') return;
      if (!window.MediaRecorder) {
        setError('Tarayıcınız MediaRecorder desteklemiyor.');
        setState('error');
        return;
      }

      setState('rendering');
      setProgress(0);
      setVideoUrl(null);
      setError(null);

      const W = 1080;
      const H = 1920;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) { setState('error'); setError('Canvas context alınamadı.'); return; }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const chunks: BlobPart[] = [];
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      recorder.start(100);

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        setProgress(Math.round(((i + 1) / images.length) * 100));

        // Load thumbnail
        await new Promise<void>((resolve) => {
          const image = new Image();
          image.onload = () => {
            // Black background
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, W, H);

            // Fit image into 9:16 frame (center-fit, letter/pillar box)
            const scale = Math.min(W / image.width, H / image.height);
            const dw = image.width * scale;
            const dh = image.height * scale;
            const dx = (W - dw) / 2;
            const dy = (H - dh) / 2;
            ctx.drawImage(image, dx, dy, dw, dh);

            // Draw text overlays
            if (img.textOverlays) {
              for (const ov of img.textOverlays) {
                ctx.save();
                ctx.font = `${ov.bold ? 'bold ' : ''}${ov.fontSize * (W / 1000)}px sans-serif`;
                ctx.fillStyle = ov.color;
                ctx.shadowColor = 'rgba(0,0,0,0.9)';
                ctx.shadowBlur = 8;
                ctx.fillText(ov.text, (ov.x / 100) * W, (ov.y / 100) * H);
                ctx.restore();
              }
            }

            // Watermark
            ctx.save();
            ctx.font = 'bold 28px sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.textAlign = 'right';
            ctx.fillText('DeepSlide', W - 24, H - 24);
            ctx.restore();

            resolve();
          };
          image.onerror = () => resolve();
          image.src = img.thumbnailDataUrl;
        });

        // Hold frame for durationPerSlideMs
        await new Promise((r) => setTimeout(r, durationPerSlideMs));
      }

      recorder.stop();

      await new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
      });

      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setState('done');
    },
    [],
  );

  const download = useCallback(
    (title: string) => {
      if (!videoUrl) return;
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_')}_vertical.webm`;
      a.click();
    },
    [videoUrl],
  );

  const reset = useCallback(() => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setState('idle');
    setProgress(0);
    setVideoUrl(null);
    setError(null);
  }, [videoUrl]);

  return { state, progress, videoUrl, error, exportVertical, download, reset };
}
