/**
 * P0.VR.3M.1 — Host menu state (notification / overflow mutual exclusion).
 */

import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import type { DesignHostMenu } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3m1/client.js';

function useResponsiveAnchor(
  mobileRef: RefObject<HTMLButtonElement | null>,
  desktopRef: RefObject<HTMLButtonElement | null>,
): RefObject<HTMLElement | null> {
  const anchorRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const sync = () => {
      const desktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
      anchorRef.current = (desktop ? desktopRef.current : mobileRef.current) ?? desktopRef.current ?? mobileRef.current;
    };
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [desktopRef, mobileRef]);

  return anchorRef;
}

export function useDesignWorkspaceHostMenus() {
  const [activeHostMenu, setActiveHostMenu] = useState<DesignHostMenu>('NONE');
  const notifyMobileRef = useRef<HTMLButtonElement>(null);
  const notifyDesktopRef = useRef<HTMLButtonElement>(null);
  const overflowMobileRef = useRef<HTMLButtonElement>(null);
  const overflowDesktopRef = useRef<HTMLButtonElement>(null);

  const notifyAnchorRef = useResponsiveAnchor(notifyMobileRef, notifyDesktopRef);
  const overflowAnchorRef = useResponsiveAnchor(overflowMobileRef, overflowDesktopRef);

  const toggleNotifications = useCallback(() => {
    setActiveHostMenu((current) => (current === 'NOTIFICATIONS' ? 'NONE' : 'NOTIFICATIONS'));
  }, []);

  const toggleOverflow = useCallback(() => {
    setActiveHostMenu((current) => (current === 'OVERFLOW' ? 'NONE' : 'OVERFLOW'));
  }, []);

  const closeHostMenu = useCallback(() => {
    setActiveHostMenu('NONE');
  }, []);

  return {
    activeHostMenu,
    notifyMobileRef,
    notifyDesktopRef,
    overflowMobileRef,
    overflowDesktopRef,
    notifyAnchorRef,
    overflowAnchorRef,
    toggleNotifications,
    toggleOverflow,
    closeHostMenu,
    notificationOpen: activeHostMenu === 'NOTIFICATIONS',
    overflowOpen: activeHostMenu === 'OVERFLOW',
  };
}
