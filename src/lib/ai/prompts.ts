// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

export type AnalysisLanguage = 'tr' | 'en' | 'de' | 'fr';

const LANGUAGE_INSTRUCTIONS: Record<AnalysisLanguage, string> = {
  tr: 'Tüm keyword\'leri ve açıklamayı TÜRKÇE yaz. Örnek: "teknoloji", "mavi", "sunum"',
  en: 'Write all keywords and description in ENGLISH.',
  de: 'Schreibe alle Keywords und die Beschreibung auf DEUTSCH.',
  fr: 'Écrivez tous les mots-clés et la description en FRANÇAIS.',
};

export function getImageAnalysisPrompt(
  language: AnalysisLanguage = 'tr',
  keywordCount: number = 3
): string {
  // Türkçe için zenginleştirilmiş prompt: synonyms + forms + confusability + negatives
  // Bu alanlar DeepSlide keyword matcher'ının doğruluğunu dramatik artırır.
  if (language === 'tr') {
    return `Bu görseli analiz et. Sadece JSON döndür:

{
  "keywords": [
    {
      "text": "yürüyüş yolu",
      "confidence": 0.95,
      "category": "object",
      "synonyms": ["patika", "keçi yolu"],
      "forms": ["yürüyüş yolunda", "yürüyüş yoluna", "yürüyüş yolları"],
      "confusability": 0.15,
      "negatives": []
    },
    {
      "text": "sis",
      "confidence": 0.88,
      "category": "concept",
      "synonyms": ["pus", "duman"],
      "forms": ["sisli", "siste", "sisin"],
      "confusability": 0.85,
      "negatives": ["siz", "his", "sus"]
    }
  ],
  "description": "tek cümle Türkçe açıklama"
}

Kurallar:
- Tam olarak ${keywordCount} keyword çıkar, daha fazla değil
- "text": küçük harf, en ayırt edici ${keywordCount} terim
- "confidence": 0-1, bu keyword'ün görselde gerçekten olduğuna güven
- "category": şunlardan biri — "object","concept","color","action","emotion","text"
- "synonyms": 2-4 eş anlamlı alternatif, Türkçe, küçük harf
- "forms": Konuşmacının cümlesinde kullanabileceği Türkçe ek almış formlar
  (bulunma: yolda, yönelme: yoluna, çıkma: yoldan, çoğul: yollar, iyelik: yolları).
  En olası 3-6 formu döndür.
- "confusability": 0-1, bu keyword Türkçe'de başka bir kelimeyle (konuşma sırasında) ne kadar
  karıştırılabilir?
  Yüksek örnekler (0.7-0.9): "sis" (siz), "bal" (bel), "kar" (kır), "bel" (bal), "san" (sen)
  Düşük örnekler (0.1-0.3): "yürüyüş yolu", "bulutlar", "dağ", "saman balyası"
  Varsayılan 0.2 ver.
- "negatives": Bu keyword ile karıştırılabilecek AMA KASTEDİLMEYEN Türkçe kelimeler.
  Yüksek confusability keyword'lerinde 3-5 öğe, düşük confusability keyword'lerinde 0-1.
  "sis" → ["siz","his","sus"]; "bal" → ["bel","bil"]; "dağ" → [].
  Kullanıcı bu kelimeyi söylediğinde eşleşme CEZALANDIRILIR (false positive önleme).
- SADECE geçerli JSON döndür, başka metin yok.

Tüm keyword'leri ve açıklamayı TÜRKÇE yaz.`;
  }

  // Diğer diller için basit prompt (synonym/form/confusability yok — Türkçe'ye özel).
  return `Analyze this image. Return JSON only:

{"keywords":[{"text":"keyword","confidence":0.9,"category":"object"}],"description":"one sentence"}

Rules:
- Extract exactly ${keywordCount} keywords, no more
- "text": lowercase, "confidence": 0-1, "category": one of "object","concept","color","action","emotion","text"
- Pick the ${keywordCount} MOST distinctive and presentation-relevant terms
- Return ONLY valid JSON, no extra text

${LANGUAGE_INSTRUCTIONS[language]}`;
}

export const IMAGE_ANALYSIS_PROMPT = getImageAnalysisPrompt('tr', 3);
