// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { useLongPress } from '@/hooks/useLongPress';
import type { Folder } from '@/types/folder';

export interface PresentationCardProps {
  id: string;
  title: string;
  imageCount: number;
  updatedAt: number;
  thumbnailUrl?: string;
  folderId?: string | null;
  searchQuery?: string;
  folders?: Folder[];
  onEdit: (id: string) => void;
  onShare: (id: string) => void;
  onClone: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveToFolder?: (id: string, folderId: string | null) => void;
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query || query.length < 2) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/30 text-white rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function PresentationCard({
  id,
  title,
  imageCount,
  updatedAt,
  thumbnailUrl,
  searchQuery,
  folders = [],
  onEdit,
  onShare,
  onClone,
  onDelete,
  onMoveToFolder,
}: PresentationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

  const longPress = useLongPress(() => setIsHovered(true));

  const handleClone = async () => {
    setIsCloning(true);
    try {
      await onClone(id);
    } finally {
      setIsCloning(false);
      setIsHovered(false);
    }
  };

  return (
    <div
      className="relative glass-card rounded-2xl border border-white/5 overflow-hidden cursor-pointer select-none premium-shadow hover:translate-y-[-8px] hover:border-primary/20 transition-all duration-500 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowDeleteConfirm(false); setShowMoveMenu(false); }}
      {...longPress}
    >
      {/* Thumbnail */}
      <div className="aspect-video overflow-hidden relative">
        {thumbnailUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-variant">
            <MaterialIcon icon="image" size={48} className="text-on-surface-variant/30" />
          </div>
        )}

        {/* Image count badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-lg">
          <MaterialIcon icon="photo_library" size={14} className="text-white/80" />
          <span className="text-[10px] font-bold text-white">{imageCount} slayt</span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="font-semibold truncate text-sm text-white">
          {highlightText(title, searchQuery ?? '')}
        </h3>
        <div className="flex items-center gap-2 text-[11px] text-on-surface-variant mt-1.5">
          <span>{imageCount} görsel</span>
          <span className="text-white/20">·</span>
          <span>{new Date(updatedAt).toLocaleDateString('tr-TR')}</span>
        </div>
      </div>

      {/* Hover overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {showDeleteConfirm ? (
              <div className="glass-panel rounded-xl p-5 mx-4 text-center border border-white/10">
                <p className="text-sm font-semibold text-white mb-2">Sunumu sil?</p>
                <p className="text-xs text-on-surface-variant mb-4">Bu işlem geri alınamaz.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-white hover:bg-white/5 transition-colors"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={() => { onDelete(id); setShowDeleteConfirm(false); }}
                    className="flex-1 rounded-lg bg-rose-500 text-white px-3 py-2 text-xs hover:bg-rose-600 transition-colors font-semibold"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ) : showMoveMenu ? (
              <div className="glass-panel rounded-xl p-4 mx-4 w-[calc(100%-2rem)] border border-white/10">
                <p className="text-xs font-semibold mb-3 text-center text-white">Klasöre taşı</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  <button
                    onClick={() => { onMoveToFolder?.(id, null); setShowMoveMenu(false); setIsHovered(false); }}
                    className="w-full flex items-center gap-2 text-left text-xs rounded-lg px-3 py-2 text-white hover:bg-white/10 transition-colors"
                  >
                    <MaterialIcon icon="folder" size={14} /> Tüm Sunumlar
                  </button>
                  {folders.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => { onMoveToFolder?.(id, f.id); setShowMoveMenu(false); setIsHovered(false); }}
                      className="w-full flex items-center gap-2 text-left text-xs rounded-lg px-3 py-2 text-white hover:bg-white/10 transition-colors"
                    >
                      <MaterialIcon icon="folder" size={14} /> {f.name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowMoveMenu(false)}
                  className="mt-3 w-full text-xs text-on-surface-variant hover:text-white transition-colors"
                >
                  Vazgeç
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-2">
                <ActionButton icon="edit" label="Düzenle" onClick={() => onEdit(id)} />
                <ActionButton icon="share" label="Paylaş" onClick={() => onShare(id)} />
                <ActionButton
                  icon={isCloning ? undefined : "content_copy"}
                  spinnerActive={isCloning}
                  label="Klonla"
                  onClick={handleClone}
                  disabled={isCloning}
                />
                {onMoveToFolder && folders.length > 0 && (
                  <ActionButton icon="drive_file_move" label="Taşı" onClick={() => setShowMoveMenu(true)} />
                )}
                <ActionButton icon="delete" label="Sil" onClick={() => setShowDeleteConfirm(true)} danger />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ActionButtonProps {
  icon?: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  spinnerActive?: boolean;
}

function ActionButton({ icon, label, onClick, danger, disabled, spinnerActive }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex flex-col items-center gap-1 rounded-lg px-2.5 py-2 text-white transition-all disabled:opacity-50 active:scale-95
        ${danger ? 'hover:bg-rose-500/30' : 'hover:bg-white/20'} bg-white/10`}
    >
      {spinnerActive ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : icon ? (
        <MaterialIcon icon={icon} size={18} />
      ) : null}
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}
