// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { AnalysisResult, AnalyzedKeyword } from './types';

const VALID_CATEGORIES = ['object', 'concept', 'color', 'action', 'emotion', 'text'] as const;

/**
 * AI yanıtını parse eder. Kesik JSON, markdown fence, thinking tags gibi
 * durumları tolere eder.
 */
export function parseAnalysisResponse(raw: string): AnalysisResult {
  let jsonStr = raw.trim();

  // <think>...</think> bloklarını kaldır (Qwen thinking mode)
  jsonStr = jsonStr.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

  // Markdown code fence'i çıkar
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  // JSON objesini bul (bazen öncesinde/sonrasında metin olabilir)
  const objMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (objMatch) {
    jsonStr = objMatch[0];
  }

  // Kesik JSON onarımı: eksik kapanış parantezlerini ekle
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    // Kesik JSON — kapanış parantezlerini tamamla
    const repaired = repairTruncatedJSON(jsonStr);
    parsed = JSON.parse(repaired);
  }

  if (!parsed.keywords || !Array.isArray(parsed.keywords)) {
    throw new Error('Invalid response: missing keywords array');
  }

  const keywords: AnalyzedKeyword[] = parsed.keywords
    .filter(
      (kw: Record<string, unknown>) =>
        typeof kw.text === 'string' && kw.text.length > 0
    )
    .map((kw: Record<string, unknown>) => ({
      text: String(kw.text).toLowerCase().trim(),
      confidence: typeof kw.confidence === 'number'
        ? Math.max(0, Math.min(1, kw.confidence))
        : 0.5,
      category: VALID_CATEGORIES.includes(kw.category as typeof VALID_CATEGORIES[number])
        ? (kw.category as typeof VALID_CATEGORIES[number])
        : 'concept',
    }))
    .slice(0, 15);

  if (keywords.length < 1) {
    throw new Error('No keywords extracted');
  }

  return {
    keywords,
    description: typeof parsed.description === 'string'
      ? parsed.description
      : '',
  };
}

/**
 * Kesik JSON string'i onarır.
 * Eksik kapanış parantezleri ve virgülleri tamamlar.
 */
function repairTruncatedJSON(str: string): string {
  // Son eksik string'i kapat
  const quoteCount = (str.match(/(?<!\\)"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    str += '"';
  }

  // Son eksik objeyi/array'i tamamla
  // Son tamamlanmamış öğeyi bul ve kes
  const lastCompleteItem = str.lastIndexOf('},');
  const lastCompleteItem2 = str.lastIndexOf('}]');
  const cutPoint = Math.max(lastCompleteItem, lastCompleteItem2);

  if (cutPoint > 0 && cutPoint < str.length - 5) {
    str = str.substring(0, cutPoint + 1);
  }

  // Eksik kapanışları ekle
  const opens = { '{': 0, '[': 0 };
  for (const ch of str) {
    if (ch === '{') opens['{']++;
    if (ch === '}') opens['{']--;
    if (ch === '[') opens['[']++;
    if (ch === ']') opens['[']--;
  }

  // Kapanış ekle
  for (let i = 0; i < opens['[']; i++) str += ']';
  for (let i = 0; i < opens['{']; i++) str += '}';

  return str;
}
