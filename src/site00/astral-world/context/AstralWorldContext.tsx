import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  AstralReader,
  CoffeeShopTable,
  EnergyState,
  MallKiosk,
  PresencePrivacy,
  TakeMeSomewhereIntent,
  UserPresence,
} from '../../../../shared/site00-astral-world/types.js';
import { getAstralFixtures } from '../../../../shared/site00-astral-world/fixtureService.js';
import {
  createInitialUserPresence,
  joinTable,
  leaveTable,
  updateUserPresence,
  visibleFriends,
} from '../../../../shared/site00-astral-world/presenceService.js';
import { recommendTakeMeSomewhere } from '../../../../shared/site00-astral-world/takeMeSomewhereContextEngine.js';
import {
  astralWorldRouteBase,
  astralWorldSectionPath,
  type AstralWorldRouteMode,
} from '../../../../shared/site00-astral-world/routes.js';

type AstralWorldContextValue = {
  basePath: string;
  mode: AstralWorldRouteMode;
  isFastTrack: boolean;
  path: (section: string) => string;
  demoSession: ReturnType<typeof getAstralFixtures>['demoSession'];
  userPresence: UserPresence;
  energy: EnergyState;
  allowFriendsToJoin: boolean;
  tables: CoffeeShopTable[];
  notifications: ReturnType<typeof getAstralFixtures>['notifications'];
  kiosks: MallKiosk[];
  readers: AstralReader[];
  setEnergy: (e: EnergyState) => void;
  setPrivacy: (p: PresencePrivacy) => void;
  setAllowFriendsToJoin: (v: boolean) => void;
  checkIn: () => void;
  joinHerTable: (tableId: string) => string | null;
  leaveCurrentTable: () => void;
  takeMeSomewhere: (intent: TakeMeSomewhereIntent) => ReturnType<typeof recommendTakeMeSomewhere>;
  markNotificationRead: (id: string) => void;
  toggleFavoriteReader: (readerId: string) => void;
  selectKiosk: (kioskId: string) => string | null;
  joinKioskWait: (kioskId: string) => void;
  friends: ReturnType<typeof getAstralFixtures>['friends'];
  journey: ReturnType<typeof getAstralFixtures>['journey'];
  circles: ReturnType<typeof getAstralFixtures>['circles'];
  dailyCard: ReturnType<typeof getAstralFixtures>['dailyCard'];
  placesPopular: ReturnType<typeof getAstralFixtures>['placesPopular'];
  readerRelationships: ReturnType<typeof getAstralFixtures>['readerRelationships'];
  occupancy: ReturnType<typeof getAstralFixtures>['occupancy'];
  selectedKioskId: string | null;
  selectedTableId: string | null;
};

const AstralWorldContext = createContext<AstralWorldContextValue | null>(null);

