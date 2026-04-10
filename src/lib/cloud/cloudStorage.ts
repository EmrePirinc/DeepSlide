// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * cloudStorage — IndexedDB ↔ Firestore sunum senkronizasyonu.
 *
 * Sadece metadata (görseller hariç) Firestore'a yazılır.
 * Blob'lar IndexedDB'de kalır — bulut yedekleme opsiyonel.
 *
 * Premium özellik: ücretsiz kullanıcılar yalnızca IndexedDB kullanır.
 */

import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import type { Presentation } from '@/types/presentation';

const COLLECTION = 'presentations';

/** Sunum metadata'sını Firestore'a yaz (blob'lar hariç). */
export async function syncPresentationToCloud(
  uid: string,
  presentation: Presentation
): Promise<void> {
  if (!isFirebaseConfigured()) return;

  const ref = doc(db, COLLECTION, presentation.id);
  const metadata = {
    uid,
    id: presentation.id,
    title: presentation.title,
    description: presentation.description ?? null,
    imageCount: presentation.images.length,
    settings: presentation.settings,
    createdAt: presentation.createdAt,
    updatedAt: presentation.updatedAt,
    syncedAt: serverTimestamp(),
    // Görsellerin keyword özetleri — blob olmadan arama yapılabilsin
    keywordSummary: presentation.images.flatMap((img) =>
      img.keywords.map((kw) => kw.text)
    ),
  };

  await setDoc(ref, metadata, { merge: true });
}

/** Firestore'dan sunum metadata'sını oku. */
export async function fetchPresentationFromCloud(
  presentationId: string
): Promise<Partial<Presentation> | null> {
  if (!isFirebaseConfigured()) return null;

  const ref = doc(db, COLLECTION, presentationId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as Partial<Presentation>;
}

/** Kullanıcıya ait tüm sunum metadata listesini çek. */
export async function listCloudPresentations(
  uid: string
): Promise<Array<{ id: string; title: string; imageCount: number; updatedAt: number }>> {
  if (!isFirebaseConfigured()) return [];

  const q = query(collection(db, COLLECTION), where('uid', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title ?? 'İsimsiz',
      imageCount: data.imageCount ?? 0,
      updatedAt: data.updatedAt ?? 0,
    };
  });
}

/** Firestore'dan sunum kaydını sil. */
export async function deletePresentationFromCloud(
  presentationId: string
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  await deleteDoc(doc(db, COLLECTION, presentationId));
}
