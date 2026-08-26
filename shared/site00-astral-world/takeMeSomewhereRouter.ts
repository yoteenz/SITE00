/**
 * Deterministic Take Me Somewhere routing — prototype only, replaceable by Studio World AI later.
 */

import type { DestinationSlug, TakeMeSomewhereIntent } from './types.js';

export type RoutingSuggestion = {
  destination: DestinationSlug;
  label: string;
  reason: string;
  isPrototypeLogic: true;
};

export function routeTakeMeSomewhere(intent: TakeMeSomewhereIntent): RoutingSuggestion {
  switch (intent) {
    case 'TEN_MINUTES':
      return {
        destination: 'astral-mall',
        label: 'Astral Mall',
        reason: 'Quick readings fit a 10-minute window.',
        isPrototypeLogic: true,
      };
    case 'NEED_COMFORT':
      return {
        destination: 'coffee-shop',
        label: 'Coffee Shop',
        reason: 'Warm social space for comfort and connection.',
        isPrototypeLogic: true,
      };
    case 'DEEP_PRIVATE':
    case 'NEED_CLARITY':
      return {
        destination: 'tarot-suite',
        label: 'Tarot Suite',
        reason: 'Deep, private, intentional reading environment.',
        isPrototypeLogic: true,
      };
    case 'WANT_CONNECTION':
      return {
        destination: 'coffee-shop',
        label: 'Coffee Shop',
        reason: 'Community tables and friend presence.',
        isPrototypeLogic: true,
      };
    case 'CELEBRATING':
      return {
        destination: 'astral-mall',
        label: 'Astral Mall',
        reason: 'Spontaneous celebratory quick reading.',
        isPrototypeLogic: true,
      };
    case 'SOMETHING_ELSE':
    default:
      return {
        destination: 'tarot-suite',
        label: 'Tarot Suite',
        reason: 'Explore the flagship intimate destination.',
        isPrototypeLogic: true,
      };
  }
}

export const TAKE_ME_SOMEWHERE_CHIPS: readonly { intent: TakeMeSomewhereIntent; label: string }[] = [
  { intent: 'NEED_CLARITY', label: 'I NEED CLARITY' },
  { intent: 'TEN_MINUTES', label: 'I HAVE 10 MINUTES' },
  { intent: 'NEED_COMFORT', label: 'I NEED COMFORT' },
  { intent: 'CELEBRATING', label: "I'M CELEBRATING" },
  { intent: 'WANT_CONNECTION', label: 'I WANT CONNECTION' },
  { intent: 'SOMETHING_ELSE', label: 'SOMETHING ELSE' },
];
