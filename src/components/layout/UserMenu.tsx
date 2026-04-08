'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function UserMenu() {
  const { user, isPremium, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  const initials = (user.displayName ?? user.email ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const displayName = user.displayName ?? user.email?.split('@')[0] ?? 'Kullanıcı';

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar butonu */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full p-1 hover:bg-muted transition-colors"
      >
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt={displayName}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
            {initials}
          </div>
        )}
      </button>

      {/* Dropdown menü */}
      {open && (
        <div className="absolute right-0 top-12 w-72 rounded-lg border bg-background shadow-lg z-50 overflow-hidden">
          {/* Kullanıcı bilgisi */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                isPremium
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {isPremium ? 'PRO' : 'FREE'}
              </span>
            </div>
          </div>

          {/* Menü öğeleri */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
            >
              <span className="w-5 text-center text-muted-foreground">👤</span>
              Profil Ayarları
            </Link>
            <Link
              href="/billing"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
            >
              <span className="w-5 text-center text-muted-foreground">💳</span>
              Plan & Faturalama
            </Link>
          </div>

          {/* Çıkış */}
          <div className="border-t py-1">
            <button
              onClick={() => {
                signOut();
                setOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left hover:bg-muted transition-colors text-destructive"
            >
              <span className="w-5 text-center">🚪</span>
              Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
