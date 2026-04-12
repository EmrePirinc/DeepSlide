// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * Türkçe metin normalizasyon katmanı.
 *
 * Kaynak: Adalı & Eryiğit — "Turkish Deasciifier & IR" (ScienceDirect 2015):
 * diacritic'leri kaldırmak Türkçe IR recall'ını %10-18 artırıyor.
 *
 * Match pipeline'ının ilk adımı: hem keyword index build sırasında,
 * hem de query (söylenen kelime) tarafında aynı normalizasyon uygulanır.
 */

/** Türkçe diacritic → ASCII haritası. */
const DIACRITIC_MAP: Record<string, string> = {
  ı: 'i', İ: 'i', I: 'i',
  ş: 's', Ş: 's',
  ğ: 'g', Ğ: 'g',
  ç: 'c', Ç: 'c',
  ö: 'o', Ö: 'o',
  ü: 'u', Ü: 'u',
  â: 'a', Â: 'a',
  î: 'i', Î: 'i',
  û: 'u', Û: 'u',
};

/**
 * Türkçe diacritic'leri ASCII karşılıklarına çevirir.
 * "yürüyüş" → "yuruyus", "İstanbul" → "istanbul", "çağ" → "cag".
 */
export function asciifyTurkish(text: string): string {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    out += DIACRITIC_MAP[ch] ?? ch;
  }
  return out;
}

/**
 * Tam normalizasyon pipeline:
 *   1. Lowercase (Türkçe locale ile — İ → i değil, ı'ya dikkat)
 *   2. Asciify (diacritic → ASCII)
 *   3. Whitespace collapse + trim
 *   4. Noktalama temizliği (apostrof, tire hariç harf dışı her şey)
 */
export function normalizePhrase(text: string): string {
  return asciifyTurkish(text.toLocaleLowerCase('tr-TR'))
    .replace(/[^\p{L}\p{N}\s\-']/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Confusable consonant classes — Türkçe ASR hata paternleri.
 *
 * Aynı sınıfa giren iki karakter, birbirine dönüşüm yaptığında
 * edit mesafesi tam 1 yerine 0.5 olarak sayılır (yarı-eşleşme).
 *
 * - {s,z}: "sis" vs "siz" — en yaygın ASR hatası
 * - {b,p}: "bal" vs "pal"
 * - {k,g}: "kar" vs "gar", post-asciify ğ→g de aynı sınıfa girer
 * - {t,d}: "ten" vs "den"
 * - {c,j}: post-asciify ç→c sonrası yakınlık
 * - {f,v}: "fan" vs "van"
 * - {a,e}: Türkçe'de bazı ağızlarda karışabilen ünlü çifti
 * - {i,e}: "bil" vs "bel"
 * - {o,u}: "kolay" vs "kulak" gibi kenar durumlar
 */
export const CONFUSABLE_CLASSES: readonly (readonly string[])[] = [
  ['s', 'z'],
  ['b', 'p'],
  ['k', 'g'],
  ['t', 'd'],
  ['c', 'j'],
  ['f', 'v'],
  ['a', 'e'],
  ['i', 'e'],
  ['o', 'u'],
];

/**
 * İki karakter aynı confusable class'ta mı?
 * Lookup için önceden hesaplanmış flat Map kullanılır — O(1).
 */
const CONFUSABLE_MAP: Map<string, Set<string>> = (() => {
  const m = new Map<string, Set<string>>();
  for (const cls of CONFUSABLE_CLASSES) {
    for (const ch of cls) {
      if (!m.has(ch)) m.set(ch, new Set());
      for (const other of cls) {
        if (other !== ch) m.get(ch)!.add(other);
      }
    }
  }
  return m;
})();

export function areConfusable(a: string, b: string): boolean {
  if (a === b) return true;
  return CONFUSABLE_MAP.get(a)?.has(b) ?? false;
}

/**
 * Substitution cost: aynı → 0, confusable → 0.5, tamamen farklı → 1.0.
 * Levenshtein/Damerau-Levenshtein varyantlarımız tarafından kullanılır.
 */
export function substitutionCost(a: string, b: string): number {
  if (a === b) return 0;
  if (CONFUSABLE_MAP.get(a)?.has(b)) return 0.5;
  return 1;
}
