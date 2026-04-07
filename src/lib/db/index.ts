import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Presentation } from '@/types/presentation';

interface DeepSlideDB extends DBSchema {
  presentations: {
    key: string;
    value: Presentation;
    indexes: { 'by-updated': number };
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
}

const DB_NAME = 'deepslide';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<DeepSlideDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<DeepSlideDB>> {
  if (!dbPromise) {
    dbPromise = openDB<DeepSlideDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const presentationStore = db.createObjectStore('presentations', {
          keyPath: 'id',
        });
        presentationStore.createIndex('by-updated', 'updatedAt');

        const imageBlobStore = db.createObjectStore('imageBlobs', {
          keyPath: 'id',
        });
        imageBlobStore.createIndex('by-presentation', 'presentationId');

        db.createObjectStore('logs', {
          keyPath: 'timestamp',
        });
      },
    });
  }
  return dbPromise;
}

export type { DeepSlideDB };
