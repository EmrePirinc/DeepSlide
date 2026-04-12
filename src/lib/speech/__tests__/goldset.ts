// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * DeepSlide Türkçe keyword matching gold set.
 *
 * Her vaka:
 *   - scene: sahnede hangi görsellerde hangi keyword'ler var
 *   - spoken: kullanıcının söylediği Türkçe cümle (transkript)
 *   - expected: eşleşmesi gereken imageId (null = hiç eşleşmemeli)
 *   - category: sorun türü (A-J)
 *   - rationale: neden bu sonucu bekliyoruz
 *
 * Kategoriler:
 *   A — İki kelimeli tam eşleşme
 *   B — İki kelimeli ek varyasyonu
 *   C — Homofon trap (sis/siz, bal/bel)
 *   D — Tek kelime ek varyasyonu (yol → yolda)
 *   E — ASR hatası (ü→u, transpose)
 *   F — Uzun cümle → en spesifik keyword
 *   G — Negatif (hiç eşleşmemeli)
 *   H — Diacritic-agnostik (asciify test)
 */

export interface KeywordSpec {
  text: string;
  synonyms?: string[];
  forms?: string[];
  confusability?: number;
}

export interface SceneImage {
  id: string;
  keywords: KeywordSpec[];
}

export interface GoldCase {
  id: string;
  category: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
  scene: SceneImage[];
  spoken: string;
  expected: string | null;
  rationale: string;
}

// Ortak sahneler — vakalar içinde tekrar kullanılır
const SCENE_LANDSCAPE: SceneImage[] = [
  { id: 'img-path', keywords: [{ text: 'yürüyüş yolu' }] },
  { id: 'img-hay', keywords: [{ text: 'saman balyası' }] },
  { id: 'img-fog', keywords: [{ text: 'sis', confusability: 0.85 }] },
  { id: 'img-cloud', keywords: [{ text: 'bulutlar' }] },
  { id: 'img-mountain', keywords: [{ text: 'dağ' }] },
];

const SCENE_CONFUSABLE: SceneImage[] = [
  { id: 'img-honey', keywords: [{ text: 'bal', confusability: 0.8 }] },
  { id: 'img-waist', keywords: [{ text: 'bel', confusability: 0.8 }] },
  { id: 'img-snow', keywords: [{ text: 'kar', confusability: 0.8 }] },
  { id: 'img-rural', keywords: [{ text: 'kır', confusability: 0.7 }] },
];

const SCENE_ROAD: SceneImage[] = [
  { id: 'img-road', keywords: [{ text: 'yol' }] },
  { id: 'img-car', keywords: [{ text: 'araba' }] },
  { id: 'img-tree', keywords: [{ text: 'ağaç' }] },
];

