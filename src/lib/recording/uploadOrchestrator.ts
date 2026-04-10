// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { getChunks, markUploaded, getChunkCount } from './recordingBuffer';

export interface UploadOptions {
  recordingId: string;
  mimeType: string;
  extension: string;
  authToken: string;
}

export type UploadStatus = 'idle' | 'uploading' | 'done' | 'error';

type ProgressCallback = (percent: number) => void;
type CompleteCallback = (shareKey: string, shareUrl: string) => void;
type ErrorCallback = (err: Error) => void;

const MAX_PARALLEL_CHUNKS = 3;
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 1000;

async function uploadChunkWithRetry(url: string, blob: Blob, attempt = 0): Promise<void> {
  try {
    const res = await fetch(url, {
      method: 'PUT',
      body: blob,
      headers: { 'Content-Type': blob.type },
    });
    if (!res.ok) throw new Error(`Upload chunk failed: ${res.status}`);
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, RETRY_BASE_MS * 2 ** attempt));
      return uploadChunkWithRetry(url, blob, attempt + 1);
    }
    throw err;
  }
}

async function getSignedUploadUrl(
  recordingId: string,
  chunkIndex: number,
  totalChunks: number,
  authToken: string,
): Promise<string> {
  const res = await fetch('/api/recording/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ recordingId, chunkIndex, totalChunks }),
  });
  if (!res.ok) throw new Error(`Failed to get upload URL: ${res.status}`);
  const { uploadUrl } = await res.json();
  return uploadUrl as string;
}

export class UploadOrchestrator {
  private status: UploadStatus = 'idle';
  private progress = 0;
  private onProgress: ProgressCallback | null = null;
  private onComplete: CompleteCallback | null = null;
  private onError: ErrorCallback | null = null;

  getStatus(): UploadStatus { return this.status; }
  getProgress(): number { return this.progress; }

  on(event: 'progress', cb: ProgressCallback): void;
  on(event: 'complete', cb: CompleteCallback): void;
  on(event: 'error', cb: ErrorCallback): void;
  on(event: string, cb: unknown): void {
    if (event === 'progress') this.onProgress = cb as ProgressCallback;
    if (event === 'complete') this.onComplete = cb as CompleteCallback;
    if (event === 'error') this.onError = cb as ErrorCallback;
  }

  async start(options: UploadOptions): Promise<void> {
    if (this.status === 'uploading') return;
    this.status = 'uploading';
    this.progress = 0;

    const { recordingId, mimeType, extension, authToken } = options;

    try {
      const chunks = await getChunks(recordingId);
      const totalChunks = chunks.length;
      if (totalChunks === 0) throw new Error('No chunks to upload');

      let uploaded = 0;

      for (let i = 0; i < totalChunks; i += MAX_PARALLEL_CHUNKS) {
        const batch = chunks.slice(i, i + MAX_PARALLEL_CHUNKS);
        await Promise.all(
          batch.map(async (blob, batchOffset) => {
            const chunkIndex = i + batchOffset;
            const url = await getSignedUploadUrl(recordingId, chunkIndex, totalChunks, authToken);
            await uploadChunkWithRetry(url, blob);
            uploaded++;
            this.progress = Math.round((uploaded / totalChunks) * 100);
            this.onProgress?.(this.progress);
          }),
        );
      }

      // Notify API: upload complete
      const completeRes = await fetch('/api/recording/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ recordingId, mimeType, extension, chunkCount: totalChunks }),
      });
      if (!completeRes.ok) throw new Error(`Share API failed: ${completeRes.status}`);
      const { shareKey, shareUrl } = await completeRes.json();

      await markUploaded(recordingId);
      this.status = 'done';
      this.progress = 100;
      this.onProgress?.(100);
      this.onComplete?.(shareKey as string, shareUrl as string);
    } catch (err) {
      this.status = 'error';
      this.onError?.(err instanceof Error ? err : new Error('Upload failed'));
    }
  }
}

export async function resumePendingUploads(authToken: string): Promise<void> {
  const { getUnuploadedRecordingIds } = await import('./recordingBuffer');
  const ids = await getUnuploadedRecordingIds();
  for (const recordingId of ids) {
    const count = await getChunkCount(recordingId);
    if (count > 0) {
      const orchestrator = new UploadOrchestrator();
      orchestrator.start({ recordingId, mimeType: 'video/webm', extension: 'webm', authToken });
    }
  }
}
