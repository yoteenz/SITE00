/**
 * Astral World prototype fixtures — clearly seeded, replaceable, non-canonical.
 */

import type {
  AstralFriend,
  AstralNotification,
  AstralReader,
  CoffeeShopTable,
  JourneyEntry,
  MallKiosk,
  AstralUser,
} from './types.js';

const FIX = 'PROTOTYPE_FIXTURE' as const;

export const PROTOTYPE_CURRENT_USER: AstralUser = {
  id: 'user-founder',
  name: 'Rea',
  avatarUrl: null,
  avatarInitials: 'R',
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
];

export const PROTOTYPE_READERS: readonly AstralReader[] = [
  {
    id: 'reader-sage',
    name: 'Sage Moonwater',
    specialty: 'Intuitive Tarot',
    categories: ['LOVE', 'INTUITIVE', 'TAROT'],
    avatarUrl: null,
    avatarInitials: 'SM',
    primaryDestination: 'tarot-suite',
    currentDestination: 'tarot-suite',
    presence: 'READING_NOW',
    rating: 4.9,
    isFavorite: true,
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
    isFavorite: true,
    source: FIX,
  },
];

export const PROTOTYPE_TABLES: readonly CoffeeShopTable[] = [
  { id: 'table-empath', name: 'The Empath Circle', capacity: 6, occupants: ['friend-jane', 'reader-aria'], joinable: true, source: FIX },
  { id: 'table-morning', name: 'Morning Magic', capacity: 4, occupants: ['user-demo-1'], joinable: true, source: FIX },
  { id: 'table-soul', name: 'Soul Talk', capacity: 5, occupants: [], joinable: true, source: FIX },
  { id: 'table-moon', name: 'Moonlight Musings', capacity: 4, occupants: ['user-demo-2', 'user-demo-3', 'user-demo-4', 'user-demo-5'], joinable: false, source: FIX },
];

export const PROTOTYPE_KIOSKS: readonly MallKiosk[] = [
  { id: 'kiosk-1', label: '1 Card Pull', durationMin: 5, priceUsd: 8, priceState: 'DEMO', readerId: 'reader-orion', available: true, source: FIX },
  { id: 'kiosk-2', label: '3 Card Insight', durationMin: 10, priceUsd: 15, priceState: 'DEMO', readerId: 'reader-orion', available: true, source: FIX },
  { id: 'kiosk-3', label: 'Yes / No Reading', durationMin: 5, priceUsd: 7, priceState: 'DEMO', readerId: null, available: true, source: FIX },
  { id: 'kiosk-4', label: 'Love Snapshot', durationMin: 10, priceUsd: 18, priceState: 'DEMO', readerId: 'reader-aria', available: true, source: FIX },
  { id: 'kiosk-5', label: 'Career Check-In', durationMin: 10, priceUsd: 16, priceState: 'DEMO', readerId: 'reader-orion', available: false, source: FIX },
];

export const PROTOTYPE_NOTIFICATIONS: readonly AstralNotification[] = [
  {
    id: 'notif-1',
    type: 'FRIEND_PRESENT',
    title: 'Jane is here',
    body: 'Jane Doe is at the Coffee Shop.',
    actionLabel: 'Join Here',
    actionRoute: '/projects/astral-world/experience/astrea/coffee-shop',
    read: false,
    source: FIX,
  },
  {
    id: 'notif-2',
    type: 'REGULAR_RETURNED',
    title: 'A regular is back',
    body: 'Your regular client has entered Astral World.',
    actionLabel: 'View',
    actionRoute: '/projects/astral-world/experience/friends',
    read: false,
    source: FIX,
  },
  {
    id: 'notif-3',
    type: 'READER_AVAILABLE',
    title: 'Favorite reader available',
    body: 'Sage Moonwater is available in Tarot Suite.',
    actionLabel: 'View Reader',
    actionRoute: '/projects/astral-world/experience/readers',
    read: true,
    source: FIX,
  },
  {
    id: 'notif-4',
    type: 'TABLE_INVITE',
    title: 'Meet me there',
    body: 'Join The Empath Circle at Coffee Shop.',
    actionLabel: 'Join Table',
    actionRoute: '/projects/astral-world/experience/astrea/coffee-shop',
    read: false,
    source: FIX,
  },
];

export const PROTOTYPE_JOURNEY: readonly JourneyEntry[] = [
  { id: 'j-1', kind: 'READING', title: 'Three Paths Spread', subtitle: 'Sage Moonwater · Tarot Suite', date: '2026-08-20', source: FIX },
  { id: 'j-2', kind: 'SAVED', title: 'Career Check-In', subtitle: 'Orion Vale · Astral Mall', date: '2026-08-18', source: FIX },
  { id: 'j-3', kind: 'JOURNAL', title: 'Moon in Scorpio reflection', subtitle: 'Personal journal', date: '2026-08-15', source: FIX },
];

export const DISTRICT_OCCUPANCY = { current: 47, capacity: 120 };