export function AstralWorldProvider({
  children,
  mode = 'experience',
}: {
  children: ReactNode;
  mode?: AstralWorldRouteMode;
}) {
  const basePath = astralWorldRouteBase(mode);
  const isFastTrack = mode === 'fast-track';
  const seed = useMemo(() => getAstralFixtures(basePath), [basePath]);
  const path = useCallback((section: string) => astralWorldSectionPath(basePath, section), [basePath]);

  const [userPresence, setUserPresence] = useState(createInitialUserPresence);
  const [energy, setEnergy] = useState<EnergyState>('ALIGNED_OPEN');
  const [allowFriendsToJoin, setAllowFriendsToJoin] = useState(true);
  const [tables, setTables] = useState<CoffeeShopTable[]>(() => [...seed.tables]);
  const [notifications, setNotifications] = useState([...seed.notifications]);
  const [readers, setReaders] = useState<AstralReader[]>(() => [...seed.readers]);
  const [kiosks, setKiosks] = useState<MallKiosk[]>(() => [...seed.kiosks]);
  const [selectedKioskId, setSelectedKioskId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const setPrivacy = useCallback((privacy: PresencePrivacy) => {
    setUserPresence((p) => updateUserPresence(p, { privacy }));
  }, []);

  const checkIn = useCallback(() => {
    setUserPresence((p) => updateUserPresence(p, { state: 'IN_WORLD', district: 'astrea' }));
  }, []);

  const joinHerTable = useCallback(
    (tableId: string) => {
      const result = joinTable(tables, tableId, userPresence.userId);
      if (result.error) return result.error;
      setTables(result.tables);
      setSelectedTableId(tableId);
      setUserPresence((p) =>
        updateUserPresence(p, {
          state: 'AT_TABLE',
          district: 'astrea',
          destination: 'coffee-shop',
          tableId,
          activity: 'At table',
          joinable: allowFriendsToJoin,
        }),
      );
      return null;
    },
    [tables, userPresence.userId, allowFriendsToJoin],
  );

  const leaveCurrentTable = useCallback(() => {
    if (!userPresence.tableId) return;
    setTables((prev) => leaveTable(prev, userPresence.tableId!, userPresence.userId));
    setSelectedTableId(null);
    setUserPresence((p) =>
      updateUserPresence(p, { state: 'AT_DESTINATION', tableId: null, activity: null }),
    );
  }, [userPresence.tableId, userPresence.userId]);

  const takeMeSomewhere = useCallback(
    (intent: TakeMeSomewhereIntent) => {
      const friendCoffee = seed.friends.find((f) => f.currentDestination === 'coffee-shop');
      return recommendTakeMeSomewhere({
        intent,
        energy,
        favoriteReaderAvailable: readers.some((r) => r.isFavorite && r.presence === 'AVAILABLE'),
        friendAtDestination: friendCoffee ? 'coffee-shop' : null,
        readers,
      });
    },
    [energy, readers, seed.friends],
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const toggleFavoriteReader = useCallback((readerId: string) => {
    setReaders((prev) =>
      prev.map((r) => (r.id === readerId ? { ...r, isFavorite: !r.isFavorite } : r)),
    );
  }, []);

  const selectKiosk = useCallback(
    (kioskId: string) => {
      const kiosk = kiosks.find((k) => k.id === kioskId);
      if (!kiosk) return 'Kiosk not found';
      if (kiosk.kioskState === 'CLOSED') return 'Kiosk is closed';
      setSelectedKioskId(kioskId);
      return null;
    },
    [kiosks],
  );

  const joinKioskWait = useCallback((kioskId: string) => {
    setKiosks((prev) =>
      prev.map((k) =>
        k.id === kioskId && k.kioskState === 'BUSY' ? { ...k, kioskState: 'SHORT_WAIT' as const } : k,
      ),
    );
    setSelectedKioskId(kioskId);
  }, []);

  const value = useMemo<AstralWorldContextValue>(
    () => ({
      basePath,
      mode,
      isFastTrack,
      path,
      demoSession: seed.demoSession,
      userPresence,
      energy,
      allowFriendsToJoin,
      tables,
      notifications,
      kiosks,
      readers,
      setEnergy,
      setPrivacy,
      setAllowFriendsToJoin,
      checkIn,
      joinHerTable,
      leaveCurrentTable,
      takeMeSomewhere,
      markNotificationRead,
      toggleFavoriteReader,
      selectKiosk,
      joinKioskWait,
      friends: visibleFriends(userPresence.privacy) as typeof seed.friends,
      journey: seed.journey,
      circles: seed.circles,
      dailyCard: seed.dailyCard,
      placesPopular: seed.placesPopular,
      readerRelationships: seed.readerRelationships,
      occupancy: seed.occupancy,
      selectedKioskId,
      selectedTableId,
    }),
    [
      basePath,
      mode,
      isFastTrack,
      path,
      seed,
      userPresence,
      energy,
      allowFriendsToJoin,
      tables,
      notifications,
      kiosks,
      readers,
      setPrivacy,
      checkIn,
      joinHerTable,
      leaveCurrentTable,
      takeMeSomewhere,
      markNotificationRead,
      toggleFavoriteReader,
      selectKiosk,
      joinKioskWait,
      selectedKioskId,
      selectedTableId,
    ],
  );

  return <AstralWorldContext.Provider value={value}>{children}</AstralWorldContext.Provider>;
}

export function useAstralWorld() {
  const ctx = useContext(AstralWorldContext);
  if (!ctx) throw new Error('useAstralWorld must be used within AstralWorldProvider');
  return ctx;
}
