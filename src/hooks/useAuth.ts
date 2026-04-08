'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
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
  stripeCustomerId?: string;
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
            stripeCustomerId: data.stripeCustomerId,
            subscriptionStatus: data.subscriptionStatus ?? 'none',
            currentPeriodEnd: data.currentPeriodEnd,
          };
          profileData = await resetMonthlyCounterIfNeeded(user.uid, profileData);
        }

        setState({
          user,
          isLoading: false,
          isPremium: profileData.plan === 'pro',
          profile: profileData,
        });
      } catch {
        setState({ user, isLoading: false, isPremium: false, profile: DEFAULT_PROFILE });
      }
    });

    return () => unsubscribe();
  }, [configured, resetMonthlyCounterIfNeeded]);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const profileRef = doc(db, 'profiles', result.user.uid);
    const profileDoc = await getDoc(profileRef);
    if (!profileDoc.exists()) {
      await setDoc(profileRef, {
        name: result.user.displayName ?? '',
        email: result.user.email,
        plan: 'free',
        trialRemaining: TRIAL_PRESENTATIONS,
        monthlyPresentationsUsed: 0,
        monthlyResetDate: getMonthlyResetDate(),
        subscriptionStatus: 'none',
        createdAt: new Date().toISOString(),
      });
    }
  }, []);

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
