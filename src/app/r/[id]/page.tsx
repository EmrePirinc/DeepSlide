// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { notFound } from 'next/navigation';
import { getAdminFirestore } from '@/lib/firebase/admin';

interface RecordingData {
  recordingId: string;
  signedUrl: string;
  expiresAt: string;
  mimeType: string;
  ownerId: string;
}

async function getRecording(shareKey: string): Promise<RecordingData | null> {
  const db = getAdminFirestore();
  const snap = await db
    .collection('recordings')
    .where('shareKey', '==', shareKey)
    .limit(1)
    .get();

  if (snap.empty) return null;

  const data = snap.docs[0].data() as RecordingData & { expiresAt: string };

  // TTL kontrolü
  if (new Date(data.expiresAt).getTime() < Date.now()) return null;

  return data;
}

export default async function RecordingPortalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recording = await getRecording(id);

  if (!recording) return notFound();

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 gap-6">
      <div className="w-full max-w-4xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">DeepSlide Sunumu</h1>
          <span className="text-xs text-white/30">
            {new Date(recording.expiresAt).toLocaleDateString('tr-TR')}&apos;e kadar erişilebilir
          </span>
        </div>

        <div className="rounded-2xl overflow-hidden bg-black aspect-video">
          {recording.mimeType.startsWith('video/') ? (
            <video
              src={recording.signedUrl}
              controls
              className="w-full h-full"
              preload="metadata"
            >
              Tarayıcınız video oynatmayı desteklemiyor.
            </video>
          ) : (
            <audio
              src={recording.signedUrl}
              controls
              className="w-full mt-8"
            >
              Tarayıcınız ses oynatmayı desteklemiyor.
            </audio>
          )}
        </div>

        <div className="mt-4 flex gap-3">
          <a
            href={recording.signedUrl}
            download
            className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition"
          >
            İndir
          </a>
        </div>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Sunum — DeepSlide`,
    description: `DeepSlide paylaşım linki: ${id}`,
  };
}
