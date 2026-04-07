'use client';

/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { getImageBlob } from '@/lib/db/images';

/**
 * Görselin orijinal blob'unu IndexedDB'den yükler ve object URL oluşturur.
 * Aktif olan görsellerde bulanıklığı önlemek için tam çözünürlük sağlar.
 */
export function useFullImage(blobKey: string | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blobKey) {
      setUrl(null);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    getImageBlob(blobKey).then((blob) => {
      if (cancelled) return;
      if (blob) {
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      }
    });

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [blobKey]);

  return url;
}
