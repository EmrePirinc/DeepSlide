import { getDB } from '@/lib/db/index';

export type LogType =
  | 'image_upload'
  | 'ai_analysis'
  | 'keyword_edit'
  | 'speech_transcript'
  | 'keyword_match'
  | 'presentation_start'
  | 'presentation_end'
  | 'error';

export interface LogEntry {
  timestamp: number;
  type: LogType;
  data: unknown;
}

export async function log(type: LogType, data: unknown): Promise<void> {
  try {
    const db = await getDB();
    await db.put('logs', {
      timestamp: Date.now(),
      type,
      data,
    });
  } catch {
    // Loglama hatası uygulamayı durdurmamali
    console.warn('Log write failed:', type);
  }
}

export async function exportLogs(): Promise<LogEntry[]> {
  const db = await getDB();
  const logs = await db.getAll('logs');
  return logs as LogEntry[];
}

export async function clearLogs(): Promise<void> {
  const db = await getDB();
  await db.clear('logs');
}
