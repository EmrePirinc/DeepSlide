// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * 15 slayt düzeni şablonu.
 * Her şablon: placeholder'ların konum, boyut ve türlerini tanımlar.
 * Slayt boyutu: 960x540 (16:9) baz alınmıştır.
 */

export interface LayoutPlaceholder {
  id: string;
  type: 'title' | 'text' | 'image' | 'number' | 'quote';
  x: number;       // px
  y: number;        // px
  width: number;    // px
  height: number;   // px
  hint: string;     // Placeholder ipucu metni
  fontSize?: number;
  fontWeight?: number;
  textAlign?: 'left' | 'center' | 'right';
}

export interface SlideLayout {
  id: string;
  name: string;
  category: 'basic' | 'content' | 'visual' | 'data';
  placeholders: LayoutPlaceholder[];
}

const W = 960;
const H = 540;
const P = 60; // padding

export const SLIDE_LAYOUTS: SlideLayout[] = [
  // 1. Kapak Slaydı
  {
    id: 'cover',
    name: 'Kapak Slaydı',
    category: 'basic',
    placeholders: [
      { id: 'title', type: 'title', x: P, y: H * 0.3, width: W - P * 2, height: 80, hint: 'Sunum başlığı', fontSize: 48, fontWeight: 900, textAlign: 'center' },
      { id: 'subtitle', type: 'text', x: P + 100, y: H * 0.55, width: W - P * 2 - 200, height: 40, hint: 'Alt başlık ekleyin', fontSize: 20, textAlign: 'center' },
    ],
  },
  // 2. Bölüm Ayracı
  {
    id: 'section',
    name: 'Bölüm Ayracı',
    category: 'basic',
    placeholders: [
      { id: 'title', type: 'title', x: P, y: H * 0.35, width: W - P * 2, height: 70, hint: 'Bölüm adı', fontSize: 40, fontWeight: 900, textAlign: 'center' },
      { id: 'desc', type: 'text', x: P + 150, y: H * 0.55, width: W - P * 2 - 300, height: 40, hint: 'Kısa açıklama', fontSize: 16, textAlign: 'center' },
    ],
  },
  // 3. Başlık + Gövde
  {
    id: 'titleBody',
    name: 'Başlık ve Gövde',
    category: 'content',
    placeholders: [
      { id: 'title', type: 'title', x: P, y: 40, width: W - P * 2, height: 60, hint: 'Başlık', fontSize: 32, fontWeight: 700 },
      { id: 'body', type: 'text', x: P, y: 120, width: W - P * 2, height: H - 160, hint: 'İçerik metnini buraya yazın', fontSize: 16 },
    ],
  },
  // 4. Başlık + Görsel (sol metin, sağ görsel)
  {
    id: 'titleImage',
    name: 'Başlık + Görsel',
    category: 'visual',
    placeholders: [
      { id: 'title', type: 'title', x: P, y: 40, width: W * 0.45, height: 50, hint: 'Başlık', fontSize: 28, fontWeight: 700 },
      { id: 'body', type: 'text', x: P, y: 110, width: W * 0.45, height: H - 170, hint: 'Metin ekleyin', fontSize: 14 },
      { id: 'image', type: 'image', x: W * 0.52, y: 40, width: W * 0.45, height: H - 80, hint: 'Görsel eklemek için tıklayın' },
    ],
  },
  // 5. Görsel + Başlık (sol görsel, sağ metin)
  {
    id: 'imageTitle',
    name: 'Görsel + Başlık',
    category: 'visual',
    placeholders: [
      { id: 'image', type: 'image', x: P, y: 40, width: W * 0.45, height: H - 80, hint: 'Görsel eklemek için tıklayın' },
      { id: 'title', type: 'title', x: W * 0.52, y: 40, width: W * 0.45, height: 50, hint: 'Başlık', fontSize: 28, fontWeight: 700 },
      { id: 'body', type: 'text', x: W * 0.52, y: 110, width: W * 0.45, height: H - 170, hint: 'Metin ekleyin', fontSize: 14 },
    ],
  },
  // 6. Tam Ekran Görsel
  {
    id: 'fullImage',
    name: 'Tam Ekran Görsel',
    category: 'visual',
    placeholders: [
      { id: 'image', type: 'image', x: 0, y: 0, width: W, height: H, hint: 'Arka plan görseli ekleyin' },
      { id: 'title', type: 'title', x: P, y: H - 120, width: W - P * 2, height: 50, hint: 'Başlık (overlay)', fontSize: 36, fontWeight: 900, textAlign: 'center' },
    ],
  },
  // 7. İki Sütun
  {
    id: 'twoColumn',
    name: 'İki Sütun',
    category: 'content',
    placeholders: [
      { id: 'title', type: 'title', x: P, y: 30, width: W - P * 2, height: 50, hint: 'Başlık', fontSize: 28, fontWeight: 700, textAlign: 'center' },
      { id: 'left', type: 'text', x: P, y: 100, width: (W - P * 2 - 30) / 2, height: H - 140, hint: 'Sol sütun', fontSize: 14 },
      { id: 'right', type: 'text', x: P + (W - P * 2 - 30) / 2 + 30, y: 100, width: (W - P * 2 - 30) / 2, height: H - 140, hint: 'Sağ sütun', fontSize: 14 },
    ],
  },
  // 8. Üç Sütun
  {
    id: 'threeColumn',
    name: 'Üç Sütun',
    category: 'content',
    placeholders: [
      { id: 'title', type: 'title', x: P, y: 30, width: W - P * 2, height: 50, hint: 'Başlık', fontSize: 28, fontWeight: 700, textAlign: 'center' },
      { id: 'col1', type: 'text', x: P, y: 100, width: (W - P * 2 - 40) / 3, height: H - 140, hint: 'Sütun 1', fontSize: 14 },
      { id: 'col2', type: 'text', x: P + (W - P * 2 - 40) / 3 + 20, y: 100, width: (W - P * 2 - 40) / 3, height: H - 140, hint: 'Sütun 2', fontSize: 14 },
      { id: 'col3', type: 'text', x: P + ((W - P * 2 - 40) / 3 + 20) * 2, y: 100, width: (W - P * 2 - 40) / 3, height: H - 140, hint: 'Sütun 3', fontSize: 14 },
    ],
  },
  // 9. Büyük Sayı
  {
    id: 'bigNumber',
    name: 'Büyük Sayı',
    category: 'data',
    placeholders: [
      { id: 'number', type: 'number', x: P, y: H * 0.2, width: W - P * 2, height: 120, hint: '00%', fontSize: 96, fontWeight: 900, textAlign: 'center' },
      { id: 'desc', type: 'text', x: P + 100, y: H * 0.6, width: W - P * 2 - 200, height: 60, hint: 'Bu sayının anlamını açıklayın', fontSize: 18, textAlign: 'center' },
    ],
  },
  // 10. Alıntı / Quote
  {
    id: 'quote',
    name: 'Alıntı',
    category: 'content',
    placeholders: [
      { id: 'quote', type: 'quote', x: P + 60, y: H * 0.25, width: W - P * 2 - 120, height: 120, hint: 'Alıntı metnini yazın...', fontSize: 24, textAlign: 'center' },
      { id: 'source', type: 'text', x: P + 200, y: H * 0.65, width: W - P * 2 - 400, height: 30, hint: '— Yazar Adı', fontSize: 14, textAlign: 'center' },
    ],
  },
  // 11. Görsel Galeri 2x2
  {
    id: 'gallery2x2',
    name: 'Galeri (2×2)',
    category: 'visual',
    placeholders: [
      { id: 'title', type: 'title', x: P, y: 20, width: W - P * 2, height: 40, hint: 'Başlık', fontSize: 24, fontWeight: 700, textAlign: 'center' },
      { id: 'img1', type: 'image', x: P, y: 80, width: (W - P * 2 - 20) / 2, height: (H - 120) / 2 - 10, hint: 'Görsel 1' },
      { id: 'img2', type: 'image', x: P + (W - P * 2 - 20) / 2 + 20, y: 80, width: (W - P * 2 - 20) / 2, height: (H - 120) / 2 - 10, hint: 'Görsel 2' },
      { id: 'img3', type: 'image', x: P, y: 80 + (H - 120) / 2 + 10, width: (W - P * 2 - 20) / 2, height: (H - 120) / 2 - 10, hint: 'Görsel 3' },
      { id: 'img4', type: 'image', x: P + (W - P * 2 - 20) / 2 + 20, y: 80 + (H - 120) / 2 + 10, width: (W - P * 2 - 20) / 2, height: (H - 120) / 2 - 10, hint: 'Görsel 4' },
    ],
  },
  // 12. Görsel Galeri 1x3
  {
    id: 'gallery1x3',
    name: 'Galeri (1×3)',
    category: 'visual',
    placeholders: [
      { id: 'img1', type: 'image', x: P, y: 40, width: (W - P * 2 - 30) / 3, height: H - 100, hint: 'Görsel 1' },
      { id: 'img2', type: 'image', x: P + (W - P * 2 - 30) / 3 + 15, y: 40, width: (W - P * 2 - 30) / 3, height: H - 100, hint: 'Görsel 2' },
      { id: 'img3', type: 'image', x: P + ((W - P * 2 - 30) / 3 + 15) * 2, y: 40, width: (W - P * 2 - 30) / 3, height: H - 100, hint: 'Görsel 3' },
    ],
  },
  // 13. Madde İşaretli Liste
  {
    id: 'bulletList',
    name: 'Madde Listesi',
    category: 'content',
    placeholders: [
      { id: 'title', type: 'title', x: P, y: 30, width: W - P * 2, height: 50, hint: 'Başlık', fontSize: 28, fontWeight: 700 },
      { id: 'list', type: 'text', x: P + 20, y: 100, width: W - P * 2 - 40, height: H - 140, hint: '• Birinci madde\n• İkinci madde\n• Üçüncü madde', fontSize: 16 },
    ],
  },
  // 14. Karşılaştırma
  {
    id: 'comparison',
    name: 'Karşılaştırma',
    category: 'data',
    placeholders: [
      { id: 'leftTitle', type: 'title', x: P, y: 30, width: (W - P * 2 - 40) / 2, height: 40, hint: 'Sol Başlık', fontSize: 22, fontWeight: 700, textAlign: 'center' },
      { id: 'rightTitle', type: 'title', x: P + (W - P * 2 - 40) / 2 + 40, y: 30, width: (W - P * 2 - 40) / 2, height: 40, hint: 'Sağ Başlık', fontSize: 22, fontWeight: 700, textAlign: 'center' },
      { id: 'leftContent', type: 'text', x: P, y: 90, width: (W - P * 2 - 40) / 2, height: H - 130, hint: 'Sol içerik', fontSize: 14 },
      { id: 'rightContent', type: 'text', x: P + (W - P * 2 - 40) / 2 + 40, y: 90, width: (W - P * 2 - 40) / 2, height: H - 130, hint: 'Sağ içerik', fontSize: 14 },
    ],
  },
  // 15. Boş Slayt
  {
    id: 'blank',
    name: 'Boş',
    category: 'basic',
    placeholders: [],
  },
];

/** Kategoriye göre layout filtrele */
export function getLayoutsByCategory(category: SlideLayout['category']): SlideLayout[] {
  return SLIDE_LAYOUTS.filter(l => l.category === category);
}

/** ID ile layout bul */
export function getLayout(id: string): SlideLayout | undefined {
  return SLIDE_LAYOUTS.find(l => l.id === id);
}
