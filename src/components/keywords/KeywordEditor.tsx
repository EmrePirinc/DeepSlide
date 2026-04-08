'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Keyword } from '@/types/presentation';

interface KeywordEditorProps {
  keywords: Keyword[];
  imageId: string;
  onUpdate: (imageId: string, keywordId: string, updates: Partial<Keyword>) => void;
  onDelete: (imageId: string, keywordId: string) => void;
  onAdd: (imageId: string, keyword: Keyword) => void;
  onAddSynonym: (imageId: string, keywordId: string, synonym: string) => void;
}

export function KeywordEditor({
  keywords,
  imageId,
  onUpdate,
  onDelete,
  onAdd,
  onAddSynonym,
}: KeywordEditorProps) {
  const [newKeyword, setNewKeyword] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [synonymInput, setSynonymInput] = useState<Record<string, string>>({});

  const handleAdd = () => {
    if (!newKeyword.trim()) return;
    const keyword: Keyword = {
      id: crypto.randomUUID(),
      text: newKeyword.trim().toLowerCase(),
      confidence: 1.0,
      category: 'concept',
      isUserEdited: true,
      synonyms: [],
    };
    onAdd(imageId, keyword);
    setNewKeyword('');
  };

  const handleStartEdit = (kw: Keyword) => {
    setEditingId(kw.id);
    setEditText(kw.text);
  };

  const handleSaveEdit = (keywordId: string) => {
    if (editText.trim()) {
      onUpdate(imageId, keywordId, { text: editText.trim().toLowerCase() });
    }
    setEditingId(null);
  };

  const handleAddSynonym = (keywordId: string) => {
    const syn = synonymInput[keywordId]?.trim();
    if (!syn) return;
    onAddSynonym(imageId, keywordId, syn.toLowerCase());
    setSynonymInput((prev) => ({ ...prev, [keywordId]: '' }));
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {keywords.map((kw) => (
          <div key={kw.id} className="border rounded-md p-2 space-y-1">
            <div className="flex items-center gap-2">
              {editingId === kw.id ? (
                <Input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(kw.id)}
                  onBlur={() => handleSaveEdit(kw.id)}
                  className="h-7 text-sm"
                  autoFocus
                />
              ) : (
                <span
                  className="text-sm font-medium cursor-pointer hover:underline"
                  onClick={() => handleStartEdit(kw)}
                >
                  {kw.text}
                </span>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {Math.round(kw.confidence * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive"
                onClick={() => onDelete(imageId, kw.id)}
              >
                x
              </Button>
            </div>

            {kw.synonyms.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {kw.synonyms.map((syn, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">
                    {syn}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-1">
              <Input
                placeholder="Eşanlamlı ekle..."
                value={synonymInput[kw.id] ?? ''}
                onChange={(e) =>
                  setSynonymInput((prev) => ({
                    ...prev,
                    [kw.id]: e.target.value,
                  }))
                }
                onKeyDown={(e) => e.key === 'Enter' && handleAddSynonym(kw.id)}
                className="h-6 text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs px-2"
                onClick={() => handleAddSynonym(kw.id)}
              >
                +
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Yeni anahtar kelime..."
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="h-8 text-sm"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={!newKeyword.trim()}
        >
          Ekle
        </Button>
      </div>
    </div>
  );
}
