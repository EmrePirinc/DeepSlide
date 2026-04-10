// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState } from 'react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RecipientManagerProps {
  onRecipientsChange: (emails: string[]) => void;
}

export function RecipientManager({ onRecipientsChange }: RecipientManagerProps) {
  const [input, setInput] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addRecipient = () => {
    const email = input.trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      setError('Geçersiz e-posta adresi');
      return;
    }
    if (recipients.includes(email)) {
      setError('Bu adres zaten listede');
      return;
    }
    const next = [...recipients, email];
    setRecipients(next);
    onRecipientsChange(next);
    setInput('');
    setError(null);
  };

  const removeRecipient = (email: string) => {
    const next = recipients.filter((r) => r !== email);
    setRecipients(next);
    onRecipientsChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="email"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(null); }}
          onKeyDown={(e) => e.key === 'Enter' && addRecipient()}
          placeholder="ornek@sirket.com"
          className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none ring-1 ring-white/10 focus:ring-blue-400/50 transition"
        />
        <button
          onClick={addRecipient}
          disabled={!input.trim()}
          className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-400 disabled:opacity-40 transition"
        >
          Ekle
        </button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {recipients.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {recipients.map((email) => (
            <li key={email} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
              <span className="text-sm text-white/80">{email}</span>
              <button
                onClick={() => removeRecipient(email)}
                className="text-white/30 hover:text-red-400 text-xs transition"
                aria-label={`${email} kaldır`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {recipients.length === 0 && (
        <p className="text-xs text-white/30">Henüz alıcı eklenmedi</p>
      )}
    </div>
  );
}
