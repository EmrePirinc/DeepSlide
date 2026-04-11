// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState, useEffect } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { useCanvasStore } from '@/stores/canvasStore';

type SidebarMode = 'sort' | 'notes' | 'outline';

interface EditorSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MODES: { id: SidebarMode; icon: string; label: string }[] = [
  { id: 'sort', icon: 'view_carousel', label: 'Sıralama' },
  { id: 'notes', icon: 'sticky_note_2', label: 'Notlar' },
  { id: 'outline', icon: 'format_list_bulleted', label: 'Outline' },
];

export function EditorSidebar({ isOpen, onToggle }: EditorSidebarProps) {
  const [mode, setMode] = useState<SidebarMode>('sort');
  const slides = useCanvasStore(s => s.slides);
  const activeSlideId = useCanvasStore(s => s.activeSlideId);
  const setActiveSlide = useCanvasStore(s => s.setActiveSlide);
  const reorderSlides = useCanvasStore(s => s.reorderSlides);

  // S kısayolu
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 's' && !e.metaKey && !e.ctrlKey && !(e.target as HTMLElement).isContentEditable) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault();
          onToggle();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onToggle]);

  if (!isOpen) return null;

  return (
    <aside
      className="w-64 bg-surface/20 border-r border-white/5 flex flex-col overflow-hidden shrink-0 z-20 animate-in slide-in-from-left duration-300"
    >
      {/* Mode Tabs */}
      <div className="flex gap-1 p-2 border-b border-white/5">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all ${
              mode === m.id ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-white hover:bg-white/5'
            }`}
          >
            <MaterialIcon icon={m.icon} size={14} />
            {m.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {mode === 'sort' && (
          <SortMode
            slides={slides}
            activeSlideId={activeSlideId}
            onSelect={setActiveSlide}
            onReorder={reorderSlides}
          />
        )}
        {mode === 'notes' && (
          <NotesMode slides={slides} activeSlideId={activeSlideId} onSelect={setActiveSlide} />
        )}
        {mode === 'outline' && (
          <OutlineMode slides={slides} activeSlideId={activeSlideId} onSelect={setActiveSlide} />
        )}
      </div>

      {/* Kapat butonu */}
      <div className="p-2 border-t border-white/5">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-on-surface-variant hover:text-white rounded-lg hover:bg-white/5 transition-all"
        >
          <MaterialIcon icon="chevron_left" size={16} />
          Kapat (S)
        </button>
      </div>
    </aside>
  );
}

// ─── Sıralama Modu ─────────────────────────────────────

function SortMode({ slides, activeSlideId, onSelect, onReorder }: {
  slides: ReturnType<typeof useCanvasStore.getState>['slides'];
  activeSlideId: string | null;
  onSelect: (id: string) => void;
  onReorder: (ids: string[]) => void;
}) {
  return (
    <div className="space-y-3">
      {slides.map((slide, index) => (
        <button
          key={slide.id}
          onClick={() => onSelect(slide.id)}
          className={`w-full rounded-xl overflow-hidden transition-all ${
            slide.id === activeSlideId ? 'slide-thumb-active ring-2 ring-primary/30' : 'hover:ring-1 ring-white/20'
          } ${slide.hidden ? 'opacity-40' : ''}`}
        >
          <div className="aspect-video relative" style={{ backgroundColor: slide.background.color }}>
            <span className={`absolute bottom-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-md ${
              slide.id === activeSlideId ? 'bg-primary text-white' : 'bg-black/60 text-white/70'
            }`}>
              {slide.hidden ? <s>{index + 1}</s> : index + 1}
            </span>
            {slide.objects.length > 0 && (
              <span className="absolute bottom-2 right-2 text-[9px] text-white/40">
                {slide.objects.length} nesne
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Notlar Modu ───────────────────────────────────────

function NotesMode({ slides, activeSlideId, onSelect }: {
  slides: ReturnType<typeof useCanvasStore.getState>['slides'];
  activeSlideId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          onClick={() => onSelect(slide.id)}
          className={`rounded-xl p-3 border transition-all cursor-pointer ${
            slide.id === activeSlideId ? 'border-primary/30 bg-primary/5' : 'border-white/5 hover:border-white/10'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black text-on-surface-variant">{index + 1}</span>
            <span className="text-xs font-bold text-white truncate">Slayt {index + 1}</span>
          </div>
          <textarea
            placeholder="Konuşmacı notları..."
            className="w-full h-16 bg-transparent text-xs text-on-surface-variant resize-none outline-none placeholder:text-on-surface-variant/30"
            onClick={e => e.stopPropagation()}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Outline Modu ──────────────────────────────────────

function OutlineMode({ slides, activeSlideId, onSelect }: {
  slides: ReturnType<typeof useCanvasStore.getState>['slides'];
  activeSlideId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-1">
      {slides.map((slide, index) => {
        const titleObj = slide.objects.find(o => o.type === 'text');
        const title = titleObj?.type === 'text' && titleObj.content ? titleObj.content : `Slayt ${index + 1}`;

        return (
          <button
            key={slide.id}
            onClick={() => onSelect(slide.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
              slide.id === activeSlideId
                ? 'bg-primary/10 text-white'
                : 'text-on-surface-variant hover:text-white hover:bg-white/5'
            } ${slide.hidden ? 'opacity-40 line-through' : ''}`}
          >
            <span className="text-[10px] font-black w-5 text-center shrink-0">{index + 1}</span>
            <span className="text-xs font-medium truncate">{title}</span>
          </button>
        );
      })}
    </div>
  );
}
