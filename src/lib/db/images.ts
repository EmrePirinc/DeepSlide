import { getDB } from './index';

export async function saveImageBlob(
  id: string,
  presentationId: string,
  blob: Blob
): Promise<void> {
  const db = await getDB();
  await db.put('imageBlobs', { id, presentationId, blob });
}

export async function getImageBlob(id: string): Promise<Blob | undefined> {
  const db = await getDB();
  const record = await db.get('imageBlobs', id);
  return record?.blob;
}

export async function deleteImageBlob(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('imageBlobs', id);
}

export async function deleteImageBlobsByPresentation(
  presentationId: string
): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('imageBlobs', 'readwrite');
  const store = tx.objectStore('imageBlobs');
  const keys = await store.index('by-presentation').getAllKeys(presentationId);
  for (const key of keys) {
    await store.delete(key);
  }
  await tx.done;
}
