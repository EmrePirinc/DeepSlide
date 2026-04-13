// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { parse } from 'pptxtojson';
import type { ParsedPresentation } from './types';

/**
 * .pptx dosyasını `pptxtojson` ile JSON'a çevirir.
 * Her slayt `elements[]` ve tema bilgisi döner.
 * Resim modu 'base64' — canvas render katmanı drawImage için data URL ister.
 */
export async function parsePptx(file: File): Promise<ParsedPresentation> {
  const buffer = await file.arrayBuffer();
  const result = await parse(buffer, {
    imageMode: 'base64',
    videoMode: 'none',
    audioMode: 'none',
  });
  return {
    slides: result.slides,
    themeColors: result.themeColors,
    size: result.size,
  };
}

/** PPTX mime/extension kontrolü */
export function isPptxFile(file: File): boolean {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pptx')) return true;
  return file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
}
