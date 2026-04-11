// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { TRANSITION_OPTIONS } from '@/lib/animation/transitions/factory';
import type { TransitionType, TransitionSpeed } from '@/lib/animation/transitions/types';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

interface TransitionPanelProps {
  selectedType: TransitionType;
  selectedSpeed: TransitionSpeed;
  onTypeChange: (type: TransitionType) => void;
  onSpeedChange: (speed: TransitionSpeed) => void;
  onApplyAll: () => void;
  onClose: () => void;
}

const SPEED_OPTIONS: { id: TransitionSpeed; label: string }[] = [
  { id: 'slow', label: 'Yavaş' },
  { id: 'medium', label: 'Orta' },
  { id: 'fast', label: 'Hızlı' },
];

export function TransitionPanel({
  selectedType,
  selectedSpeed,
  onTypeChange,
  onSpeedChange,
  onApplyAll,
  onClose,
}: TransitionPanelProps) {
  return (
    <div className="glass-card border border-white/10 rounded-2xl shadow-2xl p-5 w-72 animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black text-white uppercase tracking-[0.15em]">Geçiş Efekti</h3>
        <button onClick={onClose} className="p-1 text-on-surface-variant hover:text-white rounded-lg hover:bg-white/5">
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* Efekt Listesi */}
      <div className="space-y-1 mb-4 max-h-[280px] overflow-y-auto">
        {TRANSITION_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onTypeChange(opt.value)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
              selectedType === opt.value
                ? 'bg-primary/10 border border-primary/30 text-white'
                : 'border border-transparent hover:bg-white/5 text-on-surface-variant hover:text-white'
            }`}
          >
            <MaterialIcon
              icon={selectedType === opt.value ? 'check_circle' : 'radio_button_unchecked'}
              size={18}
              className={selectedType === opt.value ? 'text-primary' : 'text-on-surface-variant/40'}
            />
            <div>
              <p className="text-xs font-bold">{opt.label}</p>
              <p className="text-[10px] text-on-surface-variant">{opt.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Hız Ayarı */}
      <div className="mb-4">
        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.15em] mb-2">Hız</p>
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
          {SPEED_OPTIONS.map(speed => (
            <button
              key={speed.id}
              onClick={() => onSpeedChange(speed.id)}
              className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${
                selectedSpeed === speed.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              {speed.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tüm slaytlara uygula */}
      <button
        onClick={onApplyAll}
        className="w-full py-2.5 rounded-xl border border-white/10 text-[10px] font-black text-on-surface-variant hover:text-white hover:bg-white/5 uppercase tracking-widest transition-all"
      >
        Tüm Slaytlara Uygula
      </button>
    </div>
  );
}
