// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * Türkçe NLP yardımcıları — sıfır harici bağımlılık, <1ms / çağrı.
 *
 * İki fonksiyon:
 *   1. normalizeAndAsciify — diacritic → ASCII, noktalama temizle, lowercase
 *   2. fastTurkishStemmer  — light suffix stripping + postlude (ünsüz yumuşaması geri)
 *
 * Amaç: WebSpeech transcript'ini ve Gemini keyword'lerini aynı karakter uzayına
 * indirgeyip Aho-Corasick otomatının tarayabileceği bir string'e dönüştürmek.
 */

/** Türkçe diacritic → ASCII map. Lowercase öncesi uygulanır. */
const CHAR_MAP: Record<string, string> = {
  ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u',
  Ç: 'c', Ğ: 'g', I: 'i', İ: 'i', Ö: 'o', Ş: 's', Ü: 'u',
  // Circumflex (nadir Türkçe kelimeler: kâr, hâlâ)
  â: 'a', Â: 'a', î: 'i', Î: 'i', û: 'u', Û: 'u',
};

const DIACRITIC_REGEX = /[çğıöşüÇĞIİÖŞÜâÂîÎûÛ]/g;

/**
 * "Yürüyüş Yolunda!" → "yuruyus yolunda"
 *
 * Pipeline:
 *   1. Manuel charmap ile diacritic → ASCII (Türkçe ı/i ayrımı için zorunlu)
 *   2. NFD + combining marks regex ile kalan vurguları temizle
 *   3. Noktalama → boşluk
 *   4. lowercase + whitespace collapse + trim
 */
export function normalizeAndAsciify(text: string): string {
  if (!text) return '';

  return text
    .replace(DIACRITIC_REGEX, (m) => CHAR_MAP[m] ?? m)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Türkçe son ekleri uzundan kısaya sıralı. İlk eşleşen kesilir.
 * Uzun önce: "lerimizin" kontrolü "in" kontrolünden ÖNCE olmalı
 * ki "yollarımızın" → "yol" olsun, "yollarımı" olmasın.
 *
 * Not: Zaten asciified form üzerinde çalışır, bu yüzden tüm ekler
 * ASCII karşılıklarıyla (ı→i, ü→u...) yazılmıştır.
 */
const SUFFIXES: readonly string[] = [
  // 9 char
  'lerimizin', 'larimizin', 'lerimizden', 'larimizdan',
  'lerimizle', 'larimizla', 'lerinize', 'lariniza',
  // 6 char
  'lardan', 'lerden',
  // 5 char
  'larin', 'lerin', 'larda', 'lerde', 'lara', 'lere',
  'lari', 'leri',
  // 5 char (ablatif + lokatif kompozit)
  'indan', 'inden', 'undan', 'unden',
  'inda', 'inde', 'unda', 'unde',
  // 3 char
  'ina', 'ine', 'una', 'une', 'ini', 'unu',
  'dan', 'den', 'tan', 'ten',
  'lar', 'ler',
  // 2 char — buffered possessives (sesli + s/n birleşim)
  // "balyası" (balya+sı), "suyu" (suy+u), "evin" vs.
  'si', 'su', 'ni', 'nu',
  // 2 char — lokatif, ablatif, ilgi
  'da', 'de', 'ta', 'te', 'in', 'un',
  // 1 char (ikili sesli/ünsüz, en son)
  'a', 'e', 'i', 'u',
];

/**
 * Postlude — ünsüz yumuşaması geri çevirme.
 * Türkçe kuralı: p/ç/t/k → b/c/d/g ünlüyle başlayan ek alınca.
 * Stem sonunda yumuşamış ünsüz varsa aslına döndür.
 *
 * Örnek: "kitabı" → stripped "kitab" → postlude "kitap"
 * Örnek: "ağacı" → stripped "agac" → postlude "agac" (c hem yumuşak hem sert,
 *        karışıklık önlemek için sadece belirgin olanları çeviriyoruz)
 */
const POSTLUDE: Record<string, string> = {
  b: 'p',
  d: 't',
  g: 'k',
};

/**
 * "yolunda" → "yol", "kitabı" → "kitap", "daglari" → "dag"
 *
 * Minimum 3 char güvenlik: "ev", "su" gibi kısa kelimeler olduğu gibi döner.
 * Postlude sadece stripping gerçekten bir şey kestiyse ve kalan kök uzunsa uygulanır.
 */
const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

export function fastTurkishStemmer(word: string): string {
  if (!word || word.length <= 3) return word;

  let stripped = word;
  let strippedSuffix = '';

  for (const suffix of SUFFIXES) {
    if (stripped.length - suffix.length < 3) continue;
    if (stripped.endsWith(suffix)) {
      stripped = stripped.slice(0, -suffix.length);
      strippedSuffix = suffix;
      break;
    }
  }

  // Postlude (ünsüz yumuşaması geri) SADECE ünlüyle başlayan ek kesildiğinde.
  // Türkçe kuralı: "kitap + ı = kitabı" (p→b), "dağ + lar = dağlar" (değişim yok).
  // Yani "lar" kesildiğinde postlude yapmıyoruz, "i" kesildiğinde yapıyoruz.
  if (
    strippedSuffix &&
    stripped.length >= 3 &&
    VOWELS.has(strippedSuffix[0])
  ) {
    const lastChar = stripped[stripped.length - 1];
    const softened = POSTLUDE[lastChar];
    if (softened) {
      stripped = stripped.slice(0, -1) + softened;
    }
  }

  return stripped;
}
