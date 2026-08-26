/**
 * Astral World prototype fixtures — clearly seeded, replaceable, non-canonical.
 */

import type {
  AstralFriend,
  AstralNotification,
  AstralReader,
  CoffeeShopTable,
  DailyCardFixture,
  DemoSessionProfile,
  JourneyEntry,
  MallKiosk,
  PopularPlace,
  ReaderRelationship,
  SocialCircle,
  AstralUser,
} from './types.js';
import { ASTRAL_EXPERIENCE_BASE } from './routes.js';

const FIX = 'PROTOTYPE_FIXTURE' as const;
const BASE = ASTRAL_EXPERIENCE_BASE;

export const DEMO_SESSION_PROFILE: DemoSessionProfile = {
  userId: 'user-demo-teena',
  displayName: 'Teena',
  membershipBadge: 'Seeker · Founding Member',
  journalEntryCount: 23,
  source: FIX,
};

export const PROTOTYPE_CURRENT_USER: AstralUser = {
  id: DEMO_SESSION_PROFILE.userId,
  name: DEMO_SESSION_PROFILE.displayName,
  avatarUrl: null,
  avatarInitials: 'T',
  privacy: 'FRIENDS',
  source: FIX,
};

export const PROTOTYPE_FRIENDS: readonly AstralFriend[] = [
  {
    id: 'friend-jane',
    name: 'Jane Doe',
    avatarUrl: null,
    avatarInitials: 'JD',
    privacy: 'FRIENDS',
    currentDistrict: 'astrea',
    currentDestination: 'coffee-shop',
    presence: 'AT_DESTINATION',
    joinable: true,
    tableId: 'table-empath',
    source: FIX,
  },
  {
    id: 'friend-marcus',
    name: 'Marcus Chen',
    avatarUrl: null,
    avatarInitials: 'MC',
    privacy: 'FRIENDS',
    currentDistrict: 'astrea',
    currentDestination: 'astral-mall',
    presence: 'AT_DESTINATION',
    joinable: true,
    tableId: null,
    source: FIX,
  },
  {
    id: 'friend-luna',
    name: 'Luna Reyes',
    avatarUrl: null,
    avatarInitials: 'LR',
    privacy: 'FRIENDS',
    currentDistrict: 'astrea',
    currentDestination: 'tarot-suite',
    presence: 'READING',
    joinable: false,
    tableId: null,
    source: FIX,
  },
  {
    id: 'friend-lux',
    name: 'Love Lux',
    avatarUrl: null,
    avatarInitials: 'LL',
    privacy: 'FRIENDS',
    currentDistrict: 'astrea',
    currentDestination: 'coffee-shop',
    presence: 'AT_TABLE',
    joinable: true,
    tableId: 'table-morning',
    source: FIX,
  },
];

export const PROTOTYPE_READERS: readonly AstralReader[] = [
  {
    id: 'reader-madame-j',
    name: 'Madame J',
    specialty: 'Tarot • Intuitive • Love',
    categories: ['LOVE', 'INTUITIVE', 'TAROT'],
    avatarUrl: null,
    avatarInitials: 'MJ',
    primaryDestination: 'tarot-suite',
    currentDestination: 'tarot-suite',
    presence: 'READING_NOW',
    rating: 4.9,
    isFavorite: true,
    source: FIX,
  },
  {
    id: 'reader-kai',
    name: 'Kai the Oracle',
    specialty: 'Energy • Spirit Guide • Clarity',
    categories: ['ENERGY', 'INTUITIVE', 'CAREER'],
    avatarUrl: null,
    avatarInitials: 'KO',
    primaryDestination: 'astral-mall',
    currentDestination: 'astral-mall',
    presence: 'AVAILABLE',
    rating: 4.8,
    isFavorite: true,
    source: FIX,
  },
  {
    id: 'reader-earth-mama',
    name: 'Earth Mama',
    specialty: 'Tarot • Healing • Life Path',
    categories: ['TAROT', 'INTUITIVE', 'LOVE'],
    avatarUrl: null,
    avatarInitials: 'EM',
    primaryDestination: 'coffee-shop',
    currentDestination: 'coffee-shop',
    presence: 'AVAILABLE',
    rating: 4.7,
    isFavorite: false,
    source: FIX,
  },
  {
    id: 'reader-sage',
    name: 'Sage Moonwater',
    specialty: 'Intuitive Tarot',
    categories: ['LOVE', 'INTUITIVE', 'TAROT'],
    avatarUrl: null,
    avatarInitials: 'SM',
    primaryDestination: 'tarot-suite',
    currentDestination: 'tarot-suite',
    presence: 'JOINABLE',
    rating: 4.9,
    isFavorite: false,
    source: FIX,
  },
  {
    id: 'reader-orion',
    name: 'Orion Vale',
    specialty: 'Career & Path',
    categories: ['CAREER', 'TAROT', 'ENERGY'],
    avatarUrl: null,
    avatarInitials: 'OV',
    primaryDestination: 'astral-mall',
    currentDestination: 'astral-mall',
    presence: 'AVAILABLE',
    rating: 4.8,
    isFavorite: false,
    source: FIX,
  },
  {
    id: 'reader-aria',
    name: 'Aria Bloom',
    specialty: 'Heart & Connection',
    categories: ['LOVE', 'INTUITIVE'],
    avatarUrl: null,
    avatarInitials: 'AB',
    primaryDestination: 'coffee-shop',
    currentDestination: 'coffee-shop',
    presence: 'JOINABLE',
    rating: 4.7,
    isFavorite: false,
    source: FIX,
  },
];

