// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * Canvas slayt nesnelerinin IndexedDB CRUD operasyonları.
 * Her slayt ayrı bir kayıt olarak saklanır.
 */

import { getDB } from './index';
import type { CanvasSlide } from '@/types/slide-object';
import { DEFAULT_BACKGROUND } from '@/types/slide-object';
import { nanoid } from 'nanoid';

/**
 * Sunuma ait tüm canvas slaytlarını yükle (sıralı)
 */
export async function getCanvasSlides(presentationId: string): Promise<CanvasSlide[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('canvasSlides', 'by-presentation', presentationId);
  return all.sort((a, b) => a.order - b.order);
}

/**
 * Tek bir canvas slaytını ID ile yükle
 */
export async function getCanvasSlide(slideId: string): Promise<CanvasSlide | undefined> {
  const db = await getDB();
  return db.get('canvasSlides', slideId);
}

/**
 * Canvas slaytını kaydet veya güncelle
 */
export async function saveCanvasSlide(slide: CanvasSlide): Promise<void> {
  const db = await getDB();
  await db.put('canvasSlides', slide);
}

/**
 * Birden fazla slaytı toplu kaydet (batch)
 */
export async function saveCanvasSlides(slides: CanvasSlide[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('canvasSlides', 'readwrite');
  await Promise.all([
    ...slides.map(slide => tx.store.put(slide)),
    tx.done,
  ]);
}

/**
 * Canvas slaytını sil
 */
export async function deleteCanvasSlide(slideId: string): Promise<void> {
  const db = await getDB();
  await db.delete('canvasSlides', slideId);
}

/**
 * Sunuma ait tüm canvas slaytlarını sil
 */
export async function deleteAllCanvasSlides(presentationId: string): Promise<void> {
  const db = await getDB();
  const all = await db.getAllFromIndex('canvasSlides', 'by-presentation', presentationId);
  const tx = db.transaction('canvasSlides', 'readwrite');
  await Promise.all([
    ...all.map(slide => tx.store.delete(slide.id)),
    tx.done,
  ]);
}

/**
 * Sunum için başlangıç slaytı oluştur (yeni sunum açıldığında)
 */
export async function initializeCanvasSlides(presentationId: string): Promise<CanvasSlide[]> {
  const existing = await getCanvasSlides(presentationId);
  if (existing.length > 0) return existing;

  const initialSlide: CanvasSlide = {
    id: nanoid(10),
    presentationId,
    order: 0,
    objects: [],
    background: { ...DEFAULT_BACKGROUND },
    hidden: false,
  };

  await saveCanvasSlide(initialSlide);
  return [initialSlide];
}

/**
 * Her görsel için ayrı canvas slayt oluştur.
 * Slayt ID'si görsel ID'si ile eşleşir (1:1 ilişki).
 * Var olan slaytları korur, sadece eksik olanları oluşturur.
 */
export async function ensureSlideForImage(
  presentationId: string,
  imageId: string,
  order: number,
): Promise<CanvasSlide> {
  // Slayt ID'si = image ID ile aynı
  const existing = await getCanvasSlide(imageId);
  if (existing) return existing;

  const slide: CanvasSlide = {
    id: imageId,
    presentationId,
    order,
    objects: [],
    background: { ...DEFAULT_BACKGROUND },
    hidden: false,
  };

  await saveCanvasSlide(slide);
  return slide;
}

/**
 * Sunumdaki tüm görseller için canvas slaytlarını hazırla.
 * Eksik olanları oluşturur, var olanları korur.
 */
export async function syncCanvasSlidesWithImages(
  presentationId: string,
  imageIds: string[],
): Promise<CanvasSlide[]> {
  const slides = await Promise.all(
    imageIds.map((imgId, idx) => ensureSlideForImage(presentationId, imgId, idx)),
  );
  return slides;
}
