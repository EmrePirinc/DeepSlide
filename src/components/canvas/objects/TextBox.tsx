// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { TextObject } from '@/types/slide-object';

interface TextBoxProps {
  object: TextObject;
  isSelected: boolean;
  isEditing: boolean;
  zoom: number;
  onUpdate: (updates: Partial<TextObject>) => void;
  onStartEdit: () => void;
  onEndEdit: () => void;
}

export const TextBox = React.memo(function TextBox({
  object,
  isSelected,
  isEditing,
  zoom,
  onUpdate,
  onStartEdit,
  onEndEdit,
}: TextBoxProps) {
  const editRef = useRef<HTMLDivElement>(null);
  const [localContent, setLocalContent] = useState(object.content);

  // Dışarıdan content değişince sync et
  useEffect(() => {
    if (!isEditing) setLocalContent(object.content);
  }, [object.content, isEditing]);

  // Editing moda girince fokusla
  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      // İmleci sona taşı
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onStartEdit();
  }, [onStartEdit]);

  const handleBlur = useCallback(() => {
    const text = editRef.current?.innerText ?? '';
    onUpdate({ content: text });
    onEndEdit();
  }, [onUpdate, onEndEdit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      editRef.current?.blur();
    }
    // Tab → girinti
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '    ');
    }
    e.stopPropagation(); // Canvas kısayollarını engelle
  }, []);

  const baseStyle: React.CSSProperties = {
    fontFamily: object.fontFamily,
    fontSize: object.fontSize * zoom,
    fontWeight: object.fontWeight,
    fontStyle: object.fontStyle,
    textDecoration: object.textDecoration !== 'none' ? object.textDecoration : undefined,
    color: object.color,
    backgroundColor: object.highlightColor !== 'transparent' ? object.highlightColor : undefined,
    textAlign: object.textAlign,
    lineHeight: object.lineHeight,
    padding: 8 * zoom,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    width: '100%',
    height: '100%',
    outline: 'none',
    display: 'flex',
    alignItems: object.verticalAlign === 'middle' ? 'center' : object.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start',
  };

  const placeholder = !object.content && !isEditing;

  return (
    <div
      className="w-full h-full"
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <div
          ref={editRef}
          contentEditable
          suppressContentEditableWarning
          className="w-full h-full cursor-text"
          style={baseStyle}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onInput={() => {
            setLocalContent(editRef.current?.innerText ?? '');
          }}
        >
          {localContent}
        </div>
      ) : (
        <div style={baseStyle}>
          <div className={`w-full ${placeholder ? 'opacity-30' : ''}`}>
            {object.content || 'Metin eklemek için çift tıklayın'}
          </div>
        </div>
      )}
    </div>
  );
});
