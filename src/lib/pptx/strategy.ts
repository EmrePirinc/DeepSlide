// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * PPTX dönüşüm sağlayıcısı seçimi.
 * Faz 1: her zaman 'client' (pptxtojson + kendi canvas renderer).
 * Faz 2: Pro kullanıcı + cloud tercihiyle 'cloud' (ConvertAPI vb.) — KVKK onayıyla.
 */
export type PptxProvider = 'client' | 'cloud';

export function getPptxProvider(): PptxProvider {
  // TODO Faz 2: user.isPremium && user.preferences?.pptxCloud ? 'cloud' : 'client'
  return 'client';
}
