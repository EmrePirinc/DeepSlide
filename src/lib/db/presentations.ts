// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { getDB } from './index';
import type { Presentation } from '@/types/presentation';
import { DEFAULT_SETTINGS } from '@/types/presentation';
import { deleteNotesForPresentation } from './notes';

export async function createPresentation(
  title: string,
  description?: string
): Promise<Presentation> {
  const db = await getDB();
  const now = Date.now();
  const presentation: Presentation = {
    id: crypto.randomUUID(),
    title,
    description,
    images: [],
    settings: { ...DEFAULT_SETTINGS },
    createdAt: now,
    updatedAt: now,
  };
  await db.put('presentations', presentation);
  return presentation;
}

export async function getPresentation(
  id: string
): Promise<Presentation | undefined> {
  const db = await getDB();
  return db.get('presentations', id);
}

export async function listPresentations(): Promise<Presentation[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('presentations', 'by-updated');
  return all.reverse();
}

export async function updatePresentation(
  presentation: Presentation
): Promise<void> {
  const db = await getDB();
  presentation.updatedAt = Date.now();
  await db.put('presentations', presentation);
}

export async function deletePresentation(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['presentations', 'imageBlobs'], 'readwrite');
  await tx.objectStore('presentations').delete(id);
  const blobStore = tx.objectStore('imageBlobs');
  const blobs = await blobStore.index('by-presentation').getAllKeys(id);
  for (const key of blobs) {
    await blobStore.delete(key);
  }
  await tx.done;
  // Clean up associated notes
  await deleteNotesForPresentation(id);
}

export async function clonePresentation(id: string): Promise<Presentation> {
  const db = await getDB();
  const original = await db.get('presentations', id);
  if (!original) throw new Error('Sunum bulunamadı');
  const now = Date.now();
  const cloned: Presentation = {
    ...original,
    id: crypto.randomUUID(),
    title: `${original.title} — Kopya`,
    folderId: null,
    createdAt: now,
    updatedAt: now,
    // images reference same blobKeys — no storage copy needed
    images: original.images.map((img) => ({ ...img, presentationId: crypto.randomUUID() })),
  };
  // Fix presentationId on each image
  const newId = cloned.id;
  cloned.images = original.images.map((img) => ({
    ...img,
    presentationId: newId,
  }));
  await db.put('presentations', cloned);
  return cloned;
}
