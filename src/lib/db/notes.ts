// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { getDB } from './index';
import type { SlideNote } from '@/types/note';

const MAX_NOTE_LENGTH = 1000;

function noteId(presentationId: string, slideId: string): string {
  return `${presentationId}__${slideId}`;
}

export async function saveNote(
  presentationId: string,
  slideId: string,
  text: string,
): Promise<void> {
  const db = await getDB();
  const note: SlideNote = {
    id: noteId(presentationId, slideId),
    presentationId,
    slideId,
    text: text.substring(0, MAX_NOTE_LENGTH),
    updatedAt: Date.now(),
  };
  await db.put('notes', note);
}

export async function getNote(
  presentationId: string,
  slideId: string,
): Promise<SlideNote | undefined> {
  const db = await getDB();
  return db.get('notes', noteId(presentationId, slideId));
}

export async function getNotesForPresentation(
  presentationId: string,
): Promise<SlideNote[]> {
  const db = await getDB();
  return db.getAllFromIndex('notes', 'by-presentation', presentationId);
}

export async function deleteNotesForPresentation(presentationId: string): Promise<void> {
  const db = await getDB();
  const notes = await db.getAllFromIndex('notes', 'by-presentation', presentationId);
  const tx = db.transaction('notes', 'readwrite');
  for (const note of notes) {
    tx.store.delete(note.id);
  }
  await tx.done;
}
