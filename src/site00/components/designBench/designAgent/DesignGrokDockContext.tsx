import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useDesignGrokEligibility } from '../opusDirect/DesignGrokEligibilityProvider';
import { TodIconBurst, TodIconLock } from '../opusDirect/TwinOpusDirectIcons';
import { useDesignAgentDock } from './DesignAgentDockContext';

const GROK_CLOSE_EVENT = 'site00:design-grok-close';

type DesignGrokDockContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const DesignGrokDockContext = createContext<DesignGrokDockContextValue | null>(null);

export function DesignGrokDockProvider({ children }: { children: ReactNode }) {
  const opus = useDesignAgentDock();
  const [open, setOpenState] = useState(false);

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenState(next);
      if (next) opus.setOpen(false);
    },
    [opus],
  );

  const toggle = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  useEffect(() => {
    const close = () => setOpenState(false);
    window.addEventListener(GROK_CLOSE_EVENT, close);
    return () => window.removeEventListener(GROK_CLOSE_EVENT, close);
  }, []);

  useEffect(() => {
    const openDock = () => setOpen(true);
    window.addEventListener('site00:design-grok-asset-plan-approved', openDock);
    return () => window.removeEventListener('site00:design-grok-asset-plan-approved', openDock);
  }, [setOpen]);

  const value = useMemo(() => ({ open, setOpen, toggle }), [open, setOpen, toggle]);
  return <DesignGrokDockContext.Provider value={value}>{children}</DesignGrokDockContext.Provider>;
}

export function useDesignGrokDock(): DesignGrokDockContextValue {
  const ctx = useContext(DesignGrokDockContext);
  if (!ctx) {
    return { open: false, setOpen: () => undefined, toggle: () => undefined };
  }
  return ctx;
}

/** Must render inside DesignAgentDockProvider + DesignGrokDockProvider. */
export function DesignGrokOpenButton(props: { className?: string }) {
  const { toggle, open } = useDesignGrokDock();
  const { eligibility } = useDesignGrokEligibility();
  const gated = !eligibility.canGenerateProductionAssets;
  const title =
    gated ?
      `Grok · ${eligibility.shortReason}${eligibility.nextAction ? ` · ${eligibility.nextAction}` : ''}`
    : 'Open Grok asset agent';
  return (
    <button
      type="button"
      className={`${props.className ?? 'tod-agent-iconBtn tod-agent-iconBtn--grok'}${open ? ' is-open' : ''}${gated ? ' is-gated' : ''}`}
      aria-expanded={open}
      aria-controls="s00-grok-panel"
      aria-label={gated ? `Grok asset agent locked: ${eligibility.shortReason}` : 'Open Grok asset agent'}
      title={title}
      data-testid="design-grok-open"
      data-interaction-id="view-row-grok"
      data-grok-eligibility={eligibility.eligibility}
      onClick={toggle}
    >
      <TodIconBurst className="tod-ico tod-agent-iconBtn__ico" />
      <span className="tod-agent-iconBtn__label">GROK</span>
      {gated ? <TodIconLock className="tod-ico tod-agent-iconBtn__lock" /> : null}
    </button>
  );
}
