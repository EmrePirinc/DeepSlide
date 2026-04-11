'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ErrorBoundary } from './ErrorBoundary';

interface AppShellProps {
  children: React.ReactNode;
  hideFooter?: boolean;
  hideSidebar?: boolean;
}

export function AppShell({ children, hideFooter = true, hideSidebar }: AppShellProps) {
  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {!hideSidebar && <Sidebar />}
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </div>
    </div>
  );
}

function BottomBar() {
  return (
    <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-10 py-5 glass-panel border-t border-white/10 shadow-2xl shadow-black/80">
      {/* Left — Notes + Navigation */}
      <div className="flex items-center gap-10">
        <button className="flex items-center gap-3 text-on-surface-variant hover:text-white transition-all text-[11px] font-black uppercase tracking-[0.15em] group">
          <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">sticky_note_2</span>
          NOTLAR
        </button>
        <div className="h-6 w-px bg-white/10" />
        <div className="flex items-center gap-6">
          <button className="material-symbols-outlined text-on-surface-variant hover:text-white hover:scale-125 transition-all">
            keyboard_arrow_left
          </button>
          <div className="flex items-center gap-3 px-5 py-2 bg-white/5 rounded-full text-[11px] font-black tracking-[0.2em] text-white border border-white/10 shadow-inner">
            3 <span className="text-white/30">/</span> 12
          </div>
          <button className="material-symbols-outlined text-on-surface-variant hover:text-white hover:scale-125 transition-all">
            keyboard_arrow_right
          </button>
        </div>
      </div>

      {/* Center — Zoom + Column Selector (absolutely centered) */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8 px-8 py-2.5 bg-black/40 rounded-2xl border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-on-surface-variant hover:text-white text-lg">
            remove
          </button>
          <div className="w-12 text-center text-[12px] font-black text-white">60%</div>
          <button className="material-symbols-outlined text-on-surface-variant hover:text-white text-lg">
            add
          </button>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 bg-white/10 rounded-lg text-[11px] font-black text-white">3</button>
          <button className="px-3 py-1 hover:bg-white/5 rounded-lg text-[11px] font-black text-on-surface-variant">4</button>
          <button className="px-3 py-1 hover:bg-white/5 rounded-lg text-[11px] font-black text-on-surface-variant">5</button>
        </div>
      </div>

      {/* Right — Navigation + Zoom */}
      <div className="flex items-center gap-6">
        <button className="text-white bg-primary hover:bg-primary-container rounded-xl px-6 py-2.5 flex items-center gap-3 text-[11px] font-black tracking-widest shadow-xl shadow-primary/30 transition-all active:scale-95 uppercase">
          <span className="material-symbols-outlined text-[20px]">apps</span>
          GEZİNTİ
        </button>
        <button className="text-on-surface-variant hover:text-white transition-all hover:scale-110">
          <span className="material-symbols-outlined text-[22px]">zoom_in_map</span>
        </button>
      </div>
    </footer>
  );
}
