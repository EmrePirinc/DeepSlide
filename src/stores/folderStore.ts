// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { create } from 'zustand';
import type { Folder } from '@/types/folder';
import {
  createFolder as dbCreateFolder,
  getUserFolders,
  renameFolder as dbRenameFolder,
  deleteFolder as dbDeleteFolder,
  movePresentationToFolder as dbMove,
} from '@/lib/db/folders';

interface FolderState {
  folders: Folder[];
  activeFolderId: string | null;
  isLoading: boolean;
  loadFolders: (userId: string) => Promise<void>;
  createFolder: (userId: string, name: string) => Promise<Folder>;
  renameFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  setActiveFolder: (id: string | null) => void;
  movePresentation: (presentationId: string, folderId: string | null) => Promise<void>;
}

export const useFolderStore = create<FolderState>((set, get) => ({
  folders: [],
  activeFolderId: null,
  isLoading: false,

  loadFolders: async (userId: string) => {
    set({ isLoading: true });
    const folders = await getUserFolders(userId);
    set({ folders, isLoading: false });
  },

  createFolder: async (userId: string, name: string) => {
    const folder = await dbCreateFolder(userId, name);
    set((state) => ({ folders: [...state.folders, folder] }));
    return folder;
  },

  renameFolder: async (id: string, name: string) => {
    await dbRenameFolder(id, name);
    set((state) => ({
      folders: state.folders.map((f) =>
        f.id === id ? { ...f, name, updatedAt: Date.now() } : f,
      ),
    }));
  },

  deleteFolder: async (id: string) => {
    await dbDeleteFolder(id);
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== id),
      activeFolderId: state.activeFolderId === id ? null : state.activeFolderId,
    }));
  },

  setActiveFolder: (id: string | null) => set({ activeFolderId: id }),

  movePresentation: async (presentationId: string, folderId: string | null) => {
    await dbMove(presentationId, folderId);
    // Reload presentations from store if active folder changes visibility
    const { activeFolderId } = get();
    // Trigger a reload on the next usePresentationStore.loadPresentations call
    // by dispatching a custom event (simple cross-store signal)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('deepslide:presentationMoved', {
        detail: { presentationId, folderId, activeFolderId },
      }));
    }
  },
}));
