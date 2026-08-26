import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CoffeeShopTable, EnergyState, TakeMeSomewhereIntent, UserPresence } from '../../../../shared/site00-astral-world/types.js';
import {
  DISTRICT_OCCUPANCY,
  PROTOTYPE_FRIENDS,
  PROTOTYPE_JOURNEY,
  PROTOTYPE_KIOSKS,
  PROTOTYPE_NOTIFICATIONS,
  PROTOTYPE_READERS,
  PROTOTYPE_TABLES,
} from '../../../../shared/site00-astral-world/fixtures.js';
import {
  createInitialUserPresence,
  joinTable,
  leaveTable,
  updateUserPresence,
  visibleFriends,
} from '../../../../shared/site00-astral-world/presenceService.js';
import { routeTakeMeSomewhere } from '../../../../shared/site00-astral-world/takeMeSomewhereRouter.js';

type AstralWorldContextValue = {
  userPresence: UserPresence;
  energy: EnergyState;
  tables: CoffeeShopTable[];
  notifications: typeof PROTOTYPE_NOTIFICATIONS;
  setEnergy: (e: EnergyState) => void;
  checkIn: () => void;
  joinHerTable: (tableId: string) => string | null;
  leaveCurrentTable: () => void;
  takeMeSomewhere: (intent: TakeMeSomewhereIntent) => ReturnType<typeof routeTakeMeSomewhere>;
  markNotificationRead: (id: string) => void;
  friends: typeof PROTOTYPE_FRIENDS;
  readers: typeof PROTOTYPE_READERS;
  kiosks: typeof PROTOTYPE_KIOSKS;
  journey: typeof PROTOTYPE_JOURNEY;
  occupancy: typeof DISTRICT_OCCUPANCY;
};

const AstralWorldContext = createContext<AstralWorldContextValue | null>(null);

export function AstralWorldProvider({ children }: { children: ReactNode }) {
  const [userPresence, setUserPresence] = useState(createInitialUserPresence);
  const [energy, setEnergy] = useState<EnergyState>('ALIGNED_OPEN');
  const [tables, setTables] = useState<CoffeeShopTable[]>(() => [...PROTOTYPE_TABLES]);
  const [notifications, setNotifications] = useState([...PROTOTYPE_NOTIFICATIONS]);

  const checkIn = useCallback(() => {
    setUserPresence((p) => updateUserPresence(p, { state: 'IN_WORLD', district: 'astrea' }));
  }, []);

  const joinHerTable = useCallback(
    (tableId: string) => {
      const result = joinTable(tables, tableId, userPresence.userId);
      if (result.error) return result.error;
      setTables(result.tables);
      setUserPresence((p) =>
        updateUserPresence(p, {
          state: 'AT_TABLE',
          district: 'astrea',
          destination: 'coffee-shop',
          tableId,
          activity: 'At table',
        }),
      );
      return null;
    },
    [tables, userPresence.userId],
  );

  const leaveCurrentTable = useCallback(() => {
    if (!userPresence.tableId) return;
    setTables((prev) => leaveTable(prev, userPresence.tableId!, userPresence.userId));
    setUserPresence((p) =>
      updateUserPresence(p, { state: 'AT_DESTINATION', tableId: null, activity: null }),
    );
  }, [userPresence.tableId, userPresence.userId]);

  const takeMeSomewhere = useCallback((intent: TakeMeSomewhereIntent) => routeTakeMeSomewhere(intent), []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const value = useMemo<AstralWorldContextValue>(
    () => ({
      userPresence,
      energy,
      tables,
      notifications,
      setEnergy,
      checkIn,
      joinHerTable,
      leaveCurrentTable,
      takeMeSomewhere,
      markNotificationRead,
      friends: visibleFriends(userPresence.privacy) as typeof PROTOTYPE_FRIENDS,
      readers: PROTOTYPE_READERS,
      kiosks: PROTOTYPE_KIOSKS,
      journey: PROTOTYPE_JOURNEY,
      occupancy: DISTRICT_OCCUPANCY,
    }),
    [userPresence, energy, tables, notifications, checkIn, joinHerTable, leaveCurrentTable, takeMeSomewhere, markNotificationRead],
  );

  return <AstralWorldContext.Provider value={value}>{children}</AstralWorldContext.Provider>;
}

export function useAstralWorld() {
  const ctx = useContext(AstralWorldContext);
  if (!ctx) throw new Error('useAstralWorld must be used within AstralWorldProvider');
  return ctx;
}
