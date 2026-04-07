import type { TransitionProvider } from './types';

export const fadeTransition: TransitionProvider = {
  name: 'Fade',
  type: 'fade',
  enter: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.25, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeIn' },
    },
  },
  exit: {
    initial: { opacity: 1 },
    animate: {
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeIn' },
    },
    exit: { opacity: 1 },
  },
};
