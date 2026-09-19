/**
 * P0.5E.4 — 28 character discovery domains.
 */

import { DISCOVERY_DOMAIN_IDS } from './constants.js';
import type { CharacterDiscoveryDomain, DiscoveryDomainId } from './types.js';

const DOMAIN_COPY: Record<DiscoveryDomainId, { title: string; description: string }> = {
  CORE_TEMPERAMENT: { title: 'Core Temperament', description: 'Baseline energy, default mood, how she enters a room.' },
  INTELLIGENCE: { title: 'Intelligence', description: 'Uneven strengths — what she is brilliant at vs embarrassingly bad at.' },
  HUMOR: { title: 'Humor', description: 'What actually makes her laugh — not generic witty adjectives.' },
  EMOTIONAL_LIFE: { title: 'Emotional Life', description: 'How feelings move through her — not a mood board.' },
  CONTRADICTIONS: { title: 'Contradictions', description: 'Traits that coexist uncomfortably — with context.' },
  FLAWS: { title: 'Flaws', description: 'Behaviors friends would roast her for — not secret flattery.' },
  PRIVATE_HUMANITY: { title: 'Private Humanity', description: 'Phone tabs, guilty pleasures, late-night habits.' },
  FRIENDSHIPS: { title: 'Friendships', description: 'Who gets the first screenshot, who can tell her she is wrong.' },
  ROMANCE_ATTRACTION: { title: 'Romance + Attraction', description: 'Adult relational behavior — not a dating franchise.' },
  FAMILY_HISTORY: { title: 'Family + History', description: 'Formative context without biography cosplay.' },
  MONEY_AMBITION: { title: 'Money + Ambition', description: 'How she thinks about money, status, and wanting things.' },
  WORK_DISCIPLINE: { title: 'Work + Discipline', description: 'Procrastination, obsession, structure, avoidance.' },
  CULTURAL_LIFE: { title: 'Cultural Life', description: 'Lived fluency with knowledge boundaries — not omniscience.' },
  TASTE: { title: 'Taste', description: 'What she actually likes when nobody is watching.' },
  DIGITAL_LIFE: { title: 'Digital Life', description: 'Tabs, screenshots, group chats, apps she opens without thinking.' },
  HOME_ENVIRONMENT: { title: 'Home + Environment', description: 'How her space looks when she is not performing.' },
  SOCIAL_BEHAVIOR: { title: 'Social Behavior', description: 'Parties, dinners, strangers, performance vs truth.' },
  CONFLICT: { title: 'Conflict', description: 'How she fights, retreats, or weaponizes receipts.' },
  INSECURITY: { title: 'Insecurity', description: 'What actually makes her small — not aesthetic vulnerability.' },
  CONFIDENCE: { title: 'Confidence', description: 'Where confidence is real vs performed.' },
  CURIOSITY: { title: 'Curiosity', description: 'Rabbit holes, obsession triggers, when she stops.' },
  MORAL_BOUNDARIES: { title: 'Moral Boundaries', description: 'Lines she will not cross — and lines she has crossed.' },
  BOOK_RELATIONSHIP: { title: 'Book Relationship', description: 'Why she keeps the Book — psychology, not brand prop.' },
  PUBLIC_VS_PRIVATE: { title: 'Public vs Private Self', description: 'What strangers assume vs what friends know.' },
  PHYSICAL_HABITS: { title: 'Physical Habits', description: 'Fidgeting, pacing, how she holds a phone.' },
  STYLE_BEAUTY: { title: 'Style + Beauty', description: 'Why she wears what she wears — not costume design.' },
  CAMERA_PRESENCE: { title: 'Camera Presence', description: 'What changes when she remembers the camera vs forgets.' },
  GROWTH_CAPACITY: { title: 'Growth Capacity', description: 'Can she change her mind — and how does it cost her.' },
};

export function buildCharacterDiscoveryDomains(): CharacterDiscoveryDomain[] {
  return DISCOVERY_DOMAIN_IDS.map((domainId) => ({
    domainId,
    title: DOMAIN_COPY[domainId].title,
    description: DOMAIN_COPY[domainId].description,
    optional: true as const,
    unresolvedAllowed: true as const,
  }));
}

export function discoveryDomainCount(): number {
  return DISCOVERY_DOMAIN_IDS.length;
}
