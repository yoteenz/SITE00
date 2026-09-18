import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

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
  return (
    <button
      type="button"
      className={`${props.className ?? 'tod-agent-iconBtn tod-agent-iconBtn--grok'}${open ? ' is-open' : ''}`}
      aria-expanded={open}
      aria-controls="s00-grok-panel"
      aria-label="Open Grok asset agent"
      title="Open Grok asset agent"
      data-testid="design-grok-open"
      data-interaction-id="view-row-grok"
      onClick={toggle}
    >
      <span className="tod-agent-iconBtn__glyph" aria-hidden="true">
        G
      </span>
    </button>
  );
}