export const PROTOTYPE_READER_RELATIONSHIPS: readonly ReaderRelationship[] = [
  { readerId: 'reader-madame-j', type: 'FAVORITE_READER', source: FIX },
  { readerId: 'reader-kai', type: 'FAVORITE_READER', source: FIX },
  { readerId: 'reader-madame-j', type: 'REGULAR_READER', source: FIX },
  { readerId: 'reader-earth-mama', type: 'SUBSCRIBED_READER', source: FIX },
];

export const PROTOTYPE_TABLES: readonly CoffeeShopTable[] = [
  { id: 'table-empath', name: 'The Empath Circle', capacity: 6, occupants: ['friend-jane', 'reader-aria'], joinable: true, activityNote: 'Warm conversation · tarot tips', source: FIX },
  { id: 'table-morning', name: 'Morning Magic', capacity: 6, occupants: ['friend-lux', 'user-demo-1', 'user-demo-2'], joinable: true, activityNote: 'Coffee & card pulls', source: FIX },
  { id: 'table-soul', name: 'Soul Talk', capacity: 6, occupants: ['user-demo-3', 'user-demo-4'], joinable: true, activityNote: 'Life path sharing', source: FIX },
  { id: 'table-moon', name: 'Moonlight Musings', capacity: 6, occupants: ['user-demo-5', 'user-demo-6', 'user-demo-7', 'user-demo-8', 'user-demo-9', 'user-demo-10'], joinable: false, activityNote: 'Full · waitlist open', source: FIX },
];

export const PROTOTYPE_KIOSKS: readonly MallKiosk[] = [
  { id: 'kiosk-1', label: '1 Card Pull', durationMin: 5, priceUsd: 8, priceState: 'DEMO', readerId: 'reader-orion', available: true, kioskState: 'OPEN', source: FIX },
  { id: 'kiosk-2', label: '3 Card Insight', durationMin: 10, priceUsd: 15, priceState: 'DEMO', readerId: 'reader-kai', available: true, kioskState: 'OPEN', source: FIX },
  { id: 'kiosk-3', label: 'Yes / No Reading', durationMin: 5, priceUsd: 7, priceState: 'DEMO', readerId: null, available: true, kioskState: 'SHORT_WAIT', source: FIX },
  { id: 'kiosk-4', label: 'Love Snapshot', durationMin: 10, priceUsd: 18, priceState: 'DEMO', readerId: 'reader-aria', available: true, kioskState: 'BUSY', source: FIX },
  { id: 'kiosk-5', label: 'Career Check-In', durationMin: 10, priceUsd: 16, priceState: 'DEMO', readerId: 'reader-orion', available: false, kioskState: 'CLOSED', source: FIX },
];

