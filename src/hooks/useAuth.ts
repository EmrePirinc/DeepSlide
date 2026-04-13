'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase/config';
import { TRIAL_PRESENTATIONS } from '@/lib/billing/plans';

export interface UserProfile {
  plan: 'free' | 'pro';
  trialRemaining: number;
  monthlyPresentationsUsed: number;
  monthlyResetDate: string;
  iyzicoSubscriptionRef?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'none';
  currentPeriodEnd?: string;
}

const DEFAULT_PROFILE: UserProfile = {
  plan: 'free',
  trialRemaining: TRIAL_PRESENTATIONS,
  monthlyPresentationsUsed: 0,
  monthlyResetDate: getMonthlyResetDate(),
  subscriptionStatus: 'none',
};

function getMonthlyResetDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isPremium: boolean;
  profile: UserProfile;
}

export function useAuth() {
  const configured = isFirebaseConfigured();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: configured,
    isPremium: false,
    profile: DEFAULT_PROFILE,
  });

  const resetMonthlyCounterIfNeeded = useCallback(async (
    uid: string,
    profileData: UserProfile,
  ): Promise<UserProfile> => {
    const currentMonth = getMonthlyResetDate();
    if (profileData.monthlyResetDate !== currentMonth) {
      const updated = {
        ...profileData,
        monthlyPresentationsUsed: 0,
        monthlyResetDate: currentMonth,
      };
      await updateDoc(doc(db, 'profiles', uid), {
        monthlyPresentationsUsed: 0,
        monthlyResetDate: currentMonth,
      });
      return updated;
    }
    return profileData;
  }, []);

  useEffect(() => {
    console.log('[AUTH] useAuth mount — configured:', configured);
    console.log('[AUTH] auth.currentUser at mount:', auth?.currentUser?.uid ?? 'null');
    console.log('[AUTH] auth.app.options:', JSON.stringify({
      authDomain: auth?.app?.options?.authDomain,
      projectId: auth?.app?.options?.projectId,
    }));
    if (typeof window !== 'undefined') {
      const pendingKeys = Object.keys(sessionStorage).filter((k) => k.includes('firebase'));
      console.log('[AUTH] sessionStorage firebase keys:', pendingKeys.join(', ') || 'yok');
    }
    if (!configured) {
      console.warn('[AUTH] Firebase NOT configured — env vars eksik');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('[AUTH] onAuthStateChanged fired — user:', user?.uid ?? 'null', user?.email ?? '');
      if (!user) {
        setState({ user: null, isLoading: false, isPremium: false, profile: DEFAULT_PROFILE });
        return;
      }

      // 1) User'ı HEMEN set et — login sayfasının redirect'i bloklanmasın
      console.log('[AUTH] User state hemen set ediliyor (profil sonra yüklenecek)');
      setState({ user, isLoading: false, isPremium: false, profile: DEFAULT_PROFILE });

      // 2) Profil arka planda yüklensin — başarısız olsa da auth çalışır
      try {
        console.log('[AUTH] Profil okunuyor (background):', user.uid);
        const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
        let profileData: UserProfile = DEFAULT_PROFILE;

        if (profileDoc.exists()) {
          const data = profileDoc.data();
          profileData = {
            plan: data.plan ?? 'free',
            trialRemaining: data.trialRemaining ?? 0,
            monthlyPresentationsUsed: data.monthlyPresentationsUsed ?? 0,
            monthlyResetDate: data.monthlyResetDate ?? getMonthlyResetDate(),
            iyzicoSubscriptionRef: data.iyzicoSubscriptionRef,
            subscriptionStatus: data.subscriptionStatus ?? 'none',
            currentPeriodEnd: data.currentPeriodEnd,
          };
          profileData = await resetMonthlyCounterIfNeeded(user.uid, profileData);
        } else {
          console.warn('[AUTH] Profil dokümanı yok — DEFAULT kullanılıyor');
        }

        console.log('[AUTH] Profil OK, state güncelleniyor — plan:', profileData.plan);
        setState((prev) => ({
          ...prev,
          isPremium: profileData.plan === 'pro',
          profile: profileData,
        }));
      } catch (err) {
        console.error('[AUTH] Profil okuma hatası (auth yine de çalışır):', err);
      }
    });

    return () => unsubscribe();
  }, [configured, resetMonthlyCounterIfNeeded]);

  const ensureGoogleProfile = useCallback(async (user: User) => {
    const profileRef = doc(db, 'profiles', user.uid);
    const profileDoc = await getDoc(profileRef);
    if (!profileDoc.exists()) {
      await setDoc(profileRef, {
        name: user.displayName ?? '',
        email: user.email,
        plan: 'free',
        trialRemaining: TRIAL_PRESENTATIONS,
        monthlyPresentationsUsed: 0,
        monthlyResetDate: getMonthlyResetDate(),
        subscriptionStatus: 'none',
        createdAt: new Date().toISOString(),
      });
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    console.log('[AUTH] signInWithGoogle çağrıldı — popup açılıyor');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('[AUTH] signInWithPopup OK — uid:', result.user.uid);
      await ensureGoogleProfile(result.user);
      console.log('[AUTH] ensureGoogleProfile OK');
    } catch (err) {
      const code = (err as { code?: string })?.code ?? '';
      console.error('[AUTH] signInWithPopup HATASI:', code, err);
      // Popup engellenirse veya COOP altında çalışmazsa redirect'e fallback
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/operation-not-supported-in-this-environment'
      ) {
        console.warn('[AUTH] Popup başarısız → redirect fallback');
        await signInWithRedirect(auth, provider);
        return;
      }
      throw err;
    }
  }, [ensureGoogleProfile]);

  // Redirect dönüşünü yakala
  useEffect(() => {
    if (!configured) return;
    console.log('[AUTH] getRedirectResult kontrolü başladı');
    getRedirectResult(auth)
      .then((result) => {
        console.log('[AUTH] getRedirectResult sonuç:', result?.user?.uid ?? 'null');
        if (result?.user) {
          ensureGoogleProfile(result.user)
            .then(() => console.log('[AUTH] Profil oluşturma OK'))
            .catch((err) => console.error('[AUTH] Profil oluşturma hatası:', err));
        } else {
          // Stale pendingRedirect key'i temizle — eski başarısız redirect denemeleri popup'ı bozmasın
          if (typeof window !== 'undefined') {
            const stale = Object.keys(sessionStorage).filter((k) => k.startsWith('firebase:pendingRedirect'));
            if (stale.length > 0) {
              console.warn('[AUTH] Stale pendingRedirect key temizleniyor:', stale.join(','));
              stale.forEach((k) => sessionStorage.removeItem(k));
            }
          }
        }
      })
      .catch((err) => console.error('[AUTH] getRedirectResult hatası:', err));
  }, [configured, ensureGoogleProfile]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    await setDoc(doc(db, 'profiles', result.user.uid), {
      name,
      email,
      plan: 'free',
      trialRemaining: TRIAL_PRESENTATIONS,
      monthlyPresentationsUsed: 0,
      monthlyResetDate: getMonthlyResetDate(),
      subscriptionStatus: 'none',
      createdAt: new Date().toISOString(),
    });
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const decrementTrial = useCallback(async () => {
    if (!state.user || state.profile.trialRemaining <= 0) return;
    const newRemaining = state.profile.trialRemaining - 1;
    await updateDoc(doc(db, 'profiles', state.user.uid), {
      trialRemaining: newRemaining,
    });
    setState(prev => ({
      ...prev,
      profile: { ...prev.profile, trialRemaining: newRemaining },
    }));
  }, [state.user, state.profile.trialRemaining]);

  const incrementMonthlyUsage = useCallback(async () => {
    if (!state.user || state.isPremium) return;
    const newCount = state.profile.monthlyPresentationsUsed + 1;
    await updateDoc(doc(db, 'profiles', state.user.uid), {
      monthlyPresentationsUsed: newCount,
    });
    setState(prev => ({
      ...prev,
      profile: { ...prev.profile, monthlyPresentationsUsed: newCount },
    }));
  }, [state.user, state.isPremium, state.profile.monthlyPresentationsUsed]);

  return {
    ...state,
    signInWithGoogle,
    signInWithEmail,
    signUp,
    signOut,
    decrementTrial,
    incrementMonthlyUsage,
  };
}
