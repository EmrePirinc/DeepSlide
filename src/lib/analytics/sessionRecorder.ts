export interface SessionEvent {
  type: 'focus' | 'unfocus' | 'keyword_match' | 'nav_arrow' | 'nav_click';
  imageId: string;
  keyword?: string;
  timestamp: number;
}

export interface PresentationSession {
  id: string;
  presentationId: string;
  startedAt: number;
  endedAt?: number;
  events: SessionEvent[];
}

export class SessionRecorder {
  private session: PresentationSession;

  constructor(presentationId: string) {
    this.session = {
      id: crypto.randomUUID(),
      presentationId,
      startedAt: Date.now(),
      events: [],
    };
  }

  recordEvent(event: Omit<SessionEvent, 'timestamp'>): void {
    this.session.events.push({
      ...event,
      timestamp: Date.now(),
    });
  }

  endSession(): PresentationSession {
    this.session.endedAt = Date.now();
    return { ...this.session };
  }

  getSession(): PresentationSession {
    return { ...this.session };
  }

  /**
   * Slayt başına toplam süre hesapla (ms)
   */
  getSlideTimings(): Map<string, number> {
    const timings = new Map<string, number>();
    let lastFocusTime: number | null = null;
    let lastImageId: string | null = null;

    for (const event of this.session.events) {
      if (event.type === 'focus') {
        // Önceki focus'u kapat
        if (lastFocusTime && lastImageId) {
          const duration = event.timestamp - lastFocusTime;
          timings.set(lastImageId, (timings.get(lastImageId) ?? 0) + duration);
        }
        lastFocusTime = event.timestamp;
        lastImageId = event.imageId;
      } else if (event.type === 'unfocus') {
        if (lastFocusTime && lastImageId) {
          const duration = event.timestamp - lastFocusTime;
          timings.set(lastImageId, (timings.get(lastImageId) ?? 0) + duration);
        }
        lastFocusTime = null;
        lastImageId = null;
      }
    }

    // Son açık slaytı kapat
    if (lastFocusTime && lastImageId) {
      const endTime = this.session.endedAt ?? Date.now();
      const duration = endTime - lastFocusTime;
      timings.set(lastImageId, (timings.get(lastImageId) ?? 0) + duration);
    }

    return timings;
  }

  /**
   * En çok tetiklenen keyword'ler
   */
  getKeywordStats(): Map<string, number> {
    const stats = new Map<string, number>();
    for (const event of this.session.events) {
      if (event.type === 'keyword_match' && event.keyword) {
        stats.set(event.keyword, (stats.get(event.keyword) ?? 0) + 1);
      }
    }
    return stats;
  }
}
