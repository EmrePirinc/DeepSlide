// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Presentation } from '@/types/presentation';
import type { Folder } from '@/types/folder';
import type { SlideNote } from '@/types/note';
import type { PresentationSession } from '@/types/analytics';
import type { CanvasSlide } from '@/types/slide-object';

interface DeepSlideDB extends DBSchema {
  presentations: {
    key: string;
    value: Presentation;
    indexes: { 'by-updated': number; 'by-folder': string };
  };
  imageBlobs: {
    key: string;
    value: {
      id: string;
      presentationId: string;
      blob: Blob;
    };
    indexes: { 'by-presentation': string };
  };
  logs: {
    key: number;
    value: {
      timestamp: number;
      type: string;
      data: unknown;
    };
  };
  folders: {
    key: string;
    value: Folder;
    indexes: { 'by-user': string };
  };
  notes: {
    key: string;
    value: SlideNote;
    indexes: { 'by-presentation': string };
  };
  sessions: {
    key: string;
    value: PresentationSession;
    indexes: { 'by-presentation': string; 'by-started': number };
  };
  canvasSlides: {
    key: string;
    value: CanvasSlide;
    indexes: { 'by-presentation': string; 'by-order': number };
  };
}

const DB_NAME = 'deepslide';
const DB_VERSION = 4;

let dbPromise: Promise<IDBPDatabase<DeepSlideDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<DeepSlideDB>> {
  if (!dbPromise) {
    dbPromise = openDB<DeepSlideDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // v1 stores — create only on fresh install
        if (oldVersion < 1) {
          const presentationStore = db.createObjectStore('presentations', {
            keyPath: 'id',
          });
          presentationStore.createIndex('by-updated', 'updatedAt');
          presentationStore.createIndex('by-folder', 'folderId');

          const imageBlobStore = db.createObjectStore('imageBlobs', {
            keyPath: 'id',
          });
          imageBlobStore.createIndex('by-presentation', 'presentationId');

          db.createObjectStore('logs', { keyPath: 'timestamp' });
        }

        // v2 additions — run on upgrade from v1
        if (oldVersion < 2) {
          // Add by-folder index to existing presentations store (v1 upgrade)
          if (oldVersion >= 1) {
            // In upgrade transaction, the store already exists — add missing index
            // (IDB upgrade transaction gives access to existing stores)
            try {
              // @ts-expect-error: accessing raw idb store during upgrade
              const presStore = db.transaction.objectStore('presentations');
              if (!presStore.indexNames.contains('by-folder')) {
                presStore.createIndex('by-folder', 'folderId');
              }
            } catch {
              // safe to ignore — index may already exist or store not accessible
            }
          }

          // folders store
          if (!db.objectStoreNames.contains('folders')) {
            const foldersStore = db.createObjectStore('folders', { keyPath: 'id' });
            foldersStore.createIndex('by-user', 'userId');
          }

          // notes store
          if (!db.objectStoreNames.contains('notes')) {
            const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
            notesStore.createIndex('by-presentation', 'presentationId');
          }
        }

        // v3 additions — analytics sessions
        if (oldVersion < 3) {
          if (!db.objectStoreNames.contains('sessions')) {
            const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id' });
            sessionsStore.createIndex('by-presentation', 'presentationId');
            sessionsStore.createIndex('by-started', 'startedAt');
          }
        }

        // v4 additions — canvas slides (nesne tabanlı düzenleme)
        if (oldVersion < 4) {
          if (!db.objectStoreNames.contains('canvasSlides')) {
            const canvasStore = db.createObjectStore('canvasSlides', { keyPath: 'id' });
            canvasStore.createIndex('by-presentation', 'presentationId');
            canvasStore.createIndex('by-order', 'order');
          }
        }
      },
    });
  }
  return dbPromise;
}

export type { DeepSlideDB };
