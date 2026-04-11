// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ColorPicker } from '@/components/ui/ColorPicker';
import type { LineObject, LineType, ArrowType } from '@/types/slide-object';

interface LineStylePanelProps {
  lineObject: LineObject;
  onUpdate: (updates: Partial<LineObject>) => void;
}

const LINE_TYPES: { id: LineType; label: string; icon: string }[] = [
  { id: 'straight', label: 'Düz Çizgi', icon: 'horizontal_rule' },
  { id: 'arrow', label: 'Ok', icon: 'arrow_forward' },
  { id: 'doubleArrow', label: 'Çift Ok', icon: 'swap_horiz' },
  { id: 'elbow', label: 'Dirsek', icon: 'turn_right' },
];

const ARROW_TYPES: { id: ArrowType; label: string }[] = [
  { id: 'none', label: 'Yok' },
  { id: 'triangle', label: 'Üçgen' },
  { id: 'circle', label: 'Daire' },
  { id: 'square', label: 'Kare' },
  { id: 'diamond', label: 'Elmas' },
];

const WIDTHS = [1, 2, 3, 4, 8, 12];

export function LineStylePanel({ lineObject, onUpdate }: LineStylePanelProps) {
  return (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-surface/80 backdrop-blur-xl border-b border-white/5 flex-wrap">
      {/* Çizgi Türü */}
      {LINE_TYPES.map(lt => (
        <button
          key={lt.id}
          onClick={() => {
            const updates: Partial<LineObject> = { lineType: lt.id };
            if (lt.id === 'arrow') { updates.endArrow = 'triangle'; updates.startArrow = 'none'; }
            if (lt.id === 'doubleArrow') { updates.endArrow = 'triangle'; updates.startArrow = 'triangle'; }
            if (lt.id === 'straight') { updates.endArrow = 'none'; updates.startArrow = 'none'; }
            onUpdate(updates);
          }}
          className={`p-1.5 rounded-md transition-all ${
            lineObject.lineType === lt.id ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:text-white hover:bg-white/5'
          }`}
          title={lt.label}
        >
          <MaterialIcon icon={lt.icon} size={18} />
        </button>
      ))}

      <div className="h-5 w-px bg-white/10 mx-0.5" />

      {/* Renk */}
      <ColorPicker
        value={lineObject.stroke.color}
        onChange={color => onUpdate({ stroke: { ...lineObject.stroke, color } })}
      />

      {/* Kalınlık */}
      <select
        value={lineObject.stroke.width}
        onChange={e => onUpdate({ stroke: { ...lineObject.stroke, width: Number(e.target.value) } })}
        className="h-7 w-12 bg-white/5 border border-white/10 rounded-lg px-1 text-[11px] text-white outline-none cursor-pointer text-center"
        title="Kalınlık"
      >
        {WIDTHS.map(w => (
          <option key={w} value={w}>{w}px</option>
        ))}
      </select>

      {/* Stil */}
      <select
        value={lineObject.stroke.style}
        onChange={e => onUpdate({ stroke: { ...lineObject.stroke, style: e.target.value as 'solid' | 'dashed' | 'dotted' } })}
        className="h-7 bg-white/5 border border-white/10 rounded-lg px-1.5 text-[11px] text-white outline-none cursor-pointer"
        title="Stil"
      >
        <option value="solid">Düz</option>
        <option value="dashed">Kesikli</option>
        <option value="dotted">Noktalı</option>
      </select>

      <div className="h-5 w-px bg-white/10 mx-0.5" />

      {/* Ok Başı — Bitiş */}
      <select
        value={lineObject.endArrow}
        onChange={e => onUpdate({ endArrow: e.target.value as ArrowType })}
        className="h-7 bg-white/5 border border-white/10 rounded-lg px-1.5 text-[11px] text-white outline-none cursor-pointer"
        title="Bitiş Ok Başı"
      >
        {ARROW_TYPES.map(a => (
          <option key={a.id} value={a.id}>{a.label}</option>
        ))}
      </select>
    </div>
  );
}
