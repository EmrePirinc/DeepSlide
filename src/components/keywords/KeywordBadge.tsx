'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { Badge } from '@/components/ui/badge';
import type { Keyword, KeywordCategory } from '@/types/presentation';

const CATEGORY_COLORS: Record<KeywordCategory, string> = {
  object: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  concept: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  action: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  emotion: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  text: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

interface KeywordBadgeProps {
  keyword: Keyword;
  onClick?: () => void;
  isMatched?: boolean;
}

export function KeywordBadge({ keyword, onClick, isMatched }: KeywordBadgeProps) {
  const colorClass = keyword.category
    ? CATEGORY_COLORS[keyword.category]
    : 'bg-gray-100 text-gray-800';

  return (
    <Badge
      variant="outline"
      className={`
        text-xs cursor-pointer transition-all
        ${colorClass}
        ${isMatched ? 'ring-2 ring-primary scale-110' : ''}
        ${keyword.isUserEdited ? 'border-dashed' : ''}
      `}
      style={{ opacity: 0.5 + keyword.confidence * 0.5 }}
      onClick={onClick}
    >
      {keyword.text}
      {keyword.synonyms.length > 0 && (
        <span className="ml-1 opacity-60">+{keyword.synonyms.length}</span>
      )}
    </Badge>
  );
}
