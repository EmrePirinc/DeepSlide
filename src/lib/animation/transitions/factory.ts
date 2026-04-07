import type { TransitionType, TransitionProvider } from './types';
import { zoomTransition } from './zoom';
import { fadeTransition } from './fade';
import { panTransition } from './pan';

const transitions: Record<TransitionType, TransitionProvider> = {
  zoom: zoomTransition,
  fade: fadeTransition,
  pan: panTransition,
};

export function getTransition(type: TransitionType): TransitionProvider {
  return transitions[type] ?? transitions.zoom;
}

export const TRANSITION_OPTIONS = [
  { value: 'zoom' as TransitionType, label: 'Zoom', description: 'Prezi tarzı — görsel büyüyerek açılır' },
  { value: 'fade' as TransitionType, label: 'Fade', description: 'Solarak kaybolur, belirerek açılır' },
  { value: 'pan' as TransitionType, label: 'Pan', description: 'Yatay kayma — slayt gibi geçiş' },
];
