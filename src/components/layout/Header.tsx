'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { useAuth } from '@/hooks/useAuth';
import { UserMenu } from './UserMenu';
import { PlanBadge } from '@/components/billing/PlanBadge';
import { usePresentationStore } from '@/stores/presentationStore';

export function Header() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { currentPresentation } = usePresentationStore();

  const isEditor = pathname.startsWith('/presentation/') && !pathname.includes('/present');
  const presentationTitle = currentPresentation?.title;

  return (
    <header className="h-16 bg-surface/40 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between px-8">
        {/* Left — Logo + Breadcrumb */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-black text-sm">DS</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">DeepSlide</span>
          </Link>

          {/* Breadcrumb — sadece editor'da */}
          {isEditor && (
            <nav className="flex items-center text-sm gap-3">
              <Link href="/" className="text-on-surface-variant hover:text-white transition-colors cursor-pointer font-medium">
                Sunumlarım
              </Link>
              <MaterialIcon icon="chevron_right" size={16} className="text-on-surface-variant" />
              <span className="text-white font-semibold">
                {presentationTitle || 'Sunum'}
              </span>
            </nav>
          )}
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <PlanBadge />

              {/* Icon button group */}
              <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/5">
                <button className="p-2 text-on-surface-variant hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Geçmiş">
                  <MaterialIcon icon="history" size={20} />
                </button>
                <button className="p-2 text-on-surface-variant hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Ayarlar">
                  <MaterialIcon icon="settings" size={20} />
                </button>
              </div>

              <div className="h-6 w-px bg-white/10 mx-1" />

              {/* Paylaş butonu */}
              <button className="px-5 py-2 text-sm font-semibold text-white/90 hover:bg-white/5 transition-colors rounded-xl">
                Paylaş
              </button>

              {/* CTA — context'e göre */}
              {isEditor ? (
                <Link href={currentPresentation ? `/presentation/${currentPresentation.id}/present` : '#'}>
                  <button className="px-6 py-2.5 text-sm font-bold bg-primary hover:bg-primary-container text-white rounded-xl active:scale-95 transition-all shadow-xl shadow-primary/30 flex items-center gap-2">
                    <MaterialIcon icon="play_arrow" size={20} />
                    Sunumu Başlat
                  </button>
                </Link>
              ) : (
                <Link href="/presentation/new">
                  <button className="px-6 py-2.5 text-sm font-bold bg-primary hover:bg-primary-container text-white rounded-xl active:scale-95 transition-all shadow-xl shadow-primary/30 flex items-center gap-2">
                    <MaterialIcon icon="add" size={20} />
                    Yeni Sunum
                  </button>
                </Link>
              )}

              <UserMenu />
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <button className="px-5 py-2 text-sm font-semibold text-white/90 hover:bg-white/5 transition-colors rounded-xl">
                  Giriş Yap
                </button>
              </Link>
              <Link href="/auth/signup">
                <button className="px-6 py-2.5 text-sm font-bold bg-primary hover:bg-primary-container text-white rounded-xl active:scale-95 transition-all shadow-xl shadow-primary/30 flex items-center gap-2">
                  Kayıt Ol
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
