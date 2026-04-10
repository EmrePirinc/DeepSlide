// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';
import type { Storage } from 'firebase-admin/storage';

function initAdmin(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0]!;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET ?? `${projectId}.firebasestorage.app`;

  // 1. Öncelik: Service account key (production ideal)
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (clientEmail && privateKey) {
    return admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      storageBucket,
    });
  }

  // 2. Öncelik: OAuth 2.0 Refresh Token (org policy kısıtlaması varken)
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (clientId && clientSecret && refreshToken) {
    return admin.initializeApp({
      credential: admin.credential.refreshToken({
        type: 'authorized_user',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
      projectId,
      storageBucket,
    });
  }

  // 3. Öncelik: ADC (gcloud auth application-default login)
  return admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId,
    storageBucket,
  });
}

export function getAdminApp(): admin.app.App {
  return initAdmin();
}

export function getAdminAuth(): Auth {
  return getAdminApp().auth();
}

export function getAdminFirestore(): Firestore {
  return getAdminApp().firestore();
}

export function getAdminStorage(): Storage {
  return getAdminApp().storage();
}
