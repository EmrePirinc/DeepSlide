// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface RecordingDoc {
  recordingId: string;
  shareKey: string;
  createdAt: string;
  expiresAt: string;
  mimeType: string;
  extension: string;
  chunkCount: number;
}

type FilterKey = 'all' | 'expiring';

export default function ArchivePage() {
  const [recordings, setRecordings] = useState<RecordingDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const db = getFirestore();
    const q = query(
      collection(db, 'recordings'),
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    getDocs(q)
      .then((snap) => {
        setRecordings(snap.docs.map((d) => d.data() as RecordingDoc));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const now = new Date().getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  const filtered = recordings.filter((r) => {
    const expiry = new Date(r.expiresAt).getTime();
    if (filter === 'expiring' && expiry - now > sevenDays) return false;
    if (search && !r.recordingId.includes(search)) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-zinc-950 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold text-white">Sunum Arşivi</h1>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kayıt ara…"
            className="rounded-xl bg-white/5 px-4 py-2 text-sm text-white placeholder-white/30 outline-none ring-1 ring-white/10 focus:ring-blue-400/50"
          />
          <div className="flex gap-2">
            {(['all', 'expiring'] as FilterKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition',
                  filter === key ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/60 hover:text-white'
                )}
              >
                {key === 'all' ? 'Tümü' : 'Yakında Sona Erecek'}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="rounded-2xl bg-white/5 p-12 text-center">
            <p className="text-white/40">Henüz kayıt yok</p>
          </div>
        )}

        <ul className="flex flex-col gap-3">
          {filtered.map((recording) => {
            const expiry = new Date(recording.expiresAt);
            const isExpiringSoon = expiry.getTime() - now < sevenDays;
            const isExpired = expiry.getTime() < now;

            return (
              <li key={recording.recordingId} className="rounded-2xl bg-white/5 p-5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="truncate font-mono text-sm text-white">{recording.recordingId}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {new Date(recording.createdAt).toLocaleDateString('tr-TR')} · {recording.extension.toUpperCase()} · {recording.chunkCount} parça
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {isExpired ? (
                    <span className="text-xs text-red-400">Süresi Doldu</span>
                  ) : isExpiringSoon ? (
                    <span className="text-xs text-yellow-400">⚠ {expiry.toLocaleDateString('tr-TR')}&apos;de sona eriyor</span>
                  ) : (
                    <span className="text-xs text-white/30">{expiry.toLocaleDateString('tr-TR')}</span>
                  )}
                  {!isExpired && (
                    <Link
                      href={`/r/${recording.shareKey}`}
                      className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition"
                    >
                      Görüntüle
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
