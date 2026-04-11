// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { ColorPicker } from '@/components/ui/ColorPicker';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import type { ShapeObject, FillStyle, StrokeStyle, ShadowStyle } from '@/types/slide-object';

interface ShapeStylePanelProps {
  shapeObject: ShapeObject;
  onUpdate: (updates: Partial<ShapeObject>) => void;
}

const STROKE_WIDTHS = [0, 1, 2, 3, 4, 8, 12];

export function ShapeStylePanel({ shapeObject, onUpdate }: ShapeStylePanelProps) {
  const fill = shapeObject.fill;
  const stroke = shapeObject.stroke;
  const shadow = shapeObject.shadow;

  const updateFill = (updates: Partial<FillStyle>) => onUpdate({ fill: { ...fill, ...updates } });
  const updateStroke = (updates: Partial<StrokeStyle>) => onUpdate({ stroke: { ...stroke, ...updates } });
  const updateShadow = (updates: Partial<ShadowStyle>) => onUpdate({ shadow: { ...shadow, ...updates } });

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-surface/80 backdrop-blur-xl border-b border-white/5 flex-wrap">
      {/* Dolgu Türü */}
      <div className="flex gap-0.5 bg-white/5 rounded-lg p-0.5">
        <button
          onClick={() => updateFill({ type: 'solid' })}
          className={`p-1 rounded-md text-[10px] font-bold ${fill.type === 'solid' ? 'bg-primary text-white' : 'text-on-surface-variant'}`}
          title="Düz Renk"
        >
          <MaterialIcon icon="format_color_fill" size={16} />
        </button>
        <button
          onClick={() => updateFill({ type: 'gradient', gradientStart: fill.color, gradientEnd: '#000000' })}
          className={`p-1 rounded-md text-[10px] font-bold ${fill.type === 'gradient' ? 'bg-primary text-white' : 'text-on-surface-variant'}`}
          title="Gradient"
        >
          <MaterialIcon icon="gradient" size={16} />
        </button>
        <button
          onClick={() => updateFill({ type: 'none' })}
          className={`p-1 rounded-md text-[10px] font-bold ${fill.type === 'none' ? 'bg-primary text-white' : 'text-on-surface-variant'}`}
          title="Dolgu Yok"
        >
          <MaterialIcon icon="format_color_reset" size={16} />
        </button>
      </div>

      {/* Dolgu Rengi */}
      {fill.type === 'solid' && (
        <ColorPicker value={fill.color} onChange={color => updateFill({ color })} />
      )}
      {fill.type === 'gradient' && (
        <>
          <ColorPicker value={fill.gradientStart ?? '#6366F1'} onChange={c => updateFill({ gradientStart: c })} />
          <span className="text-on-surface-variant text-[10px]">→</span>
          <ColorPicker value={fill.gradientEnd ?? '#000000'} onChange={c => updateFill({ gradientEnd: c })} />
        </>
      )}

      <div className="h-5 w-px bg-white/10 mx-0.5" />

      {/* Kenarlık Rengi */}
      <ColorPicker value={stroke.color} onChange={color => updateStroke({ color })} />

      {/* Kenarlık Kalınlığı */}
      <select
        value={stroke.width}
        onChange={e => updateStroke({ width: Number(e.target.value) })}
        className="h-7 w-12 bg-white/5 border border-white/10 rounded-lg px-1 text-[11px] text-white outline-none cursor-pointer text-center"
        title="Kenarlık"
      >
        {STROKE_WIDTHS.map(w => (
          <option key={w} value={w}>{w === 0 ? 'Yok' : `${w}px`}</option>
        ))}
      </select>

      {/* Kenarlık Stili */}
      <select
        value={stroke.style}
        onChange={e => updateStroke({ style: e.target.value as StrokeStyle['style'] })}
        className="h-7 bg-white/5 border border-white/10 rounded-lg px-1.5 text-[11px] text-white outline-none cursor-pointer"
      >
        <option value="solid">Düz</option>
        <option value="dashed">Kesikli</option>
        <option value="dotted">Noktalı</option>
      </select>

      <div className="h-5 w-px bg-white/10 mx-0.5" />

      {/* Gölge Toggle */}
      <button
        onClick={() => updateShadow({ enabled: !shadow.enabled })}
        className={`p-1 rounded-md transition-all ${shadow.enabled ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:text-white hover:bg-white/5'}`}
        title="Gölge"
      >
        <MaterialIcon icon="shadow" size={18} />
      </button>
    </div>
  );
}
