// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { detectSupportedCodec, getMimeType, getFileExtension, isScreenCaptureSupported } from './codecDetector';
import { appendChunk, getChunkCount } from './recordingBuffer';

export type RecordingQuality = '480p' | '1080p';
export type RecordingState = 'idle' | 'recording' | 'stopping' | 'error';

export interface RecordingOptions {
  quality: RecordingQuality;
  includeScreen: boolean;
  recordingId: string;
}

export interface RecordingResult {
  recordingId: string;
  mimeType: string;
  extension: string;
  chunkCount: number;
  durationMs: number;
}

type StateChangeCallback = (state: RecordingState) => void;
type ChunkCallback = (chunkIndex: number) => void;
type ErrorCallback = (error: Error) => void;

const QUALITY_CONSTRAINTS: Record<RecordingQuality, MediaTrackConstraints> = {
  '480p': { width: { max: 854 }, height: { max: 480 }, frameRate: { max: 30 } },
  '1080p': { width: { max: 1920 }, height: { max: 1080 }, frameRate: { max: 30 } },
};

const CHUNK_INTERVAL_MS = 5000; // IndexedDB'ye her 5 saniyede bir yaz

class RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private state: RecordingState = 'idle';
  private chunkIndex = 0;
  private startTime = 0;
  private currentRecordingId = '';
  private currentMimeType = '';
  private currentExtension = '';

  private onStateChange: StateChangeCallback | null = null;
  private onChunk: ChunkCallback | null = null;
  private onError: ErrorCallback | null = null;

  getState(): RecordingState {
    return this.state;
  }

  private setState(state: RecordingState) {
    this.state = state;
    this.onStateChange?.(state);
  }

  async start(options: RecordingOptions): Promise<{ isSafariMode: boolean }> {
    if (this.state !== 'idle') throw new Error('Recording already in progress');

    const codec = detectSupportedCodec();
    const mimeType = getMimeType(codec);
    const extension = getFileExtension(codec);
    const isSafariMode = codec === 'aac+mp4';

    this.currentRecordingId = options.recordingId;
    this.currentMimeType = mimeType;
    this.currentExtension = extension;
    this.chunkIndex = 0;

    const audioConstraints: MediaTrackConstraints = { echoCancellation: true, noiseSuppression: true };

    let stream: MediaStream;

    if (!isSafariMode && options.includeScreen && isScreenCaptureSupported()) {
      const [displayStream, audioStream] = await Promise.all([
        navigator.mediaDevices.getDisplayMedia({
          video: QUALITY_CONSTRAINTS[options.quality],
        }),
        navigator.mediaDevices.getUserMedia({ audio: audioConstraints }),
      ]);
      stream = new MediaStream([
        ...displayStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);
    } else {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
        ...(isSafariMode ? {} : { video: QUALITY_CONSTRAINTS[options.quality] }),
      });
    }

    this.stream = stream;

    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: options.quality === '1080p' ? 8_000_000 : 2_500_000 });

    recorder.ondataavailable = async (event) => {
      if (event.data && event.data.size > 0) {
        try {
          await appendChunk(this.currentRecordingId, this.chunkIndex++, event.data);
          this.onChunk?.(this.chunkIndex - 1);
        } catch (err) {
          this.onError?.(err instanceof Error ? err : new Error('Chunk write failed'));
        }
      }
    };

    recorder.onerror = () => {
      this.setState('error');
      this.onError?.(new Error('MediaRecorder error'));
    };

    this.mediaRecorder = recorder;
    this.startTime = Date.now();

    recorder.start(CHUNK_INTERVAL_MS);
    this.setState('recording');

    return { isSafariMode };
  }

  async stop(): Promise<RecordingResult> {
    if (!this.mediaRecorder || this.state !== 'recording') {
      throw new Error('No active recording');
    }

    this.setState('stopping');
    const durationMs = Date.now() - this.startTime;

    return new Promise((resolve, reject) => {
      this.mediaRecorder!.onstop = async () => {
        this.stream?.getTracks().forEach((t) => t.stop());
        this.stream = null;

        try {
          const chunkCount = await getChunkCount(this.currentRecordingId);
          this.setState('idle');
          resolve({
            recordingId: this.currentRecordingId,
            mimeType: this.currentMimeType,
            extension: this.currentExtension,
            chunkCount,
            durationMs,
          });
        } catch (err) {
          reject(err);
        }
      };

      // Son chunk'ı da al
      this.mediaRecorder!.requestData();
      this.mediaRecorder!.stop();
    });
  }

  cancel() {
    if (this.mediaRecorder && this.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.mediaRecorder = null;
    this.setState('idle');
  }

  on(event: 'stateChange', cb: StateChangeCallback): void;
  on(event: 'chunk', cb: ChunkCallback): void;
  on(event: 'error', cb: ErrorCallback): void;
  on(event: string, cb: unknown): void {
    if (event === 'stateChange') this.onStateChange = cb as StateChangeCallback;
    if (event === 'chunk') this.onChunk = cb as ChunkCallback;
    if (event === 'error') this.onError = cb as ErrorCallback;
  }
}

// Singleton — yalnızca 1 kayıt aynı anda
export const recordingService = new RecordingService();
