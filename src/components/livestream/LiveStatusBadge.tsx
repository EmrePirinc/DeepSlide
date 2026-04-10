// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { cn } from '@/lib/utils';
import type { LiveStreamStatus } from '@/lib/livestream/liveStreamService';

interface LiveStatusBadgeProps {
  status: LiveStreamStatus;
  className?: string;
}

export function LiveStatusBadge({ status, className }: LiveStatusBadgeProps) {
  if (status === 'idle') return null;

  return (
    <div className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', className,
      status === 'live' && 'bg-red-500/20 text-red-300',
      status === 'connecting' && 'bg-yellow-500/20 text-yellow-300',
      status === 'error' && 'bg-red-900/30 text-red-400',
    )}>
      {status === 'live' && (
        <>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
          CANLI
        </>
      )}
      {status === 'connecting' && (
        <>
          <span className="h-1.5 w-1.5 animate-spin rounded-full border border-yellow-400 border-t-transparent" />
          Bağlanıyor…
        </>
      )}
      {status === 'error' && (
        <>
          <span>✗</span>
          Bağlantı Hatası
        </>
      )}
    </div>
  );
}
