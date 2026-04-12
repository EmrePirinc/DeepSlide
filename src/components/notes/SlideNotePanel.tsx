// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronDown, ChevronUp, NotebookPen } from 'lucide-react';
import { saveNote, getNote } from '@/lib/db/notes';

const MAX_CHARS = 1000;

interface SlideNotePanelProps {
  slideId: string;
  presentationId: string;
}

export function SlideNotePanel({ slideId, presentationId }: SlideNotePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const autosaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load note when slide changes
  useEffect(() => {
    if (!slideId || !presentationId) return;
    setText('');
    setSaved(false);
    getNote(presentationId, slideId).then((note) => {
      if (note) setText(note.text);
    });
  }, [slideId, presentationId]);

  const doSave = useCallback(async (value: string) => {
    setIsSaving(true);
    await saveNote(presentationId, slideId, value);
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [presentationId, slideId]);

  const handleChange = (value: string) => {
    const clamped = value.substring(0, MAX_CHARS);
    setText(clamped);
    setSaved(false);

    // Autosave after 2s of inactivity
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(() => doSave(clamped), 2000);
  };

  useEffect(() => {
    return () => {
      if (autosaveRef.current) clearTimeout(autosaveRef.current);
    };
  }, []);

  return (
    <div className="border-t bg-background">
      {/* Toggle */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Notları gizle' : 'Not ekle'}
      >
        <NotebookPen size={13} />
        <span className="font-medium">Presenter Notları</span>
        <span className="ml-auto">{isOpen ? <ChevronDown size={13} /> : <ChevronUp size={13} />}</span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 flex flex-col gap-2">
          <textarea
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Bu slayt için notlarınızı yazın… (yalnızca siz görürsünüz)"
            className="w-full h-24 resize-none rounded-lg border bg-muted/30 px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/50 transition-shadow"
            style={{ fontSize: '0.875rem', minHeight: '4rem' }}
            aria-label="Slayt notu"
          />
          <div className="flex items-center justify-between">
            <span className={`text-xs ${text.length >= MAX_CHARS ? 'text-red-500' : 'text-muted-foreground'}`}>
              {text.length}/{MAX_CHARS}
            </span>
            <div className="flex items-center gap-2">
              {saved && !isSaving && (
                <span className="text-xs text-green-500">✓ Kaydedildi</span>
              )}
              {isSaving && (
                <span className="text-xs text-muted-foreground animate-pulse">Kaydediliyor…</span>
              )}
              <button
                onClick={() => doSave(text)}
                disabled={isSaving}
                className="text-xs bg-primary text-primary-foreground rounded px-2.5 py-1 hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