export const GOLD_SET: GoldCase[] = [
  // ========== A: İki kelimeli tam eşleşme ==========
  {
    id: 'A1',
    category: 'A',
    scene: SCENE_LANDSCAPE,
    spoken: 'bu yürüyüş yolu çok güzel',
    expected: 'img-path',
    rationale: 'Tam iki kelimeli ifade cümle içinde geçiyor',
  },
  {
    id: 'A2',
    category: 'A',
    scene: SCENE_LANDSCAPE,
    spoken: 'saman balyası tarlada duruyor',
    expected: 'img-hay',
    rationale: 'İki kelimeli keyword düz formda',
  },
  {
    id: 'A3',
    category: 'A',
    scene: SCENE_LANDSCAPE,
    spoken: 'bulutlar ve dağ harika görünüyor',
    expected: 'img-cloud',
    rationale: 'İki ayrı keyword var, bulutlar daha önce geçiyor + kısa cümle ilk eşleşmeyi seçer',
  },

  // ========== B: İki kelimeli ek varyasyonu ==========
  {
    id: 'B1',
    category: 'B',
    scene: SCENE_LANDSCAPE,
    spoken: 'yürüyüş yolunda ilerliyorum',
    expected: 'img-path',
    rationale: 'yolu → yolunda (locative), stem ile yakalanmalı',
  },
  {
    id: 'B2',
    category: 'B',
    scene: SCENE_LANDSCAPE,
    spoken: 'yürüyüş yoluna geldim',
    expected: 'img-path',
    rationale: 'yolu → yoluna (dative)',
  },
  {
    id: 'B3',
    category: 'B',
    scene: SCENE_LANDSCAPE,
    spoken: 'saman balyaları çok güzel',
    expected: 'img-hay',
    rationale: 'balyası → balyaları (plural possessive)',
  },

  // ========== C: Homofon trap ==========
  {
    id: 'C1',
    category: 'C',
    scene: SCENE_LANDSCAPE,
    spoken: 'sabahleyin sis vardı',
    expected: 'img-fog',
    rationale: 'sis keyword var, "siz" diye yanlış tanımayabilir — confusability yüksek',
  },
  {
    id: 'C2',
    category: 'C',
    scene: SCENE_LANDSCAPE,
    spoken: 'siz de buraya gelin',
    expected: null,
    rationale: 'siz != sis, threshold yüksek olduğu için eşleşmemeli',
  },
  {
    id: 'C3',
    category: 'C',
    scene: SCENE_CONFUSABLE,
    spoken: 'bal aldım market ten',
    expected: 'img-honey',
    rationale: 'bal doğru, bel değil',
  },
  {
    id: 'C4',
    category: 'C',
    scene: SCENE_CONFUSABLE,
    spoken: 'belim ağrıyor bugün',
    expected: null,
    rationale: 'bel var sahnede ama "belim" stem ile "bel"e eşleşmeli — aslında POZITIF test',
  },
  {
    id: 'C5',
    category: 'C',
    scene: SCENE_CONFUSABLE,
    spoken: 'kar yağıyor dışarıda',
    expected: 'img-snow',
    rationale: 'kar doğru, kır değil',
  },

  // ========== D: Tek kelime ek varyasyonu ==========
  {
    id: 'D1',
    category: 'D',
    scene: SCENE_ROAD,
    spoken: 'yolda beni bekle',
    expected: 'img-road',
    rationale: 'yol → yolda, stem ile yakalanmalı',
  },
  {
    id: 'D2',
    category: 'D',
    scene: SCENE_ROAD,
    spoken: 'yoluna bak',
    expected: 'img-road',
    rationale: 'yol → yoluna',
  },
  {
    id: 'D3',
    category: 'D',
    scene: SCENE_ROAD,
    spoken: 'arabaların hepsi kırmızı',
    expected: 'img-car',
    rationale: 'araba → arabaların, stem ile yakalanmalı',
  },
  {
    id: 'D4',
    category: 'D',
    scene: SCENE_ROAD,
    spoken: 'ağaçların altında oturduk',
    expected: 'img-tree',
    rationale: 'ağaç → ağaçların, Türkçe diacritic + stem',
  },
  {
    id: 'D5',
    category: 'D',
    scene: SCENE_LANDSCAPE,
    spoken: 'dağlar çok yüksek',
    expected: 'img-mountain',
    rationale: 'dağ → dağlar (plural), stem',
  },

  // ========== E: ASR hatası (transpose, ü→u) ==========
  {
    id: 'E1',
    category: 'E',
    scene: SCENE_LANDSCAPE,
    spoken: 'yurüyüş yolu çok uzun',
    expected: 'img-path',
    rationale: 'ASR ü yerine u döktü — asciify sonrası eşleşmeli',
  },
  {
    id: 'E2',
    category: 'E',
    scene: SCENE_LANDSCAPE,
    spoken: 'yolun kenarında dag var',
    expected: 'img-mountain',
    rationale: 'dağ → dag ASR hatası, asciify sonrası dog değil dag ile dağ eşleşmeli',
  },

  // ========== F: Uzun cümle, en spesifik keyword ==========
  {
    id: 'F1',
    category: 'F',
    scene: SCENE_LANDSCAPE,
    spoken: 'bu sabah dağda yürüyüş yolu üzerinde yürürken',
    expected: 'img-path',
    rationale: 'hem dağ hem yürüyüş yolu var — iki kelimeli daha spesifik',
  },
  {
    id: 'F2',
    category: 'F',
    scene: SCENE_LANDSCAPE,
    spoken: 'bulutların arasında saman balyası',
    expected: 'img-hay',
    rationale: 'hem bulut hem saman balyası — iki kelimeli spesifik kazanır',
  },

  // ========== G: Negatif (hiç eşleşmemeli) ==========
  {
    id: 'G1',
    category: 'G',
    scene: SCENE_LANDSCAPE,
    spoken: 'arabayla geldim bugün',
    expected: null,
    rationale: 'Hiçbir keyword yok sahnede',
  },
  {
    id: 'G2',
    category: 'G',
    scene: SCENE_LANDSCAPE,
    spoken: 'telefon çaldı',
    expected: null,
    rationale: 'İlgisiz kelime',
  },
  {
    id: 'G3',
    category: 'G',
    scene: SCENE_ROAD,
    spoken: 'kahve içtik',
    expected: null,
    rationale: 'İlgisiz',
  },

  // ========== H: Diacritic-agnostik ==========
  {
    id: 'H1',
    category: 'H',
    scene: [{ id: 'img-fog', keywords: [{ text: 'sıs' }] }], // yanlış yazılmış keyword
    spoken: 'sis yoğundu',
    expected: 'img-fog',
    rationale: 'Keyword "sıs" yazılmış (ı) ama kullanıcı "sis" dedi — asciify ile eşleşmeli',
  },
  {
    id: 'H2',
    category: 'H',
    scene: [{ id: 'img-tree', keywords: [{ text: 'agaç' }] }], // yanlış yazılmış
    spoken: 'ağaçlar güzel',
    expected: 'img-tree',
    rationale: 'Keyword "agaç" eksik yazılmış — asciify + stem ile eşleşmeli',
  },
];

