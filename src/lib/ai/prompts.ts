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
