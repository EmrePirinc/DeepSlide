'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePresentationStore } from '@/stores/presentationStore';

export function Sidebar() {
  const { presentations, loadPresentations, isLoading } =
    usePresentationStore();

  useEffect(() => {
    loadPresentations();
  }, [loadPresentations]);

  return (
    <aside className="w-64 border-r bg-muted/30 p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold text-muted-foreground mb-3">
        Sunumlarım
      </h2>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />
          ))}
        </div>
      ) : presentations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Henüz sunum yok. &quot;Yeni Sunum&quot; ile başlayın.
        </p>
      ) : (
        <ul className="space-y-1">
          {presentations.map((p) => (
            <li key={p.id}>
              <Link
                href={`/presentation/${p.id}`}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
              >
                <span className="truncate">{p.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {p.images.length}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