export const PLACES_POPULAR_NOW: readonly PopularPlace[] = [
  { destination: 'coffee-shop', label: 'Coffee Shop', activitySummary: '4 live tables', source: FIX },
  { destination: 'tarot-suite', label: 'Tarot Suite', activitySummary: '6 private rooms active', source: FIX },
  { destination: 'astral-mall', label: 'Astral Mall', activitySummary: '12 readers on', source: FIX },
];

export const PROTOTYPE_CIRCLES: readonly SocialCircle[] = [
  { id: 'circle-love', name: 'Love & Relationships', kind: 'LOVE', memberCount: 128, description: 'Heart-centered seekers and readers', source: FIX },
  { id: 'circle-career', name: 'Career & Purpose', kind: 'CAREER', memberCount: 94, description: 'Path clarity and professional insight', source: FIX },
  { id: 'circle-new', name: 'New Readers', kind: 'NEW_READERS', memberCount: 56, description: 'Welcome circle for first-time visitors', source: FIX },
  { id: 'circle-energy', name: 'General Energy', kind: 'GENERAL', memberCount: 210, description: 'Open community for all paths', source: FIX },
];

export const PROTOTYPE_DAILY_CARD: DailyCardFixture = {
  id: 'daily-1',
  cardName: 'The Star',
  meaning: 'Hope, renewal, and gentle guidance illuminate your path today.',
  date: '2026-08-26',
  source: FIX,
};

export const PROTOTYPE_NOTIFICATIONS: readonly AstralNotification[] = [
  {
    id: 'notif-1',
    type: 'FRIEND_PRESENT',
    title: 'Your friend is here',
    body: 'Jane Doe is at the Coffee Shop.',
    actionLabel: 'Join Her',
    actionRoute: `${BASE}/astrea/coffee-shop`,
    read: false,
    source: FIX,
  },
  {
    id: 'notif-2',
    type: 'REGULAR_RETURNED',
    title: 'A regular is back',
    body: 'Madame J noticed Teena just entered Astréa.',
    actionLabel: 'View',
    actionRoute: `${BASE}/friends`,
    read: false,
    source: FIX,
  },
  {
    id: 'notif-3',
    type: 'READER_AVAILABLE',
    title: 'Your favorite reader is available',
    body: 'Kai the Oracle is at Astral Mall.',
    actionLabel: 'View Reader',
    actionRoute: `${BASE}/readers`,
    read: false,
    source: FIX,
  },
  {
    id: 'notif-4',
    type: 'TABLE_INVITE',
    title: 'Meet me there?',
    body: 'Love Lux invited you to Table 2 · Morning Magic.',
    actionLabel: 'Join Table',
    actionRoute: `${BASE}/astrea/coffee-shop`,
    read: false,
    source: FIX,
  },
  {
    id: 'notif-5',
    type: 'DESTINATION_INVITE',
    title: 'Meet me at the Coffee Shop',
    body: 'Jane Doe: Come join us in Astréa.',
    actionLabel: 'Join Here',
    actionRoute: `${BASE}/astrea/coffee-shop`,
    read: false,
    source: FIX,
  },
  {
    id: 'notif-6',
    type: 'READING_READY',
    title: 'Your reading is ready',
    body: 'Earth Mama is available at Coffee Shop.',
    actionLabel: 'Go Now',
    actionRoute: `${BASE}/astrea/coffee-shop`,
    read: true,
    source: FIX,
  },
];

export const PROTOTYPE_JOURNEY: readonly JourneyEntry[] = [
  { id: 'j-1', kind: 'READING', title: 'Love Reading', subtitle: 'Madame J · Tarot Suite', date: '2026-08-24', source: FIX },
  { id: 'j-2', kind: 'SAVED', title: 'Career Path Clarity', subtitle: 'Kai the Oracle · Astral Mall', date: '2026-08-20', source: FIX },
  { id: 'j-3', kind: 'JOURNAL', title: '23 entries', subtitle: 'Personal journal', date: '2026-08-26', source: FIX },
];

export const DISTRICT_OCCUPANCY = { current: 47, capacity: 120 };

export const PROTOTYPE_AVATAR_OPTIONS = ['Celestial', 'Warm', 'Mystic', 'Golden'] as const;

export const CREATE_DECK_STEPS = [
  'Upload Your People',
  'Choose Relationships',
  'Assign Archetypes',
  'Preview Cards',
  'Order Your Deck',
] as const;
