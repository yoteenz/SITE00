/**
 * Astral World experience prototype types — P0.E.1
 * All prototype data is CREATIVE_EXPLORATION, not canon.
 */

export const ASTRAL_TRUTH_LAYER = 'CREATIVE_EXPLORATION' as const;

export type PresenceState =
  | 'OFFLINE'
  | 'ONLINE'
  | 'IN_WORLD'
  | 'IN_DISTRICT'
  | 'AT_DESTINATION'
  | 'AT_TABLE'
  | 'READING'
  | 'AVAILABLE'
  | 'JOINABLE'
  | 'PRIVATE';

export type PresencePrivacy = 'EVERYONE' | 'FRIENDS' | 'HIDDEN';

export type ReaderPresenceState =
  | 'AVAILABLE'
  | 'READING_NOW'
  | 'JOINABLE'
  | 'APPOINTMENTS_ONLY'
  | 'OFFLINE';

export type RelationshipType = 'FAVORITE_READER' | 'SUBSCRIBED_READER' | 'REGULAR_READER';

export type DestinationSlug = 'tarot-suite' | 'astral-mall' | 'coffee-shop';

export type DistrictSlug = 'astrea';

export type EnergyState =
  | 'ALIGNED_OPEN'
  | 'NEED_CLARITY'
  | 'NEED_COMFORT'
  | 'CURIOUS'
  | 'CELEBRATING'
  | 'PRIVATE';

export type TakeMeSomewhereIntent =
  | 'NEED_CLARITY'
  | 'TEN_MINUTES'
  | 'NEED_COMFORT'
  | 'CELEBRATING'
  | 'WANT_CONNECTION'
  | 'SOMETHING_ELSE'
  | 'DEEP_PRIVATE';

export type KioskState = 'OPEN' | 'BUSY' | 'SHORT_WAIT' | 'CLOSED';

export type CircleKind = 'LOVE' | 'CAREER' | 'NEW_READERS' | 'GENERAL';

export type ReaderRelationship = {
  readerId: string;
  type: RelationshipType;
  source: FixtureDataSource;
};

export type NotificationType =
  | 'FRIEND_PRESENT'
  | 'READER_AVAILABLE'
  | 'REGULAR_RETURNED'
  | 'TABLE_INVITE'
  | 'DESTINATION_INVITE'
  | 'READING_READY';

export type FixtureDataSource = 'PROTOTYPE_FIXTURE' | 'REAL_PROJECT_DATA';

export type AstralUser = {
  id: string;
  name: string;
  avatarUrl: string | null;
  avatarInitials: string;
  energyState?: EnergyState;
  privacy: PresencePrivacy;
  source: FixtureDataSource;
};

export type AstralReader = {
  id: string;
  name: string;
  specialty: string;
  categories: string[];
  avatarUrl: string | null;
  avatarInitials: string;
  primaryDestination: DestinationSlug;
  currentDestination: DestinationSlug | null;
  presence: ReaderPresenceState;
  rating: number;
  isFavorite: boolean;
  source: FixtureDataSource;
};

export type AstralFriend = AstralUser & {
  currentDistrict: DistrictSlug | null;
  currentDestination: DestinationSlug | null;
  presence: PresenceState;
  joinable: boolean;
  tableId?: string | null;
};

export type CoffeeShopTable = {
  id: string;
  name: string;
  capacity: number;
  occupants: string[];
  joinable: boolean;
  activityNote?: string;
  source: FixtureDataSource;
};

export type PopularPlace = {
  destination: DestinationSlug;
  label: string;
  activitySummary: string;
  source: FixtureDataSource;
};

export type SocialCircle = {
  id: string;
  name: string;
  kind: CircleKind;
  memberCount: number;
  description: string;
  source: FixtureDataSource;
};

export type DailyCardFixture = {
  id: string;
  cardName: string;
  meaning: string;
  date: string;
  source: FixtureDataSource;
};

export type DemoSessionProfile = {
  userId: string;
  displayName: string;
  membershipBadge: string;
  journalEntryCount: number;
  source: FixtureDataSource;
};

export type MallKiosk = {
  id: string;
  label: string;
  durationMin: number;
  priceUsd: number;
  priceState: 'DEMO' | 'NON_CANONICAL';
  readerId: string | null;
  available: boolean;
  kioskState: KioskState;
  source: FixtureDataSource;
};

export type AstralNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  actionLabel: string;
  actionRoute: string;
  read: boolean;
  source: FixtureDataSource;
};

export type JourneyEntry = {
  id: string;
  kind: 'READING' | 'SAVED' | 'JOURNAL';
  title: string;
  subtitle: string;
  date: string;
  source: FixtureDataSource;
};

export type UserPresence = {
  userId: string;
  state: PresenceState;
  district: DistrictSlug | null;
  destination: DestinationSlug | null;
  tableId: string | null;
  activity: string | null;
  privacy: PresencePrivacy;
  joinable: boolean;
  updatedAt: string;
};

export type DestinationPurpose = {
  slug: DestinationSlug;
  label: string;
  purpose: string;
  tone: string;
};

export const DESTINATION_PURPOSES: readonly DestinationPurpose[] = [
  { slug: 'tarot-suite', label: 'Tarot Suite', purpose: 'deep / private / intentional', tone: 'premium intimate' },
  { slug: 'astral-mall', label: 'Astral Mall', purpose: 'fast / spontaneous / quick', tone: 'energetic discovery' },
  { slug: 'coffee-shop', label: 'Coffee Shop', purpose: 'conversation / comfort / community', tone: 'warm social' },
] as const;
