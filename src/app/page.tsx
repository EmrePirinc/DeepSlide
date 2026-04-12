'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { BrowserCheck } from '@/components/layout/BrowserCheck';
import { Skeleton } from '@/components/ui/skeleton';
import { PresentationCard } from '@/components/cards/PresentationCard';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { usePresentationStore } from '@/stores/presentationStore';
import { useFolderStore } from '@/stores/folderStore';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { movePresentationToFolder } from '@/lib/db/folders';

export default function DashboardPage() {
  const router = useRouter();
  const { presentations, loadPresentations, isLoading, deletePresentation, clonePresentation } =
    usePresentationStore();
  const { folders, activeFolderId } = useFolderStore();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { shouldShow: onboardingShouldShow, markCompleted } = useOnboarding(
    user?.uid,
    presentations.length,
  );

  useEffect(() => {
    loadPresentations();
  }, [loadPresentations]);

  useEffect(() => {
    if (!isLoading && onboardingShouldShow) {
      const t = setTimeout(() => setShowOnboarding(true), 500);
      return () => clearTimeout(t);
    }
  }, [isLoading, onboardingShouldShow]);

  useEffect(() => {
    const handler = () => loadPresentations();
    window.addEventListener('deepslide:presentationMoved', handler);
    return () => window.removeEventListener('deepslide:presentationMoved', handler);
  }, [loadPresentations]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const filtered = useMemo(() => {
    let list = presentations;
    if (activeFolderId !== null) {
      list = list.filter((p) => p.folderId === activeFolderId);
    }
    if (debouncedQuery.length >= 2) {
      const q = debouncedQuery.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }
    return list;
  }, [presentations, activeFolderId, debouncedQuery]);

  const handleShare = useCallback((id: string) => {
    const url = `${window.location.origin}/presentation/${id}/present`;
    navigator.clipboard.writeText(url).catch(() => {});
  }, []);

  const handleMoveToFolder = useCallback(async (presentationId: string, folderId: string | null) => {
    await movePresentationToFolder(presentationId, folderId);
    loadPresentations();
  }, [loadPresentations]);

  const handleOnboardingComplete = () => {
    markCompleted();
    setShowOnboarding(false);
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-8">
        <BrowserCheck />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              {activeFolderId
                ? (folders.find((f) => f.id === activeFolderId)?.name ?? 'Klasör')
                : 'Sunumlarım'}
            </h1>
            <p className="text-on-surface-variant text-sm mt-1 font-medium">
              {filtered.length} sunum
            </p>
          </div>
          <Link href="/presentation/new">
            <Button className="bg-primary hover:bg-primary-container text-white font-bold rounded-xl px-6 py-2.5 shadow-xl shadow-primary/20 active:scale-95 transition-all">
              <MaterialIcon icon="add" size={18} className="mr-1" />
              Yeni Sunum
            </Button>
          </Link>
        </div>

        {/* Search bar */}
        <div className="relative mb-8">
          <MaterialIcon icon="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sunum ara…"
            className="w-full pl-11 pr-4 py-3 text-sm bg-white/5 border border-white/5 rounded-xl outline-none focus:ring-2 ring-primary/50 transition-all text-white placeholder:text-on-surface-variant/50"
          />
        </div>

        {/* Presentations grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden">
                <Skeleton className="aspect-video w-full bg-white/5" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-4 w-3/4 bg-white/5" />
                  <Skeleton className="h-3 w-1/2 bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : presentations.length === 0 ? (
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-primary/10 via-surface/40 to-violet-500/10 p-16 text-center backdrop-blur-xl">
            {/* Dekoratif gradient orb'lar */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="relative flex flex-col items-center">
              {/* İkon + pulse halkalar */}
              <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
                <span className="absolute inset-2 animate-pulse rounded-full bg-primary/20" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-600 shadow-2xl shadow-primary/40">
                  <MaterialIcon icon="slideshow" size={40} className="text-white" />
                </div>
              </div>

              <h2 className="mb-3 bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl font-black tracking-tight text-transparent">
                İlk sunumunu oluştur
              </h2>
              <p className="mb-10 max-w-md text-[15px] leading-relaxed text-on-surface-variant">
                Görsellerini yükle, AI anahtar kelimelerini çıkarsın.
                Sunum sırasında sadece{' '}
                <span className="font-semibold text-primary">konuşarak</span> slaytlarını kontrol et.
              </p>

              <Link href="/presentation/new" className="group relative inline-flex">
                {/* Kalp atışı halka efekti */}
                <span className="absolute inset-0 animate-ping rounded-2xl bg-primary/40 opacity-75" />
                <span className="absolute inset-0 animate-pulse rounded-2xl bg-primary/20" />
                <Button className="relative flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-violet-600 px-10 py-6 text-base font-bold text-white shadow-2xl shadow-primary/50 transition-all hover:scale-105 hover:shadow-primary/70 active:scale-95">
                  <MaterialIcon icon="add_circle" size={20} className="text-white" />
                  İlk Sunumu Oluştur
                  <MaterialIcon icon="arrow_forward" size={20} className="text-white transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>

              {/* Mini feature highlights */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/70">
                <div className="flex items-center gap-2">
                  <MaterialIcon icon="auto_awesome" size={14} className="text-primary" />
                  AI Destekli
                </div>
                <div className="h-1 w-1 rounded-full bg-white/20" />
                <div className="flex items-center gap-2">
                  <MaterialIcon icon="mic" size={14} className="text-primary" />
                  Sesle Kontrol
                </div>
                <div className="h-1 w-1 rounded-full bg-white/20" />
                <div className="flex items-center gap-2">
                  <MaterialIcon icon="bolt" size={14} className="text-primary" />
                  Saniyeler İçinde
                </div>
              </div>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <MaterialIcon icon="search_off" size={48} className="text-on-surface-variant/40 mx-auto mb-4" />
            <p className="text-sm text-on-surface-variant font-medium">Sunum bulunamadı</p>
            {debouncedQuery && (
              <p className="text-xs mt-2 text-on-surface-variant/60">&ldquo;{debouncedQuery}&rdquo; için sonuç yok</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((p) => (
              <PresentationCard
                key={p.id}
                id={p.id}
                title={p.title}
                imageCount={p.images.length}
                updatedAt={p.updatedAt}
                thumbnailUrl={p.images[0]?.thumbnailDataUrl}
                folderId={p.folderId}
                searchQuery={debouncedQuery}
                folders={folders}
                onEdit={(id) => router.push(`/presentation/${id}`)}
                onShare={handleShare}
                onClone={clonePresentation}
                onDelete={deletePresentation}
                onMoveToFolder={handleMoveToFolder}
              />
            ))}
          </div>
        )}
      </div>

      {showOnboarding && (
        <OnboardingModal
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingComplete}
        />
      )}
    </AppShell>
  );
}
