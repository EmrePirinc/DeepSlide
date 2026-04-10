// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

export type SupportedCodec = 'vp9+webm' | 'h264+mp4' | 'aac+mp4';

const CODEC_CANDIDATES: Array<{ codec: SupportedCodec; mimeType: string }> = [
  { codec: 'vp9+webm', mimeType: 'video/webm;codecs=vp9,opus' },
  { codec: 'h264+mp4', mimeType: 'video/mp4;codecs=avc1.42E01E,mp4a.40.2' },
  { codec: 'aac+mp4', mimeType: 'audio/mp4;codecs=mp4a.40.2' },
];

export function detectSupportedCodec(): SupportedCodec {
  if (typeof MediaRecorder === 'undefined') return 'aac+mp4';

  for (const candidate of CODEC_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(candidate.mimeType)) {
      return candidate.codec;
    }
  }

  return 'aac+mp4';
}

export function getMimeType(codec: SupportedCodec): string {
  switch (codec) {
    case 'vp9+webm': return 'video/webm;codecs=vp9,opus';
    case 'h264+mp4': return 'video/mp4;codecs=avc1.42E01E,mp4a.40.2';
    case 'aac+mp4': return 'audio/mp4;codecs=mp4a.40.2';
  }
}

export function getFileExtension(codec: SupportedCodec): string {
  return codec.includes('webm') ? 'webm' : 'mp4';
}

export function isScreenCaptureSupported(): boolean {
  return typeof navigator !== 'undefined' &&
    'mediaDevices' in navigator &&
    'getDisplayMedia' in navigator.mediaDevices;
}
