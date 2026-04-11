'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { useState } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { useUIStore } from '@/stores/uiStore';

type TabId = 'settings' | 'ai' | 'theme';

export function EditorRightPanel() {
  const [activeTab, setActiveTab] = useState<TabId>('settings');
  const { columnCount, setColumnCount, selectedImageProvider, setSelectedImageProvider } = useUIStore();

  const tabs: { id: TabId; icon: string; label: string }[] = [
    { id: 'settings', icon: 'settings', label: 'AYARLAR' },
    { id: 'ai', icon: 'auto_awesome', label: 'YAPAY ZEKA' },
    { id: 'theme', icon: 'palette', label: 'TEMA' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex p-2 bg-white/5 m-4 rounded-2xl gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300
              ${activeTab === tab.id
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-on-surface-variant hover:text-white'}`}
          >
            <MaterialIcon icon={tab.icon} size={18} />
            <span className="hidden xl:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
        {activeTab === 'settings' && <SettingsTab columnCount={columnCount} setColumnCount={setColumnCount} />}
        {activeTab === 'ai' && <AITab provider={selectedImageProvider} setProvider={setSelectedImageProvider} />}
        {activeTab === 'theme' && <ThemeTab />}
      </div>

      {/* Help Button */}
      <div className="p-4 border-t border-white/5">
        <button className="w-full flex items-center justify-center gap-2 text-on-surface-variant hover:text-white text-sm py-2.5 rounded-xl hover:bg-white/5 transition-colors">
          <MaterialIcon icon="help" size={18} />
          <span className="font-medium">Yardım Merkezi</span>
        </button>
      </div>
    </div>
  );
}

function SettingsTab({ columnCount, setColumnCount }: { columnCount: number; setColumnCount: (n: 3 | 4 | 5) => void }) {
  return (
    <>
      {/* Layout Control */}
      <section>
        <h3 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">
          DÜZEN
        </h3>
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
          {([3, 4, 5] as const).map((n) => (
            <button
              key={n}
              onClick={() => setColumnCount(n)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300
                ${columnCount === n
                  ? 'bg-white/10 text-white'
                  : 'text-on-surface-variant hover:text-white'}`}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      {/* Privacy Mode */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Gizlilik Modu</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Analiz verilerini gizle</p>
          </div>
          <div className="w-10 h-6 bg-primary rounded-full relative shadow-lg shadow-primary/20 cursor-pointer">
            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
          </div>
        </div>
      </section>

      {/* Analysis Progress */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
            Slayt Analizi
          </h3>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold text-primary">%75</span>
          </div>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-3/4 rounded-full shadow-[0_0_15px_#6366F1] transition-all duration-700" />
        </div>
      </section>
    </>
  );
}

function AITab({ provider, setProvider }: { provider: string; setProvider: (p: 'gemini' | 'ollama') => void }) {
  const options = [
    { id: 'gemini' as const, icon: 'bolt', name: 'Gemini Ultra', desc: 'Bulut tabanlı yüksek doğruluk' },
    { id: 'ollama' as const, icon: 'computer', name: 'Yerel AI (Ollama)', desc: 'Gizli, İnternet gerekmez' },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
          ANALİZ MOTORU
        </h3>
        <MaterialIcon icon="more_horiz" size={18} className="text-on-surface-variant" />
      </div>
      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setProvider(opt.id)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300
              ${provider === opt.id
                ? 'bg-white/10 border border-white/10'
                : 'bg-white/[0.02] hover:bg-white/5 border border-transparent'}`}
          >
            <div className={`p-2 rounded-lg ${provider === opt.id ? 'bg-primary/20' : 'bg-white/5'}`}>
              <MaterialIcon icon={opt.icon} size={20} className={provider === opt.id ? 'text-primary' : 'text-on-surface-variant'} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-white">{opt.name}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{opt.desc}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
              ${provider === opt.id ? 'border-primary' : 'border-white/20'}`}>
              {provider === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function ThemeTab() {
  return (
    <section>
      <h3 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">
        SUNUM TEMASI
      </h3>
      <div className="space-y-2">
        {[
          { id: 'dark', label: 'Koyu', color: '#070D1F' },
          { id: 'light', label: 'Açık', color: '#fafafa' },
          { id: 'corporate', label: 'Kurumsal', color: '#0C1324' },
        ].map((theme) => (
          <button
            key={theme.id}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
          >
            <div
              className="w-8 h-8 rounded-lg border border-white/10"
              style={{ backgroundColor: theme.color }}
            />
            <span className="text-sm font-medium text-white">{theme.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
