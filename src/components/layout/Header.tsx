'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, isPremium } = useAuth();

  return (
    <header className="border-b bg-background">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            DS
          </div>
          <span className="text-lg font-semibold">DeepSlide</span>
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/billing">
                <span className={`text-xs px-2 py-1 rounded-full ${isPremium ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {isPremium ? 'Pro' : 'Free'}
                </span>
              </Link>
              <Link href="/presentation/new">
                <Button size="sm">Yeni Sunum</Button>
              </Link>
              <Link href="/profile">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  {user.email?.[0]?.toUpperCase() ?? 'U'}
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="outline" size="sm">Giriş Yap</Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Kayıt Ol</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
