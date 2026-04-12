'use client';

import { useState } from 'react';
import { ChevronDown, Cpu, Wifi, AlertCircle, ChevronUp } from 'lucide-react';
import { useLocalAI } from '@/hooks/useLocalAI';
import { LocalAIBanner } from './LocalAIBanner';
import { LocalAIModelManager } from './LocalAIModelManager';

interface LocalAISelectorProps {
  // Cloud AI fallback varsa göster
  showCloudFallback?: boolean;
  className?: string;
}

export function LocalAISelector({ showCloudFallback = true, className = '' }: LocalAISelectorProps) {
  const { available, checking, models, activeModel, setActiveModel, refreshModels } = useLocalAI();
  const [open, setOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showManager, setShowManager] = useState(false);

  // Yükleniyor
  if (checking) {
    return (
      <div className={`flex items-center gap-2 text-xs text-slate-500 ${className}`}>
        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-600 border-t-indigo-400" />
        <span>Local AI kontrol ediliyor...</span>
      </div>
    );
  }

  // Companion app kurulu değil
  if (!available) {
    return (
      <div className={`space-y-2 ${className}`}>
        {!bannerDismissed && (
          <LocalAIBanner onDismiss={() => setBannerDismissed(true)} />
        )}
        {showCloudFallback && bannerDismissed && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Wifi className="h-3.5 w-3.5" />
            <span>Cloud AI (Gemini) kullanılıyor</span>
          </div>
        )}
      </div>
    );
  }

  // Model kurulmamış
  if (models.length === 0) {
    return (
      <div className={`space-y-3 ${className}`}>
        <button
          onClick={() => setShowManager((v) => !v)}
          className="flex w-full items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-left transition-colors hover:bg-amber-500/15"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-400" />
          <p className="flex-1 text-xs text-amber-700 dark:text-amber-300">
            Henüz model kurulmamış.{' '}
            <span className="font-semibold underline">
              {showManager ? 'Gizle' : 'Model kur →'}
            </span>
          </p>
          {showManager
            ? <ChevronUp className="h-3.5 w-3.5 text-amber-400" />
            : <ChevronDown className="h-3.5 w-3.5 text-amber-400" />
          }
        </button>

        {showManager && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
            <LocalAIModelManager onModelInstalled={refreshModels} />
          </div>
        )}
      </div>
    );
  }

  const activeModelObj = models.find((m) => m.name === activeModel);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-left text-sm transition-colors hover:border-slate-600"
      >
        <Cpu className="h-4 w-4 flex-shrink-0 text-indigo-400" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-slate-200 truncate">
              {activeModelObj?.name ?? activeModel ?? 'Model seç'}
            </span>
            <span className="rounded bg-green-500/15 px-1.5 py-0.5 text-[10px] font-bold text-green-400">
              Local
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {activeModelObj
              ? `${(activeModelObj.size / 1024 / 1024 / 1024).toFixed(1)} GB · Bilgisayarında çalışıyor`
              : 'Yerel AI aktif'}
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-xl">
          <div className="p-1">
            {models.map((model) => (
              <button
                key={model.name}
                onClick={() => {
                  setActiveModel(model.name);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-slate-700 ${
                  model.name === activeModel ? 'bg-indigo-600/20' : ''
                }`}
              >
                <Cpu className="h-4 w-4 flex-shrink-0 text-indigo-400" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-200 truncate">{model.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {(model.size / 1024 / 1024 / 1024).toFixed(1)} GB
                  </div>
                </div>
                {model.name === activeModel && (
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400" />
                )}
              </button>
            ))}

            {showCloudFallback && (
              <>
                <div className="my-1 border-t border-slate-700" />
                <button
                  onClick={() => {
                    setActiveModel('cloud');
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-slate-700"
                >
                  <Wifi className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-300">Cloud AI (Gemini)</div>
                    <div className="text-[11px] text-slate-500">İnternet bağlantısı gerekli</div>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
