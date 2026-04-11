'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { useEffect, useState } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { usePresentationStore } from '@/stores/presentationStore';
import { useFolderStore } from '@/stores/folderStore';
import { useAuth } from '@/hooks/useAuth';

export function Sidebar() {
  const { presentations } = usePresentationStore();
  const { folders, activeFolderId, loadFolders, createFolder, renameFolder, deleteFolder, setActiveFolder } = useFolderStore();
  const { user } = useAuth();

  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    if (user?.uid) loadFolders(user.uid);
  }, [user?.uid, loadFolders]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !user?.uid) return;
    await createFolder(user.uid, newFolderName.trim());
    setNewFolderName('');
    setShowNewFolder(false);
  };

  const handleRename = async (id: string) => {
    if (!renameValue.trim()) return;
    await renameFolder(id, renameValue.trim());
    setRenamingId(null);
    setRenameValue('');
  };

  const presentationCountInFolder = (folderId: string | null) =>
    presentations.filter((p) =>
      folderId === null ? !p.folderId : p.folderId === folderId
    ).length;

  return (
    <aside className="w-64 bg-surface/20 border-r border-white/5 flex flex-col overflow-hidden shrink-0">
      {/* Header */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
            Sunumlar
          </span>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] text-primary font-black">
            {presentations.length}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
        {/* All presentations */}
        <button
          onClick={() => setActiveFolder(null)}
          className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300
            ${activeFolderId === null
              ? 'bg-primary/10 text-primary font-semibold'
              : 'hover:bg-white/5 text-on-surface-variant hover:text-white'}`}
        >
          <MaterialIcon icon="dashboard" size={18} />
          <span className="truncate flex-1 text-left">Tüm Sunumlar</span>
          <span className="text-xs font-bold opacity-60">{presentations.length}</span>
        </button>

        {/* Folders section */}
        {folders.length > 0 && (
          <div className="pt-3">
            <p className="px-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Klasörler
            </p>
            {folders.map((folder) => (
              <div key={folder.id} className="group relative">
                {renamingId === folder.id ? (
                  <div className="flex items-center gap-1 px-3 py-1">
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(folder.id);
                        if (e.key === 'Escape') { setRenamingId(null); setRenameValue(''); }
                      }}
                      onBlur={() => handleRename(folder.id)}
                      className="flex-1 text-sm bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 outline-none focus:ring-1 ring-primary text-white"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveFolder(folder.id)}
                    className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300
                      ${activeFolderId === folder.id
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'hover:bg-white/5 text-on-surface-variant hover:text-white'}`}
                  >
                    <MaterialIcon
                      icon={activeFolderId === folder.id ? 'folder_open' : 'folder'}
                      size={18}
                    />
                    <span className="truncate flex-1 text-left">{folder.name}</span>
                    <span className="text-xs font-bold opacity-60">{presentationCountInFolder(folder.id)}</span>
                  </button>
                )}

                {renamingId !== folder.id && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5">
                    <button
                      onClick={() => { setRenamingId(folder.id); setRenameValue(folder.name); }}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      aria-label="Yeniden adlandır"
                    >
                      <MaterialIcon icon="edit" size={14} className="text-on-surface-variant" />
                    </button>
                    <button
                      onClick={() => deleteFolder(folder.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                      aria-label="Klasörü sil"
                    >
                      <MaterialIcon icon="delete" size={14} className="text-on-surface-variant" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* New folder input */}
        {showNewFolder && (
          <div className="flex items-center gap-1 px-3 py-1">
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') { setShowNewFolder(false); setNewFolderName(''); }
              }}
              placeholder="Klasör adı…"
              className="flex-1 text-sm bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 outline-none focus:ring-1 ring-primary text-white placeholder:text-on-surface-variant/50"
            />
          </div>
        )}
      </div>

      {/* Bottom — Add folder */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={() => setShowNewFolder(true)}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 px-3 py-2.5 text-xs text-on-surface-variant hover:text-white hover:border-primary/30 hover:bg-white/5 transition-all"
        >
          <MaterialIcon icon="create_new_folder" size={16} />
          <span className="font-medium">Yeni Klasör</span>
        </button>
      </div>
    </aside>
  );
}
