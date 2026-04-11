// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ColorPicker } from '@/components/ui/ColorPicker';
import type { TextObject, FontWeight, TextAlign, ListType } from '@/types/slide-object';

const FONT_FAMILIES = [
  'Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Poppins',
  'Playfair Display', 'Merriweather', 'Oswald', 'Raleway', 'Nunito',
  'Source Sans 3', 'PT Sans', 'Noto Sans', 'Ubuntu', 'Work Sans',
  'Quicksand', 'Fira Sans', 'Rubik', 'Libre Baskerville',
];

const FONT_SIZES = [6, 8, 10, 12, 14, 18, 24, 30, 36, 48, 60, 72, 96];

interface TextFormatToolbarProps {
  textObject: TextObject;
  onUpdate: (updates: Partial<TextObject>) => void;
}

export function TextFormatToolbar({ textObject, onUpdate }: TextFormatToolbarProps) {
  return (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-surface/80 backdrop-blur-xl border-b border-white/5 flex-wrap">
      {/* Font Ailesi */}
      <select
        value={textObject.fontFamily}
        onChange={e => onUpdate({ fontFamily: e.target.value })}
        className="h-7 bg-white/5 border border-white/10 rounded-lg px-2 text-[11px] text-white outline-none focus:ring-1 ring-primary appearance-none cursor-pointer max-w-[130px]"
      >
        {FONT_FAMILIES.map(f => (
          <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
        ))}
      </select>

      {/* Font Boyutu */}
      <select
        value={textObject.fontSize}
        onChange={e => onUpdate({ fontSize: Number(e.target.value) })}
        className="h-7 w-14 bg-white/5 border border-white/10 rounded-lg px-1.5 text-[11px] text-white outline-none focus:ring-1 ring-primary appearance-none cursor-pointer text-center"
      >
        {FONT_SIZES.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <div className="h-5 w-px bg-white/10 mx-0.5" />

      {/* Kalın */}
      <ToggleButton
        icon="format_bold"
        active={textObject.fontWeight >= 700}
        onClick={() => onUpdate({ fontWeight: (textObject.fontWeight >= 700 ? 400 : 700) as FontWeight })}
        title="Kalın (⌘B)"
      />

      {/* İtalik */}
      <ToggleButton
        icon="format_italic"
        active={textObject.fontStyle === 'italic'}
        onClick={() => onUpdate({ fontStyle: textObject.fontStyle === 'italic' ? 'normal' : 'italic' })}
        title="İtalik (⌘I)"
      />

      {/* Altı Çizili */}
      <ToggleButton
        icon="format_underlined"
        active={textObject.textDecoration === 'underline'}
        onClick={() => onUpdate({ textDecoration: textObject.textDecoration === 'underline' ? 'none' : 'underline' })}
        title="Altı Çizili (⌘U)"
      />

      {/* Üstü Çizili */}
      <ToggleButton
        icon="strikethrough_s"
        active={textObject.textDecoration === 'line-through'}
        onClick={() => onUpdate({ textDecoration: textObject.textDecoration === 'line-through' ? 'none' : 'line-through' })}
        title="Üstü Çizili"
      />

      <div className="h-5 w-px bg-white/10 mx-0.5" />

      {/* Metin Rengi */}
      <ColorPicker value={textObject.color} onChange={color => onUpdate({ color })} />

      {/* Vurgu Rengi */}
      <ColorPicker value={textObject.highlightColor} onChange={color => onUpdate({ highlightColor: color })} showTransparent />

      <div className="h-5 w-px bg-white/10 mx-0.5" />

      {/* Hizalama */}
      <ToggleButton icon="format_align_left" active={textObject.textAlign === 'left'} onClick={() => onUpdate({ textAlign: 'left' as TextAlign })} title="Sola" />
      <ToggleButton icon="format_align_center" active={textObject.textAlign === 'center'} onClick={() => onUpdate({ textAlign: 'center' as TextAlign })} title="Ortala" />
      <ToggleButton icon="format_align_right" active={textObject.textAlign === 'right'} onClick={() => onUpdate({ textAlign: 'right' as TextAlign })} title="Sağa" />
      <ToggleButton icon="format_align_justify" active={textObject.textAlign === 'justify'} onClick={() => onUpdate({ textAlign: 'justify' as TextAlign })} title="İki Yana" />

      <div className="h-5 w-px bg-white/10 mx-0.5" />

      {/* Liste */}
      <ToggleButton
        icon="format_list_bulleted"
        active={textObject.listType === 'bullet'}
        onClick={() => onUpdate({ listType: (textObject.listType === 'bullet' ? 'none' : 'bullet') as ListType })}
        title="Madde İşareti"
      />
      <ToggleButton
        icon="format_list_numbered"
        active={textObject.listType === 'numbered'}
        onClick={() => onUpdate({ listType: (textObject.listType === 'numbered' ? 'none' : 'numbered') as ListType })}
        title="Numaralı Liste"
      />

      <div className="h-5 w-px bg-white/10 mx-0.5" />

      {/* Satır Aralığı */}
      <select
        value={textObject.lineHeight}
        onChange={e => onUpdate({ lineHeight: Number(e.target.value) })}
        className="h-7 w-12 bg-white/5 border border-white/10 rounded-lg px-1 text-[11px] text-white outline-none focus:ring-1 ring-primary appearance-none cursor-pointer text-center"
        title="Satır Aralığı"
      >
        <option value={1}>1.0</option>
        <option value={1.15}>1.15</option>
        <option value={1.5}>1.5</option>
        <option value={2}>2.0</option>
      </select>
    </div>
  );
}

function ToggleButton({ icon, active, onClick, title }: {
  icon: string;
  active: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1 rounded-md transition-all ${
        active
          ? 'bg-primary/20 text-primary'
          : 'text-on-surface-variant hover:text-white hover:bg-white/5'
      }`}
    >
      <MaterialIcon icon={icon} size={18} />
    </button>
  );
}
