// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState, useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import { SummaryModal } from '@/components/summary/SummaryModal';
import { RecipientManager } from '@/components/email/RecipientManager';
import { ClipButton } from '@/components/recording/ClipButton';
import { useTranscriptStore } from '@/stores/transcriptStore';

type Step = 'upload-wait' | 'summary-load' | 'summary-review' | 'email' | 'done';

interface PostPresentationModalProps {
  recordingId: string | null;
  shareUrl: string | null;
  uploadStatus: 'uploading' | 'done' | 'error';
  uploadProgress: number;
  presentationTitle: string;
  isPro: boolean;
  onClose: () => void;
}

interface SummaryData {
  summary: string[];
  actionItems: string[];
}

export function PostPresentationModal({
  recordingId,
  shareUrl,
  uploadStatus,
  uploadProgress,
  presentationTitle,
  isPro,
  onClose,
}: PostPresentationModalProps) {
  const [step, setStep] = useState<Step>(uploadStatus === 'done' ? 'summary-load' : 'upload-wait');
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const { entries, getWordCount, hasKvkkConsent } = useTranscriptStore();

  const loadSummary = useCallback(async () => {
    if (!hasKvkkConsent) {
      setSummaryError('Özet için KVKK onayı gerekiyor.');
      return;
    }
    const wordCount = getWordCount();
    if (wordCount < 100) {
      setSummaryError(`Özet için en az 100 kelime gerekli (mevcut: ${wordCount})`);
      return;
    }

    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const token = await getAuth().currentUser?.getIdToken();
      const res = await fetch('/api/summary/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          transcript: entries,
          slideTimestamps: [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Özet hatası');
      setSummaryData({ summary: data.summary, actionItems: data.actionItems });
      setStep('summary-review');
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : 'Özet alınamadı');
    } finally {
      setSummaryLoading(false);
    }
  }, [hasKvkkConsent, entries, getWordCount]);

  const handleSummaryApprove = useCallback(async (edited: SummaryData) => {
    setSummaryData(edited);
    setStep('email');
  }, []);

  const handleSendEmail = useCallback(async () => {
    if (!summaryData || recipients.length === 0) return;
    setEmailSending(true);
    setEmailError(null);
    try {
      const token = await getAuth().currentUser?.getIdToken();
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          to: recipients,
          summary: summaryData.summary,
          actionItems: summaryData.actionItems,
          shareUrl: shareUrl ? `${window.location.origin}${shareUrl}` : window.location.origin,
          presentationTitle,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'E-posta hatası');
      setEmailSent(true);
      setStep('done');
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'E-posta gönderilemedi');
    } finally {
      setEmailSending(false);
    }
  }, [summaryData, recipients, shareUrl, presentationTitle]);

  // Summary review modalı ayrı göster
  if (step === 'summary-review' && summaryData) {
    return (
      <SummaryModal
        summary={summaryData.summary}
        actionItems={summaryData.actionItems}
        onApprove={handleSummaryApprove}
        onClose={() => setStep('upload-wait')}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-900 p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Sunum Tamamlandı</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 text-2xl leading-none">✕</button>
        </div>

        {/* Upload durumu */}
        <section className="rounded-xl bg-white/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Video Kaydı</span>
            {uploadStatus === 'done' && <span className="text-xs text-green-300">✓ Yüklendi</span>}
            {uploadStatus === 'uploading' && <span className="text-xs text-blue-300">{uploadProgress}%</span>}
            {uploadStatus === 'error' && <span className="text-xs text-red-400">Hata</span>}
          </div>
          {uploadStatus === 'uploading' && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-blue-400 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
          )}
          {uploadStatus === 'done' && shareUrl && (
            <button
              onClick={() => navigator.clipboard.writeText(window.location.origin + shareUrl)}
              className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition"
            >
              📋 Linki Kopyala
            </button>
          )}
        </section>

        {/* AI Özet */}
        <section className="rounded-xl bg-white/5 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">AI Özet</span>
            {!hasKvkkConsent && <span className="text-xs text-yellow-400">KVKK onayı gerekli</span>}
          </div>

          {summaryError && <p className="text-xs text-red-400">{summaryError}</p>}

          {step === 'upload-wait' && uploadStatus !== 'done' && (
            <p className="text-xs text-white/40">Yükleme tamamlanınca özet oluşturabilirsiniz</p>
          )}

          {(step === 'upload-wait' || step === 'summary-load') && uploadStatus === 'done' && !summaryData && (
            <button
              onClick={loadSummary}
              disabled={summaryLoading || !hasKvkkConsent}
              className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-40 transition"
            >
              {summaryLoading ? (
                <><span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />Özet oluşturuluyor…</>
              ) : 'Özet Oluştur'}
            </button>
          )}

          {(step === 'email' || step === 'done') && summaryData && (
            <div className="text-xs text-white/60 space-y-1">
              {summaryData.summary.slice(0, 2).map((s, i) => <p key={i}>• {s}</p>)}
              {summaryData.summary.length > 2 && <p className="text-white/30">…ve {summaryData.summary.length - 2} madde daha</p>}
            </div>
          )}
        </section>

        {/* E-posta */}
        {(step === 'email' || step === 'done') && (
          <section className="rounded-xl bg-white/5 p-4 flex flex-col gap-3">
            <span className="text-sm font-medium text-white">E-posta Gönder</span>
            {!emailSent ? (
              <>
                <RecipientManager onRecipientsChange={setRecipients} />
                {emailError && <p className="text-xs text-red-400">{emailError}</p>}
                <button
                  onClick={handleSendEmail}
                  disabled={emailSending || recipients.length === 0}
                  className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-40 transition"
                >
                  {emailSending ? 'Gönderiliyor…' : `${recipients.length} alıcıya Gönder`}
                </button>
              </>
            ) : (
              <p className="text-sm text-green-300">✓ {recipients.length} alıcıya gönderildi</p>
            )}
          </section>
        )}

        {/* Klip Üretici (Pro) */}
        {isPro && recordingId && uploadStatus === 'done' && (
          <section className="rounded-xl bg-white/5 p-4 flex flex-col gap-3">
            <span className="text-sm font-medium text-white">Sosyal Medya Klibi</span>
            <ClipButton recordingId={recordingId} />
          </section>
        )}

        {/* Viral Rozet — Sosyal Paylaşım */}
        {uploadStatus === 'done' && shareUrl && (
          <section className="rounded-xl bg-white/5 p-4 flex flex-col gap-3">
            <span className="text-sm font-medium text-white">Paylaş</span>
            <div className="flex gap-2 flex-wrap">
              {[
                {
                  label: 'LinkedIn',
                  icon: '💼',
                  color: 'bg-[#0077B5]',
                  url: () => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + shareUrl : shareUrl)}`,
                },
                {
                  label: 'X (Twitter)',
                  icon: '🐦',
                  color: 'bg-black border border-white/20',
                  url: () => `https://x.com/intent/tweet?text=${encodeURIComponent(`DeepSlide ile hazırladığım sunumu izle 🎯`)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + shareUrl : shareUrl)}`,
                },
                {
                  label: 'WhatsApp',
                  icon: '💬',
                  color: 'bg-[#25D366]',
                  url: () => `https://wa.me/?text=${encodeURIComponent(`Sunumumu izle: ${typeof window !== 'undefined' ? window.location.origin + shareUrl : shareUrl}`)}`,
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.url()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-80 ${s.color}`}
                >
                  <span>{s.icon}</span> {s.label}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Bitti butonu */}
        <button
          onClick={onClose}
          className="rounded-xl bg-white/10 px-4 py-2.5 text-sm text-white hover:bg-white/20 transition"
        >
          Kapat
        </button>
      </div>
    </div>
  );
}
