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
    if (!configured) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ user: null, isLoading: false, isPremium: false, profile: DEFAULT_PROFILE });
        return;
      }

      // User'ı önce set et — Firestore profil okuması başarısız olsa da auth çalışsın
      setState({ user, isLoading: false, isPremium: false, profile: DEFAULT_PROFILE });

      try {
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
        }

        setState((prev) => ({
          ...prev,
          isPremium: profileData.plan === 'pro',
          profile: profileData,
        }));
      } catch {
        /* ignore — DEFAULT_PROFILE ile devam */
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
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await ensureGoogleProfile(result.user);
    } catch (err) {
      const code = (err as { code?: string })?.code ?? '';
      // Popup engellenirse redirect'e fallback
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/operation-not-supported-in-this-environment'
      ) {
        await signInWithRedirect(auth, provider);
        return;
      }
      throw err;
    }
  }, [ensureGoogleProfile]);

  // Redirect dönüşünü yakala (popup engellenip fallback olduysa)
  useEffect(() => {
    if (!configured) return;
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          ensureGoogleProfile(result.user).catch(() => {/* ignore */});
        } else if (typeof window !== 'undefined') {
          // Stale pendingRedirect key'i temizle
          Object.keys(sessionStorage)
            .filter((k) => k.startsWith('firebase:pendingRedirect'))
            .forEach((k) => sessionStorage.removeItem(k));
        }
      })
      .catch(() => {/* ignore */});
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
