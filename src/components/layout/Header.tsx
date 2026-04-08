'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { UserMenu } from './UserMenu';
import { PlanBadge } from '@/components/billing/PlanBadge';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-14 items-center justify-between px-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            DS
          </div>
          <span className="text-lg font-semibold tracking-tight">DeepSlide</span>
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <PlanBadge />
              <Link href="/presentation/new">
                <Button size="sm" className="rounded-full px-4">
                  + Yeni Sunum
                </Button>
              </Link>
              <UserMenu />
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Giriş Yap</Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="rounded-full px-4">Kayıt Ol</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
