// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * Türkçe Snowball stemmer wrapper.
 *
 * Paket: `snowball-stemmer.jsx` — JSX compiler çıktısı, method isimleri
 * `$S` / `$` ile suffix'li (örn. `setCurrent$S`, `getCurrent$`, `stem$`).
 * Bu yüzden direkt `.stemWord()` gibi temiz bir API yok, wrapper yazıyoruz.
 *
 * Örnekler:
 *   "yolu"      → "yol"
 *   "yolunda"   → "yol"
 *   "yollarıma" → "yol"
 *   "yürüyüş"   → "yürüyüş"  (ek yok)
 *   "yürüyüşün" → "yürüyüş"
 *   "balyaları" → "balya"
 *
 * Over-stemming riski: bazı kelimeler kökünden fazla kesilebilir
 * (örn. "saman" → "sama"). Bu yüzden `keywordMatcher` index'te HEM
 * orijinal HEM stem formunu tutar ve exact match'i her zaman öncelikli yapar.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const snowball = require('snowball-stemmer.jsx/dest/turkish-stemmer.common');

interface JsxStemmer {
  // JSX compiler name-mangled methods
  setCurrent$S: (value: string) => void;
  getCurrent$: () => string;
  stem$: () => boolean;
}

const stemmerInstance: JsxStemmer = new snowball.TurkishStemmer() as JsxStemmer;

/**
 * Tek kelimeyi stem'le. Boş veya null için boş string döner.
 * Idempotent değil — setCurrent + stem + getCurrent zincirini çağırır.
 */
export function stemWord(word: string): string {
  if (!word) return '';
  stemmerInstance.setCurrent$S(word);
  stemmerInstance.stem$();
  return stemmerInstance.getCurrent$();
}

/**
 * Çok kelimeli ifadeyi kelime kelime stem'ler.
 *   "yürüyüş yolunda"     → "yürüyüş yol"
 *   "saman balyaları"     → "sama balya"   (over-stem uyarı: "saman" → "sama")
 *   "yürüyüş yolcuları"   → "yürüyüş yolcu"
 */
export function stemPhrase(phrase: string): string {
  if (!phrase) return '';
  const parts = phrase.split(/\s+/);
  const stemmed = new Array<string>(parts.length);
  for (let i = 0; i < parts.length; i++) {
    stemmed[i] = stemWord(parts[i]);
  }
  return stemmed.join(' ');
}
