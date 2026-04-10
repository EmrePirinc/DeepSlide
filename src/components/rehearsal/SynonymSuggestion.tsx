'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface SynonymSuggestionProps {
  /** Hiç tetiklenmemiş keyword metinleri. */
  unmatchedKeywords: string[];
  /** Kullanıcı synonym eklediğinde çağrılır. */
  onAdd: (keyword: string, synonym: string) => void;
}

/**
 * SynonymSuggestion
 *
 * Prova sonucunda tetiklenemeyen keyword'ler için synonym girişi sağlar.
 * Kullanıcı kendi sesine daha yakın bir kelime yazarak eşleşmeyi genişletir.
 */
export function SynonymSuggestion({
  unmatchedKeywords,
  onAdd,
}: SynonymSuggestionProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [added, setAdded] = useState<Record<string, string[]>>({});

  if (unmatchedKeywords.length === 0) return null;

  const handleAdd = () => {
    const synonym = input.trim();
    if (!synonym || !selected) return;

    onAdd(selected, synonym);
    setAdded((prev) => ({
      ...prev,
      [selected]: [...(prev[selected] ?? []), synonym],
    }));
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">
        Tetiklenemeyen keyword&apos;ler için synonym ekle:
      </p>

      {/* Keyword seçimi */}
      <div className="flex flex-wrap gap-1.5">
        {unmatchedKeywords.map((kw) => (
          <button
            key={kw}
            onClick={() => { setSelected(kw); setInput(''); }}
            className={`
              text-xs rounded px-2.5 py-1 border transition-colors
              ${selected === kw
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted text-muted-foreground border-border hover:border-primary'
              }
            `}
          >
            {kw}
            {(added[kw]?.length ?? 0) > 0 && (
              <span className="ml-1 opacity-60">+{added[kw].length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Synonym giriş */}
      {selected && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">&quot;{selected}&quot;</span> için
            sesle söylediğiniz kelimeyi yazın:
          </p>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ör. inovasyon, yenilik..."
              className="h-8 text-sm"
              autoFocus
            />
            <Button size="sm" onClick={handleAdd} disabled={!input.trim()}>
              Ekle
            </Button>
          </div>

          {/* Eklenen synonymler */}
          {(added[selected]?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1">
              {added[selected].map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">
                  {s}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
