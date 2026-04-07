'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const { user, isPremium, signOut } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from('profiles').upsert({
      id: user.id,
      name,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Profil</h1>

        <Card className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">E-posta</label>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>

          <div>
            <label className="text-sm font-medium">Ad Soyad</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium">Plan</label>
            <p className={isPremium ? 'text-primary font-semibold' : 'text-muted-foreground'}>
              {isPremium ? 'Premium' : 'Ücretsiz'}
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Kaydediliyor...' : saved ? 'Kaydedildi!' : 'Kaydet'}
            </Button>
            <Button variant="outline" onClick={signOut}>
              Çıkış Yap
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
