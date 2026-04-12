// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getNote } from '@/lib/db/notes';
import { getPresentation } from '@/lib/db/presentations';
import { useAuth } from '@/hooks/useAuth';

export default function PresenterNotesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [noteText, setNoteText] = useState<string>('');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  const [nextThumbnail, setNextThumbnail] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auth guard — only owner can view notes
  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace('/auth/login'); return; }

    getPresentation(id).then((p) => {
      if (!p) { router.replace('/'); return; }
      setTotalSlides(p.images.length);
    });
  }, [id, user, authLoading, router]);

  // Elapsed timer
  useEffect(() => {
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Poll active slide from localStorage (set by present page)
  useEffect(() => {
    if (!user) return;
    const ACTIVE_KEY = `deepslide_active_slide_${id}`;

    const syncSlide = async () => {
      const stored = localStorage.getItem(ACTIVE_KEY);
      if (!stored) return;
      try {
        const { slideId, slideIndex } = JSON.parse(stored) as { slideId: string; slideIndex: number };
        setActiveSlideIndex(slideIndex);

        const note = await getNote(id, slideId);
        setNoteText(note?.text ?? '');

        // Next slide thumbnail
        const p = await getPresentation(id);
        if (p && p.images[slideIndex + 1]) {
          setNextThumbnail(p.images[slideIndex + 1].thumbnailDataUrl ?? null);
        } else {
          setNextThumbnail(null);
        }
      } catch { /* ignore */ }
    };

    syncSlide();
    const poller = setInterval(syncSlide, 500);
    return () => clearInterval(poller);
  }, [id, user]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span className="font-mono text-lg font-semibold text-white">{formatTime(elapsed)}</span>
        <span>{activeSlideIndex + 1} / {totalSlides}</span>
        {nextThumbnail && (
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-gray-500">Sonraki</span>
            <img
              src={nextThumbnail}
              alt="Sonraki slayt"
              className="h-10 w-16 object-cover rounded border border-gray-700"
            />
          </div>
        )}
      </div>

      {/* Note content */}
      <div className="flex-1 overflow-y-auto">
        {noteText ? (
          <p
            className="leading-relaxed text-gray-100 whitespace-pre-wrap"
            style={{ fontSize: '1.125rem', minHeight: '3rem' }}
          >
            {noteText}
          </p>
        ) : (
          <p className="text-gray-600 italic" style={{ fontSize: '1rem' }}>
            Bu slayt için not yok
          </p>
        )}
      </div>

      {/* Slide indicator dots */}
      {totalSlides > 0 && (
        <div className="flex gap-1 justify-center flex-wrap">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === activeSlideIndex ? 'w-4 bg-white' : 'w-1.5 bg-gray-600'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
