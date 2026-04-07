'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
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
          <Link href="/presentation/new">
            <Button size="sm">Yeni Sunum</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
