// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { OnboardingVoiceStep } from './OnboardingVoiceStep';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const STEP_TITLES = ['Hoş Geldiniz', 'Ses Testi', 'Hazırsınız!'];

export function OnboardingModal({ isOpen, onComplete, onSkip }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { isPremium } = useAuth();

  if (!isOpen) return null;

  const goNext = () => {
    if (step < 3) setStep((s) => s + 1);
    else onComplete();
  };

  const handleVoiceSuccess = () => setStep(3);
  const handleVoiceSkip = () => setStep(3);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Onboarding adımı ${step}/3`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-primary w-6' : 'bg-muted w-3'
                }`}
              />
            ))}
          </div>
          <button
            onClick={onSkip}
            className="rounded-full p-1.5 hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Kapat"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step label */}
        <div className="px-6 pb-1">
          <p className="text-xs text-muted-foreground font-medium">
            {step}/3 — {STEP_TITLES[step - 1]}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 min-h-[260px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center text-center gap-4 pt-4"
              >
                <div className="text-5xl">🎤</div>
                <div>
                  <h2 className="text-xl font-bold mb-2">DeepSlide&apos;a Hoş Geldiniz!</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Görsellerinizi yükleyin, AI anahtar kelimeleri çıkarsın.
                    Sunum yaparken sadece <strong>konuşarak</strong> slaytlarınızı kontrol edin.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 w-full mt-2">
                  {[
                    { icon: '📸', text: 'Görsel Yükle' },
                    { icon: '🤖', text: 'AI Analiz' },
                    { icon: '🎙️', text: 'Ses Kontrol' },
                  ].map((item) => (
                    <div key={item.text} className="rounded-lg bg-muted p-2 text-center">
                      <div className="text-xl mb-1">{item.icon}</div>
                      <p className="text-xs font-medium">{item.text}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <OnboardingVoiceStep onSuccess={handleVoiceSuccess} onSkip={handleVoiceSkip} />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center text-center gap-4 pt-4"
              >
                <div className="text-5xl">🚀</div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Her Şey Hazır!</h2>
                  <p className="text-sm text-muted-foreground">
                    İlk sunumunuzu oluşturmaya başlayın.
                  </p>
                </div>

                {!isPremium && (
                  <div className="w-full rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 p-4 text-left">
                    <p className="text-sm font-semibold mb-1">✨ 3 Gün Ücretsiz Pro Dene</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Sınırsız sunum, 1080p kayıt, analytics ve daha fazlası.
                    </p>
                    <button
                      onClick={() => { router.push('/billing'); onComplete(); }}
                      className="text-xs bg-primary text-primary-foreground rounded-lg px-3 py-1.5 hover:opacity-90 transition-opacity"
                    >
                      Hemen Dene →
                    </button>
                  </div>
                )}

                <button
                  onClick={() => { router.push('/presentation/new'); onComplete(); }}
                  className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  İlk Sunumu Oluştur
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Geri
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={goNext}
              className="rounded-lg bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {step === 2 ? 'Atla →' : 'Devam →'}
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Hayır teşekkürler
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
