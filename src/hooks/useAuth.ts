'use client';

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
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase/config';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isPremium: boolean;
}

export function useAuth() {
  const configured = isFirebaseConfigured();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: configured,
    isPremium: false,
  });

  useEffect(() => {
    if (!configured) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      let isPremium = false;
      if (user) {
        try {
          const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
          isPremium = profileDoc.data()?.plan === 'pro';
        } catch {
          // Firestore henüz yapılandırılmamış
        }
      }
      setState({ user, isLoading: false, isPremium });
    });

    return () => unsubscribe();
  }, []);

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
      createdAt: new Date().toISOString(),
    });
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  return { ...state, signInWithGoogle, signInWithEmail, signUp, signOut };
}
