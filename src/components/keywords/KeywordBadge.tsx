'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { Keyword, KeywordCategory } from '@/types/presentation';

const CATEGORY_COLORS: Record<KeywordCategory, string> = {
  object: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  concept: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
  color: 'bg-pink-500/15 text-pink-300 border-pink-500/20',
  action: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  emotion: 'bg-rose-500/15 text-rose-300 border-rose-500/20',
  text: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
};

const DEFAULT_COLOR = 'bg-primary/10 text-primary border-primary/20';

interface KeywordBadgeProps {
  keyword: Keyword;
  onClick?: () => void;
  isMatched?: boolean;
  /** Hint toggle görsel state — sarı ring ile vurgulanır (FR-015). */
  showHintState?: boolean;
}

export function KeywordBadge({
  keyword,
  onClick,
  isMatched,
  showHintState = true,
}: KeywordBadgeProps) {
  const colorClass = keyword.category
    ? CATEGORY_COLORS[keyword.category]
    : DEFAULT_COLOR;

  const isHint = showHintState && keyword.isHint === true;

  return (
    <span
      className={`
        inline-flex items-center px-3.5 py-1.5 rounded-full
        text-[10px] font-black uppercase tracking-[0.15em]
        border cursor-pointer transition-all duration-300 motion-reduce:transition-none
        ${colorClass}
        ${isMatched ? 'ring-2 ring-primary scale-110 shadow-lg shadow-primary/20' : ''}
        ${isHint && !isMatched ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/20' : ''}
        ${keyword.isUserEdited ? 'border-dashed' : ''}
      `}
      style={{ opacity: 0.6 + keyword.confidence * 0.4 }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      aria-pressed={onClick && isHint ? true : undefined}
      aria-label={
        onClick
          ? `${keyword.text} — ${isHint ? 'ipucu işaretli, kaldırmak için tıkla' : 'ipucu olarak işaretle'}`
          : undefined
      }
    >
      {keyword.text}
      {keyword.synonyms.length > 0 && (
        <span className="ml-1.5 opacity-50">+{keyword.synonyms.length}</span>
      )}
    </span>
  );
}
