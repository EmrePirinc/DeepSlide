'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/config';

interface DebugInfo {
  origin: string;
  href: string;
  authDomain: string | undefined;
  apiKey: string;
  projectId: string | undefined;
  currentUserAtBoot: string;
  cookiesEnabled: boolean;
  storageOk: boolean;
  hasIndexedDB: boolean;
  ua: string;
  pendingRedirectKey: string;
}

interface LogEntry {
  t: string;
  msg: string;
  level: 'info' | 'warn' | 'error';
}

export function AuthDebugPanel() {
  const [info, setInfo] = useState<DebugInfo | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Snapshot environment
    let storageOk = false;
    try {
      sessionStorage.setItem('__test__', '1');
      sessionStorage.removeItem('__test__');
      storageOk = true;
    } catch { /* blocked */ }

    // Firebase'in pending redirect için kullandığı sessionStorage key
    const pendingKey = Object.keys(sessionStorage).find((k) => k.includes('firebase:pendingRedirect')) ?? 'yok';

    setInfo({
      origin: window.location.origin,
      href: window.location.href,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      apiKey: (process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '').slice(0, 12) + '...',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      currentUserAtBoot: auth.currentUser?.uid ?? 'null',
      cookiesEnabled: navigator.cookieEnabled,
      storageOk,
      hasIndexedDB: typeof indexedDB !== 'undefined',
      ua: navigator.userAgent.slice(0, 80),
      pendingRedirectKey: pendingKey,
    });

    // Console.log/warn/error'ı yakala — ekrana yansıt
    const orig = { log: console.log, warn: console.warn, error: console.error };
    const capture = (level: LogEntry['level']) => (...args: unknown[]) => {
      const msg = args.map((a) => {
        if (typeof a === 'string') return a;
        try { return JSON.stringify(a); } catch { return String(a); }
      }).join(' ');
      if (msg.includes('[AUTH]') || msg.includes('[LOGIN]')) {
        setLogs((prev) => [...prev.slice(-30), {
          t: new Date().toLocaleTimeString('tr-TR', { hour12: false }),
          msg,
          level,
        }]);
      }
      orig[level === 'info' ? 'log' : level](...args);
    };
    console.log = capture('info');
    console.warn = capture('warn');
    console.error = capture('error');

    return () => {
      console.log = orig.log;
      console.warn = orig.warn;
      console.error = orig.error;
    };
  }, []);

  if (!info) return null;

  const colorFor = (level: LogEntry['level']) =>
    level === 'error' ? '#f87171' : level === 'warn' ? '#fbbf24' : '#a7f3d0';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 8,
        right: 8,
        zIndex: 9999,
        width: collapsed ? 'auto' : 480,
        maxHeight: '60vh',
        overflow: 'auto',
        background: 'rgba(0,0,0,0.92)',
        color: '#fff',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 11,
        border: '1px solid #4b5563',
        borderRadius: 8,
        padding: 10,
        lineHeight: 1.4,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <strong style={{ color: '#60a5fa' }}>🔍 AUTH DEBUG</strong>
        <button
          onClick={() => setCollapsed((v) => !v)}
          style={{ background: '#374151', border: 'none', color: '#fff', padding: '2px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 10 }}
        >
          {collapsed ? '▼ aç' : '▲ kapat'}
        </button>
      </div>
      {!collapsed && (
        <>
          <div style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #374151' }}>
            <Row k="origin" v={info.origin} />
            <Row k="authDomain" v={info.authDomain ?? '❌ EKSIK'} warn={!info.authDomain} />
            <Row k="apiKey" v={info.apiKey} />
            <Row k="projectId" v={info.projectId ?? '❌ EKSIK'} warn={!info.projectId} />
            <Row k="currentUser@boot" v={info.currentUserAtBoot} />
            <Row k="cookies" v={info.cookiesEnabled ? '✅' : '❌ KAPALI'} warn={!info.cookiesEnabled} />
            <Row k="sessionStorage" v={info.storageOk ? '✅' : '❌ ENGELLİ'} warn={!info.storageOk} />
            <Row k="indexedDB" v={info.hasIndexedDB ? '✅' : '❌ YOK'} warn={!info.hasIndexedDB} />
            <Row k="pendingRedirect" v={info.pendingRedirectKey} />
            <Row k="UA" v={info.ua} />
          </div>
          <div>
            <div style={{ color: '#9ca3af', marginBottom: 4 }}>📋 Son loglar (yalnız [AUTH]/[LOGIN]):</div>
            {logs.length === 0 ? (
              <div style={{ color: '#6b7280' }}>henüz log yok</div>
            ) : (
              logs.map((l, i) => (
                <div key={i} style={{ color: colorFor(l.level), wordBreak: 'break-word' }}>
                  <span style={{ color: '#6b7280' }}>{l.t}</span> {l.msg}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Row({ k, v, warn }: { k: string; v: string; warn?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <span style={{ color: '#9ca3af', minWidth: 130 }}>{k}:</span>
      <span style={{ color: warn ? '#f87171' : '#e5e7eb', wordBreak: 'break-all' }}>{v}</span>
    </div>
  );
}
