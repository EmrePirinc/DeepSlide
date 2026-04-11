// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Type } from 'lucide-react';
import type { TextOverlay } from '@/types/presentation';

interface TextOverlayEditorProps {
  overlays: TextOverlay[];
  onChange: (overlays: TextOverlay[]) => void;
  /** Image dimensions for the preview container */
  containerWidth?: number;
  containerHeight?: number;
}

const COLORS = ['#ffffff', '#000000', '#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa'];
const FONT_SIZES = [14, 18, 24, 32, 48];

function newOverlay(): TextOverlay {
  return {
    id: crypto.randomUUID(),
    text: 'Metin',
    x: 10,
    y: 10,
    fontSize: 24,
    color: '#ffffff',
    bold: false,
  };
}

export function TextOverlayEditor({ overlays, onChange }: TextOverlayEditorProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const addOverlay = () => {
    const next = [...overlays, newOverlay()];
    onChange(next);
    setSelected(next[next.length - 1].id);
  };

  const removeOverlay = (id: string) => {
    onChange(overlays.filter((o) => o.id !== id));
    if (selected === id) setSelected(null);
  };

  const updateOverlay = useCallback(
    (id: string, patch: Partial<TextOverlay>) => {
      onChange(overlays.map((o) => (o.id === id ? { ...o, ...patch } : o)));
    },
    [overlays, onChange],
  );

  // Drag overlay within the container (percent coords)
  const handleDragEnd = useCallback(
    (id: string, e: React.DragEvent<HTMLSpanElement>) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = Math.max(0, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
      updateOverlay(id, { x, y });
    },
    [updateOverlay],
  );

  const selectedOverlay = overlays.find((o) => o.id === selected);

  return (
    <div className="space-y-3">
      {/* Overlay canvas preview */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden border border-dashed border-muted-foreground/40"
      >
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 text-xs select-none pointer-events-none">
          Görsel önizleme
        </div>

        {overlays.map((o) => (
          <motion.span
            key={o.id}
            layout
            draggable
            onDragEnd={(e) => handleDragEnd(o.id, e as unknown as React.DragEvent<HTMLSpanElement>)}
            onClick={() => setSelected(o.id)}
            className={`absolute cursor-move select-none px-1 rounded transition-shadow ${
              selected === o.id ? 'ring-2 ring-primary shadow-lg' : 'hover:ring-1 ring-white/50'
            }`}
            style={{
              left: `${o.x}%`,
              top: `${o.y}%`,
              fontSize: `${Math.max(10, o.fontSize * 0.5)}px`,
              color: o.color,
              fontWeight: o.bold ? 700 : 400,
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            }}
          >
            {o.text}
          </motion.span>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={addOverlay}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
        >
          <Plus size={12} /> Metin Ekle
        </button>
        <span className="text-xs text-muted-foreground">{overlays.length} metin katmanı</span>
      </div>

      {/* Selected overlay editor */}
      {selectedOverlay && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-muted/30 p-3 space-y-3"
        >
          <div className="flex items-center gap-2">
            <Type size={13} className="text-muted-foreground shrink-0" />
            <input
              className="flex-1 rounded-lg border bg-background px-2 py-1 text-sm outline-none focus:ring-2 ring-primary/50"
              value={selectedOverlay.text}
              onChange={(e) => updateOverlay(selectedOverlay.id, { text: e.target.value })}
              placeholder="Metin"
            />
            <button
              onClick={() => removeOverlay(selectedOverlay.id)}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              <Trash2 size={13} />
            </button>
          </div>

          {/* Font size */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-16 shrink-0">Boyut</span>
            <div className="flex gap-1">
              {FONT_SIZES.map((fs) => (
                <button
                  key={fs}
                  onClick={() => updateOverlay(selectedOverlay.id, { fontSize: fs })}
                  className={`rounded px-2 py-0.5 text-xs border transition-colors ${
                    selectedOverlay.fontSize === fs
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:bg-muted border-border'
                  }`}
                >
                  {fs}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-16 shrink-0">Renk</span>
            <div className="flex gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => updateOverlay(selectedOverlay.id, { color: c })}
                  className={`w-5 h-5 rounded-full border-2 transition-transform ${
                    selectedOverlay.color === c ? 'scale-125 border-primary' : 'border-transparent hover:scale-110'
                  }`}
                  style={{ backgroundColor: c, boxShadow: c === '#ffffff' ? 'inset 0 0 0 1px #e5e7eb' : undefined }}
                />
              ))}
            </div>
          </div>

          {/* Bold */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-16 shrink-0">Kalın</span>
            <button
              onClick={() => updateOverlay(selectedOverlay.id, { bold: !selectedOverlay.bold })}
              className={`rounded px-3 py-0.5 text-xs font-bold border transition-colors ${
                selectedOverlay.bold
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'hover:bg-muted border-border'
              }`}
            >
              B
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
