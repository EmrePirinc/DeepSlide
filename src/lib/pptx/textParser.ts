// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * pptxtojson'dan gelen Text.content değeri HTML string'dir.
 * Örnek: '<p><span style="color:#000;font-size:18pt;font-family:Calibri">Başlık</span></p>'
 *
 * DOMParser Worker ortamında bulunmuyor; regex tabanlı basit parser kullanıyoruz.
 * Tek/çok paragraflı içerikleri satırlara indirir ve ilk encountered span
 * style'dan ortak font özelliklerini çeker.
 */

import type { FontWeight, TextAlign, ListType } from '@/types/slide-object';
import { mapFont } from './fontMap';

export interface ParsedTextStyle {
  plainText: string;
  fontFamily: string;
  fontSize: number;          // px
  fontWeight: FontWeight;
  fontStyle: 'normal' | 'italic';
  color: string;
  textAlign: TextAlign;
  listType: ListType;
}

const DEFAULT_STYLE: ParsedTextStyle = {
  plainText: '',
  fontFamily: 'Inter',
  fontSize: 18,
  fontWeight: 400,
  fontStyle: 'normal',
  // PPTX slaytları genelde koyu metin / açık arka plan içerdiği için siyah
  // fallback. Beyaz arka planda beyaz metin görünmeme bug'ını önler.
  color: '#1F2937',
  textAlign: 'left',
  listType: 'none',
};

export function parseHtmlText(html: string | null | undefined): ParsedTextStyle {
  if (!html) return { ...DEFAULT_STYLE };

  const style = { ...DEFAULT_STYLE };

  // Hizalama — <p style="text-align:center">
  const alignMatch = html.match(/text-align\s*:\s*(left|center|right|justify)/i);
  if (alignMatch) {
    style.textAlign = alignMatch[1].toLowerCase() as TextAlign;
  }

  // Liste tipi
  if (/<ul[\s>]/i.test(html)) style.listType = 'bullet';
  else if (/<ol[\s>]/i.test(html)) style.listType = 'numbered';

  // İlk span'den style bilgisi al (dominant stil varsayımı)
  const firstStyleMatch = html.match(/<span[^>]*style\s*=\s*["']([^"']+)["']/i);
  if (firstStyleMatch) {
    const styleAttr = firstStyleMatch[1];

    // font-size: 18pt | 24px
    // NOT: fontSize raw değer olarak kaydedilir (pt veya px). mapToCanvas
    // slayt ölçeğine göre çarpar — aksi halde double-scale olur.
    const fsMatch = styleAttr.match(/font-size\s*:\s*([\d.]+)\s*(pt|px)/i);
    if (fsMatch) {
      const value = parseFloat(fsMatch[1]);
      style.fontSize = Math.max(6, Math.min(400, value));
    }

    // color: #RRGGBB
    const colorMatch = styleAttr.match(/(?<!-)color\s*:\s*([^;]+)/i);
    if (colorMatch) {
      const raw = colorMatch[1].trim();
      const hex = normalizeColor(raw);
      if (hex) style.color = hex;
    }

    // font-family
    const ffMatch = styleAttr.match(/font-family\s*:\s*([^;]+)/i);
    if (ffMatch) {
      const firstFont = ffMatch[1].split(',')[0];
      style.fontFamily = mapFont(firstFont);
    }

    // font-weight
    const fwMatch = styleAttr.match(/font-weight\s*:\s*(\d{3}|bold|normal)/i);
    if (fwMatch) {
      const fw = fwMatch[1].toLowerCase();
      if (fw === 'bold') style.fontWeight = 700;
      else if (fw === 'normal') style.fontWeight = 400;
      else {
        const n = parseInt(fw, 10);
        if ([300, 400, 500, 600, 700, 800, 900].includes(n)) {
          style.fontWeight = n as FontWeight;
        }
      }
    }

    // font-style: italic
    if (/font-style\s*:\s*italic/i.test(styleAttr)) {
      style.fontStyle = 'italic';
    }
  }

  // <b>, <strong> varlığı — ilk span'de weight yoksa
  if (style.fontWeight === 400 && /<(b|strong)[\s>]/i.test(html)) {
    style.fontWeight = 700;
  }
  // <i>, <em>
  if (style.fontStyle === 'normal' && /<(i|em)[\s>]/i.test(html)) {
    style.fontStyle = 'italic';
  }

  // Plain text çıkar
  style.plainText = htmlToPlainText(html);

  return style;
}

function htmlToPlainText(html: string): string {
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n');
  const stripped = withBreaks.replace(/<[^>]+>/g, '');
  return stripped
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .filter((line, idx, arr) => !(line === '' && arr[idx - 1] === ''))
    .join('\n')
    .trim();
}

function normalizeColor(raw: string): string | null {
  const s = raw.trim();
  // #RGB / #RRGGBB
  const hexMatch = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    if (hexMatch[1].length === 3) {
      return '#' + hexMatch[1].split('').map((c) => c + c).join('').toUpperCase();
    }
    return ('#' + hexMatch[1]).toUpperCase();
  }
  // rgb(r,g,b)
  const rgbMatch = s.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2], 10).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3], 10).toString(16).padStart(2, '0');
    return ('#' + r + g + b).toUpperCase();
  }
  return null;
}
