'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const COOKIE_CONSENT_KEY = 'deepslide_cookie_consent';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const t = setTimeout(() => setShow(true), 0);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t shadow-lg">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-3">
        <p className="text-sm text-muted-foreground flex-1">
          DeepSlide, hizmet kalitesini artirmak icin gerekli cerezleri kullanir.
          Detaylar icin{' '}
          <Link href="/privacy" className="underline text-primary">
            Gizlilik Politikasi
          </Link>
          &apos;ni inceleyin.
        </p>
        <Button size="sm" onClick={accept}>
          Kabul Et
        </Button>
      </div>
    </div>
  );
}
