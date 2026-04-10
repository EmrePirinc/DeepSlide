// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useQuizRealtime } from '@/hooks/useQuizRealtime';
import { cn } from '@/lib/utils';

interface LiveLeaderboardProps {
  sessionId: string;
  className?: string;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export function LiveLeaderboard({ sessionId, className }: LiveLeaderboardProps) {
  const { leaderboard, isLoading, error } = useQuizRealtime(sessionId);

  if (isLoading) {
    return <div className={cn('text-sm text-white/40 animate-pulse', className)}>Yükleniyor…</div>;
  }

  if (error) {
    return <div className={cn('text-sm text-red-400', className)}>Hata: {error}</div>;
  }

  if (leaderboard.length === 0) {
    return <div className={cn('text-sm text-white/40', className)}>Henüz katılımcı yok</div>;
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide">Puan Tablosu</h3>
      <ul className="flex flex-col gap-1.5">
        {leaderboard.slice(0, 10).map((entry) => (
          <li
            key={entry.userId}
            className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-2.5 transition-all duration-300"
          >
            <span className="w-6 text-center text-lg">
              {MEDALS[entry.rank - 1] ?? <span className="text-sm text-white/40">#{entry.rank}</span>}
            </span>
            <span className="flex-1 truncate text-sm text-white">{entry.displayName}</span>
            <span className="font-mono text-sm font-bold text-green-400">{entry.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
