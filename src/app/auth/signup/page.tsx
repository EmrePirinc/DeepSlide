'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function SignUpPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signUp(email, password, name);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt hatası');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center space-y-4">
          <h2 className="text-xl font-bold">E-posta Doğrulama</h2>
          <p className="text-muted-foreground">
            {email} adresine doğrulama linki gönderdik. Lütfen e-postanızı kontrol edin.
          </p>
          <Link href="/auth/login">
            <Button variant="outline">Giriş Sayfasına Dön</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">DeepSlide&apos;a Katılın</h1>
          <p className="text-muted-foreground">Ücretsiz hesap oluşturun</p>
        </div>

        <Button variant="outline" className="w-full" onClick={() => signInWithGoogle()}>
          Google ile Kayıt Ol
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">veya</span>
          </div>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <Input placeholder="Ad Soyad" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input type="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Şifre (min 6 karakter)" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Zaten hesabınız var mı?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            Giriş Yap
          </Link>
        </p>
      </Card>
    </div>
  );
}
