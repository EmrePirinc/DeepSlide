'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BrowserCheck } from '@/components/layout/BrowserCheck';
import { usePresentationStore } from '@/stores/presentationStore';

export default function DashboardPage() {
  const { presentations, loadPresentations, isLoading } =
    usePresentationStore();

  useEffect(() => {
    loadPresentations();
  }, [loadPresentations]);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <BrowserCheck />
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">DeepSlide</h1>
            <p className="text-muted-foreground mt-1">
              Siz konuşun, sunumunuz sizi takip etsin.
            </p>
          </div>
          <Link href="/presentation/new">
            <Button size="lg">+ Yeni Sunum</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-48 animate-pulse bg-muted" />
            ))}
          </div>
        ) : presentations.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <div className="text-6xl mb-4">🎤</div>
            <h2 className="text-xl font-semibold mb-2">
              Henüz sunum oluşturmadınız
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Görsellerinizi yükleyin, AI anahtar kelimelerinizi çıkarsın.
              Sunum sırasında sadece konuşarak görsellerinizi kontrol edin.
            </p>
            <Link href="/presentation/new">
              <Button>İlk Sunumu Oluştur</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presentations.map((p) => (
              <Link key={p.id} href={`/presentation/${p.id}`}>
                <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer h-48 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold truncate">{p.title}</h3>
                    {p.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {p.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{p.images.length} görsel</span>
                    <span>
                      {new Date(p.updatedAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
