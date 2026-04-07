'use client';

import { motion } from 'motion/react';
import type { PresentationTheme } from '@/lib/themes/types';

interface CoverSlideProps {
  title: string;
  theme: PresentationTheme;
  onContinue: () => void;
}

export function CoverSlide({ title, theme, onContinue }: CoverSlideProps) {
  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center cursor-pointer"
      style={{ backgroundColor: theme.bg }}
      onClick={onContinue}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-5xl md:text-7xl font-bold text-center max-w-4xl px-8"
        style={{ color: theme.textColor }}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {title}
      </motion.h1>

      <motion.p
        className="mt-6 text-lg"
        style={{ color: theme.mutedColor }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        {new Date().toLocaleDateString('tr-TR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </motion.p>

      <motion.div
        className="mt-12 flex items-center gap-2"
        style={{ color: theme.mutedColor }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: theme.badgeColor }}
        >
          <span style={{ color: theme.badgeTextColor }} className="text-xl">
            ▶
          </span>
        </div>
        <span className="text-sm">Başlamak için tıklayın</span>
      </motion.div>
    </motion.div>
  );
}
