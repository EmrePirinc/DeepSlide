// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { getDB } from './index';
import type { Folder } from '@/types/folder';

export async function createFolder(userId: string, name: string): Promise<Folder> {
  const db = await getDB();
  const now = Date.now();
  const folder: Folder = {
    id: crypto.randomUUID(),
    userId,
    name: name.trim(),
    createdAt: now,
    updatedAt: now,
  };
  await db.put('folders', folder);
  return folder;
}

export async function getUserFolders(userId: string): Promise<Folder[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('folders', 'by-user', userId);
  return all.sort((a, b) => a.createdAt - b.createdAt);
}

export async function renameFolder(id: string, name: string): Promise<void> {
  const db = await getDB();
  const folder = await db.get('folders', id);
  if (!folder) return;
  await db.put('folders', { ...folder, name: name.trim(), updatedAt: Date.now() });
}

export async function deleteFolder(id: string): Promise<void> {
  const db = await getDB();
  // Move all presentations in this folder to root (folderId = null)
  const all = await db.getAll('presentations');
  const tx = db.transaction(['folders', 'presentations'], 'readwrite');
  for (const p of all) {
    if (p.folderId === id) {
      tx.objectStore('presentations').put({ ...p, folderId: null, updatedAt: Date.now() });
    }
  }
  tx.objectStore('folders').delete(id);
  await tx.done;
}

export async function movePresentationToFolder(
  presentationId: string,
  folderId: string | null,
): Promise<void> {
  const db = await getDB();
  const p = await db.get('presentations', presentationId);
  if (!p) return;
  await db.put('presentations', { ...p, folderId: folderId ?? null, updatedAt: Date.now() });
}
