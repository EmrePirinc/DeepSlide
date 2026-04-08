'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { use } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/card';

export default function AnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // TODO: Supabase'den session verilerini çek
  // Şimdilik placeholder

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Sunum Analitik</h1>
        <p className="text-muted-foreground">Sunum ID: {id}</p>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold">—</p>
            <p className="text-sm text-muted-foreground">Toplam Süre</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold">—</p>
            <p className="text-sm text-muted-foreground">Gösterilen Slayt</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold">—</p>
            <p className="text-sm text-muted-foreground">Keyword Eşleşme</p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="font-semibold mb-4">Slayt Başına Süre</h2>
          <p className="text-muted-foreground text-sm">
            Sunum yapıldıktan sonra burada slayt başına süre grafiği gösterilecek.
            Premium özellik.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
