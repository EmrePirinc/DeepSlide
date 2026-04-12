'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { use, useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/card';
import { usePresentationStore } from '@/stores/presentationStore';
import { computeStats } from '@/lib/db/analytics';
import type { PresentationStats } from '@/types/analytics';

function fmtMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  if (m > 0) return `${m}d ${s % 60}s`;
  return `${s}s`;
}

function BarChart({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1.5 h-28">
      {values.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <span className="text-[9px] text-muted-foreground">{fmtMs(v)}</span>
          <div
            className="w-full rounded-sm bg-primary/70 transition-all"
            style={{ height: `${Math.max(4, Math.round((v / max) * 80))}px` }}
          />
          <span className="text-[9px] text-muted-foreground truncate w-full text-center">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { currentPresentation, loadPresentation } = usePresentationStore();
  const [stats, setStats] = useState<PresentationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPresentation(id);
  }, [id, loadPresentation]);

  useEffect(() => {
    computeStats(id).then((s) => {
      setStats(s);
      setLoading(false);
    });
  }, [id]);

  const slideLabels = (stats?.slideStats ?? []).map((ss) => {
    const img = currentPresentation?.images.find((i) => i.id === ss.slideId);
    return img ? (img.keywords[0]?.text ?? `#${currentPresentation!.images.indexOf(img) + 1}`) : ss.slideId.slice(-4);
  });

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Sunum Analitik</h1>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[1,2,3].map(i => <Card key={i} className="p-4 h-24 animate-pulse bg-muted" />)}
          </div>
        ) : !stats ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-sm">Henüz sunum verisi yok.</p>
            <p className="text-muted-foreground text-xs mt-1">Sunumu tamamladıktan sonra buraya analitik verileri gelir.</p>
          </Card>
        ) : (
          <>
            {/* Summary KPIs */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold">{stats.sessionCount}</p>
                <p className="text-sm text-muted-foreground">Oturum</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold">{fmtMs(stats.avgDurationMs)}</p>
                <p className="text-sm text-muted-foreground">Ort. Süre</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold">{fmtMs(stats.totalDurationMs)}</p>
                <p className="text-sm text-muted-foreground">Toplam Süre</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold">{Math.round(stats.avgMatchRate * 100)}%</p>
                <p className="text-sm text-muted-foreground">Ort. Eşleşme</p>
              </Card>
            </div>

            {/* Per-slide time chart */}
            {stats.slideStats.length > 0 && (
              <Card className="p-6">
                <h2 className="font-semibold mb-4">Slayt Başına Ortalama Süre</h2>
                <BarChart
                  values={stats.slideStats.map((s) => s.avgTimeMs)}
                  labels={slideLabels}
                />
              </Card>
            )}

            {/* Per-slide table */}
            {stats.slideStats.length > 0 && (
              <Card className="p-6">
                <h2 className="font-semibold mb-4">Slayt Detayları</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground text-left border-b">
                        <th className="pb-2 font-medium">#</th>
                        <th className="pb-2 font-medium">Anahtar Kelime</th>
                        <th className="pb-2 font-medium text-right">Ort. Süre</th>
                        <th className="pb-2 font-medium text-right">Ziyaret</th>
                        <th className="pb-2 font-medium text-right">Eşleşme</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.slideStats.map((ss, i) => {
                        const img = currentPresentation?.images.find((img) => img.id === ss.slideId);
                        const idx = img ? currentPresentation!.images.indexOf(img) + 1 : '—';
                        return (
                          <tr key={ss.slideId} className="border-b last:border-0">
                            <td className="py-2 text-muted-foreground">{idx}</td>
                            <td className="py-2">{slideLabels[i]}</td>
                            <td className="py-2 text-right tabular-nums">{fmtMs(ss.avgTimeMs)}</td>
                            <td className="py-2 text-right tabular-nums">{ss.totalVisits}</td>
                            <td className="py-2 text-right tabular-nums">{ss.avgMatchCount.toFixed(1)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
