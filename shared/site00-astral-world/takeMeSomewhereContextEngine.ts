/**
 * Take Me Somewhere context engine — replaceable recommendation abstraction.
 * Prototype deterministic logic; not production AI.
 */

import type { AstralReader, DestinationSlug, EnergyState, TakeMeSomewhereIntent } from './types.js';
import { routeTakeMeSomewhere } from './takeMeSomewhereRouter.js';

export type TakeMeSomewhereContextInput = {
  intent: TakeMeSomewhereIntent;
  energy?: EnergyState;
  availableMinutes?: number;
  favoriteReaderAvailable?: boolean;
  friendAtDestination?: DestinationSlug | null;
  readers?: readonly AstralReader[];
};

export type TakeMeSomewhereRecommendation = {
  district: 'astrea';
  destination: DestinationSlug;
  destinationLabel: string;
  readerId: string | null;
  readerName: string | null;
  reason: string;
  conversationalLine: string;
  alternates: { destination: DestinationSlug; label: string }[];
  isPrototypeLogic: true;
};

const DEST_LABELS: Record<DestinationSlug, string> = {
  'coffee-shop': 'Coffee Shop',
  'astral-mall': 'Astral Mall',
  'tarot-suite': 'Tarot Suite',
};

function pickReader(
  readers: readonly AstralReader[] | undefined,
  destination: DestinationSlug,
  preferFavorite: boolean,
): { id: string | null; name: string | null } {
  if (!readers?.length) return { id: null, name: null };
  const atDest = readers.filter(
    (r) => r.currentDestination === destination && ['AVAILABLE', 'JOINABLE'].includes(r.presence),
  );
  if (!atDest.length) return { id: null, name: null };
  const fav = preferFavorite ? atDest.find((r) => r.isFavorite) : undefined;
  const pick = fav ?? atDest[0]!;
  return { id: pick.id, name: pick.name };
}

export function recommendTakeMeSomewhere(input: TakeMeSomewhereContextInput): TakeMeSomewhereRecommendation {
  const base = routeTakeMeSomewhere(input.intent);
  let destination = base.destination;
  let reason = base.reason;
  let conversationalLine = base.reason;

  if (input.intent === 'NEED_CLARITY' && input.readers?.length) {
    const available = input.readers.filter((r) => r.presence === 'AVAILABLE' || r.presence === 'JOINABLE');
    const fav = available.find((r) => r.isFavorite);
    if (fav?.currentDestination) {
      destination = fav.currentDestination;
      reason = `${fav.name} is available — a strong match for clarity.`;
      conversationalLine = `You sound like you need clarity. ${fav.name} may be the right guide.`;
    }
  }

  if (input.intent === 'TEN_MINUTES') {
    conversationalLine = "You've only got ten minutes. Let's take you to the Mall.";
  } else if (input.intent === 'NEED_COMFORT' || input.intent === 'WANT_CONNECTION') {
    conversationalLine = 'You sound like you need the Coffee Shop today.';
  } else if (input.intent === 'DEEP_PRIVATE') {
    conversationalLine = 'Something deep calls for the Tarot Suite.';
  }

  if (input.friendAtDestination === 'coffee-shop' && (input.intent === 'WANT_CONNECTION' || input.intent === 'NEED_COMFORT')) {
    reason = 'A friend is at the Coffee Shop right now.';
    conversationalLine = 'Jane is at the Coffee Shop — perfect for connection.';
    destination = 'coffee-shop';
  }

  const reader = pickReader(input.readers, destination, input.favoriteReaderAvailable ?? true);
  const alternates = (['coffee-shop', 'astral-mall', 'tarot-suite'] as DestinationSlug[])
    .filter((d) => d !== destination)
    .map((d) => ({ destination: d, label: DEST_LABELS[d] }));

  return {
    district: 'astrea',
    destination,
    destinationLabel: DEST_LABELS[destination],
    readerId: reader.id,
    readerName: reader.name,
    reason,
    conversationalLine,
    alternates,
    isPrototypeLogic: true,
  };
}
