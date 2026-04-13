// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * MS Office / Windows font isimlerini DeepSlide'ın yüklü Google font'larına
 * haritalar. Bilinmeyen fontlar 'Inter' fallback'ine düşer.
 *
 * Not: DeepSlide tema fontları (Inter, Merriweather, Open Sans vb.) layout'ta
 * halihazırda yükleniyor. Bu liste sadece pptx → DeepSlide font ismi çevirisidir.
 */

const FONT_MAP: Record<string, string> = {
  // Sans serif
  'calibri': 'Inter',
  'calibri light': 'Inter',
  'arial': 'Inter',
  'arial black': 'Inter',
  'helvetica': 'Inter',
  'helvetica neue': 'Inter',
  'segoe ui': 'Inter',
  'tahoma': 'Inter',
  'verdana': 'Open Sans',
  'trebuchet ms': 'Inter',
  'century gothic': 'Inter',
  'corbel': 'Inter',
  'candara': 'Inter',
  'roboto': 'Inter',

  // Serif
  'cambria': 'Merriweather',
  'times new roman': 'Merriweather',
  'georgia': 'Merriweather',
  'garamond': 'Merriweather',
  'book antiqua': 'Merriweather',
  'palatino linotype': 'Merriweather',
  'constantia': 'Merriweather',

  // Monospace
  'consolas': 'JetBrains Mono',
  'courier new': 'JetBrains Mono',
  'lucida console': 'JetBrains Mono',

  // Türkçe kurumsal
  'dejavu sans': 'Inter',
  'noto sans': 'Inter',
};

export function mapFont(fontName: string | undefined | null): string {
  if (!fontName) return 'Inter';
  const key = fontName.trim().toLowerCase().replace(/["']/g, '');
  return FONT_MAP[key] ?? 'Inter';
}
