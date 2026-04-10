// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { openDB, type IDBPDatabase, type DBSchema } from 'idb';

const DB_NAME = 'deepslide-recording';
const DB_VERSION = 1;
const STORE_NAME = 'chunks';
const MAX_CHUNK_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB

interface RecordingDB extends DBSchema {
  chunks: {
    key: number;
    value: {
      id: number;
      recordingId: string;
      chunkIndex: number;
      blob: Blob;
      timestamp: number;
      uploaded: boolean;
    };
    indexes: {
      'by-recording': string;
      'by-recording-chunk': [string, number];
    };
  };
}

let dbPromise: Promise<IDBPDatabase<RecordingDB>> | null = null;

function getDB(): Promise<IDBPDatabase<RecordingDB>> {
  if (!dbPromise) {
    dbPromise = openDB<RecordingDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-recording', 'recordingId');
        store.createIndex('by-recording-chunk', ['recordingId', 'chunkIndex']);
      },
    });
  }
  return dbPromise;
}

export async function appendChunk(recordingId: string, chunkIndex: number, blob: Blob): Promise<void> {
  if (blob.size > MAX_CHUNK_SIZE_BYTES) {
    throw new Error(`Chunk size ${blob.size} exceeds limit of ${MAX_CHUNK_SIZE_BYTES}`);
  }
  const db = await getDB();
  await db.add(STORE_NAME, {
    id: undefined as unknown as number,
    recordingId,
    chunkIndex,
    blob,
    timestamp: Date.now(),
    uploaded: false,
  });
}

export async function getChunks(recordingId: string): Promise<Blob[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex(STORE_NAME, 'by-recording', recordingId);
  all.sort((a, b) => a.chunkIndex - b.chunkIndex);
  return all.map((entry) => entry.blob);
}

export async function getChunkCount(recordingId: string): Promise<number> {
  const db = await getDB();
  return db.countFromIndex(STORE_NAME, 'by-recording', recordingId);
}

export async function getTotalSize(recordingId: string): Promise<number> {
  const db = await getDB();
  const all = await db.getAllFromIndex(STORE_NAME, 'by-recording', recordingId);
  return all.reduce((sum, entry) => sum + entry.blob.size, 0);
}

export async function markUploaded(recordingId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const all = await tx.store.index('by-recording').getAll(recordingId);
  await Promise.all(
    all.map((entry) => tx.store.put({ ...entry, uploaded: true }))
  );
  await tx.done;
}

export async function clearRecording(recordingId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const all = await tx.store.index('by-recording').getAll(recordingId);
  await Promise.all(all.map((entry) => tx.store.delete(entry.id)));
  await tx.done;
}

export async function getUnuploadedRecordingIds(): Promise<string[]> {
  const db = await getDB();
  const all = await db.getAll(STORE_NAME);
  const pending = all.filter((e) => !e.uploaded);
  return [...new Set(pending.map((e) => e.recordingId))];
}

export async function assembleBlob(recordingId: string): Promise<Blob> {
  const chunks = await getChunks(recordingId);
  if (chunks.length === 0) throw new Error(`No chunks found for recording ${recordingId}`);
  return new Blob(chunks, { type: chunks[0].type });
}