/**
 * Gold set üzerinde precision/recall/F1 hesaplama.
 * fn: (scene, spoken) → matched imageId | null
 */
export interface EvalResult {
  total: number;
  truePositive: number;
  trueNegative: number;
  falsePositive: number;
  falseNegative: number;
  wrongMatch: number; // bir şey döndürdü ama yanlış görsel
  precision: number;
  recall: number;
  f1: number;
  byCategory: Record<string, { pass: number; fail: number }>;
  failures: Array<{ id: string; expected: string | null; got: string | null; spoken: string }>;
}

export function evaluateGoldSet(
  fn: (scene: SceneImage[], spoken: string) => string | null,
): EvalResult {
  const result: EvalResult = {
    total: GOLD_SET.length,
    truePositive: 0,
    trueNegative: 0,
    falsePositive: 0,
    falseNegative: 0,
    wrongMatch: 0,
    precision: 0,
    recall: 0,
    f1: 0,
    byCategory: {},
    failures: [],
  };

  for (const gc of GOLD_SET) {
    const got = fn(gc.scene, gc.spoken);
    const pass =
      gc.expected === null
        ? got === null
        : got === gc.expected;

    const catStat = result.byCategory[gc.category] ?? { pass: 0, fail: 0 };
    if (pass) catStat.pass++;
    else catStat.fail++;
    result.byCategory[gc.category] = catStat;

    if (gc.expected === null && got === null) result.trueNegative++;
    else if (gc.expected !== null && got === gc.expected) result.truePositive++;
    else if (gc.expected === null && got !== null) result.falsePositive++;
    else if (gc.expected !== null && got === null) result.falseNegative++;
    else result.wrongMatch++;

    if (!pass) {
      result.failures.push({
        id: gc.id,
        expected: gc.expected,
        got,
        spoken: gc.spoken,
      });
    }
  }

  const tp = result.truePositive;
  const fpCount = result.falsePositive + result.wrongMatch;
  const fnCount = result.falseNegative + result.wrongMatch;
  result.precision = tp + fpCount === 0 ? 1 : tp / (tp + fpCount);
  result.recall = tp + fnCount === 0 ? 1 : tp / (tp + fnCount);
  result.f1 =
    result.precision + result.recall === 0
      ? 0
      : (2 * result.precision * result.recall) / (result.precision + result.recall);

  return result;
}
