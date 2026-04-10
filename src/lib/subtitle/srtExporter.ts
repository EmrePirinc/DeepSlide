// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { TranscriptEntry } from '@/stores/transcriptStore';

function formatSrtTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const milliseconds = ms % 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ].join(':') + ',' + String(milliseconds).padStart(3, '0');
}

/**
 * TranscriptEntry dizisini SubRip (.srt) formatına dönüştürür.
 * Her giriş ~3 saniye gösterilir (bir sonraki giriş veya +3sn ile sınırlı).
 */
export function exportToSRT(entries: TranscriptEntry[]): string {
  if (entries.length === 0) return '';

  const blocks: string[] = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const startMs = entry.timestamp;
    const endMs = entries[i + 1]?.timestamp ?? startMs + 3000;

    blocks.push(
      [
        String(i + 1),
        `${formatSrtTime(startMs)} --> ${formatSrtTime(endMs)}`,
        entry.text.trim(),
        '',
      ].join('\n')
    );
  }

  return blocks.join('\n');
}

export function downloadSRT(entries: TranscriptEntry[], filename = 'transkript'): void {
  const wordCount = entries.reduce((sum, e) => sum + e.text.split(/\s+/).filter(Boolean).length, 0);
  if (wordCount < 50) throw new Error('SRT için en az 50 kelime gerekli');

  const content = exportToSRT(entries);
  const blob = new Blob([content], { type: 'application/x-subrip;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.srt`;
  a.click();
  URL.revokeObjectURL(url);
}
