'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { useAuth } from '@/hooks/useAuth';
import { AuthDebugPanel } from '@/components/debug/AuthDebugPanel';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-on-surface-variant">Yükleniyor...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/';
  const { user, signInWithGoogle, signInWithEmail } = useAuth();

  useEffect(() => {
    console.log('[LOGIN] user değişti:', user?.uid ?? 'null', '→ redirect target:', redirect);
    if (user) {
      console.log('[LOGIN] router.push çağrılıyor:', redirect);
      router.push(redirect);
    }
  }, [user, router, redirect]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmail(email, password);
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş hatası');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    console.log('[LOGIN] handleGoogleLogin tıklandı');
    try {
      await signInWithGoogle();
      console.log('[LOGIN] signInWithGoogle resolved (redirect olduysa burası çalışmaz)');
      router.push(redirect);
    } catch (err) {
      console.error('[LOGIN] handleGoogleLogin HATASI:', err);
      setError(err instanceof Error ? err.message : 'Google giriş hatası');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <AuthDebugPanel />
      <div className="w-full max-w-md glass-card rounded-2xl border border-white/5 p-8 space-y-6">
        {/* Logo & Title */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-violet-600 text-white font-bold flex items-center justify-center shadow-lg shadow-primary/20">
              DS
            </div>
            <span className="text-2xl font-bold text-white">DeepSlide</span>
          </div>
          <p className="text-on-surface-variant text-sm">Hesabınıza giriş yapın</p>
        </div>

        {/* Google Login */}
        <Button
          variant="outline"
          className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl py-3 transition-all"
          onClick={handleGoogleLogin}
        >
          <MaterialIcon icon="login" size={18} className="mr-2" />
          Google ile Giriş Yap
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/5" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-3 text-on-surface-variant">veya</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 text-sm bg-white/5 border border-white/5 rounded-xl outline-none focus:ring-2 ring-primary/50 text-white placeholder:text-on-surface-variant/50 transition-all"
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 text-sm bg-white/5 border border-white/5 rounded-xl outline-none focus:ring-2 ring-primary/50 text-white placeholder:text-on-surface-variant/50 transition-all"
          />

          {error && (
            <p className="text-sm text-rose-400">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary-container text-white font-bold rounded-xl py-3 shadow-xl shadow-primary/20 active:scale-95 transition-all"
            disabled={loading}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
        </form>

        <p className="text-center text-sm text-on-surface-variant">
          Hesabınız yok mu?{' '}
          <Link href="/auth/signup" className="text-primary hover:text-secondary transition-colors font-medium">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}
