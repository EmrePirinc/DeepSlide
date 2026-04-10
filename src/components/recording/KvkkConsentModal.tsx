// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useTranscriptStore } from '@/stores/transcriptStore';

interface KvkkConsentModalProps {
  feature: string;
  onAccept: () => void;
  onDeny: () => void;
}

export function KvkkConsentModal({ feature, onAccept, onDeny }: KvkkConsentModalProps) {
  const { setKvkkConsent } = useTranscriptStore();

  const handleAccept = () => {
    setKvkkConsent(true);
    onAccept();
  };

  const handleDeny = () => {
    setKvkkConsent(false);
    onDeny();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 p-6 shadow-2xl flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Veri İşleme Onayı</h2>
          <p className="mt-1 text-xs text-white/40">KVKK / Kişisel Verilerin Korunması</p>
        </div>

        <p className="text-sm text-white/70 leading-relaxed">
          <strong className="text-white">{feature}</strong> özelliğini kullanmak için ses/transkript
          verileriniz Google Gemini / Deepgram gibi bulut servislerine gönderilecektir.
        </p>

        <ul className="flex flex-col gap-1.5 text-xs text-white/50">
          <li>✓ Veriler yalnızca bu oturum için işlenir</li>
          <li>✓ Kalıcı olarak depolanmaz (servis politikasına göre)</li>
          <li>✓ Onayı reddetmeniz halinde özellik devre dışı kalır</li>
        </ul>

        <div className="flex gap-3">
          <button
            onClick={handleDeny}
            className="flex-1 rounded-xl bg-white/10 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/20 transition"
          >
            Reddet
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-400 transition"
          >
            Onaylıyorum
          </button>
        </div>
      </div>
    </div>
  );
}
