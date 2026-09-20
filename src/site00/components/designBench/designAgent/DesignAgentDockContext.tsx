import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { TodIconCube } from '../opusDirect/TwinOpusDirectIcons';

const GROK_CLOSE_EVENT = 'site00:design-grok-close';

type DesignAgentDockContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const DesignAgentDockContext = createContext<DesignAgentDockContextValue | null>(null);

export function DesignAgentDockProvider({ children }: { children: ReactNode }) {
  const [open, setOpenState] = useState(false);
  const setOpen = useCallback((next: boolean) => {
    setOpenState(next);
    if (next) window.dispatchEvent(new CustomEvent(GROK_CLOSE_EVENT));
  }, []);
  const toggle = useCallback(() => setOpen(!open), [open, setOpen]);
  const value = useMemo(() => ({ open, setOpen, toggle }), [open, setOpen, toggle]);
  return <DesignAgentDockContext.Provider value={value}>{children}</DesignAgentDockContext.Provider>;
}

export function useDesignAgentDock(): DesignAgentDockContextValue {
  const ctx = useContext(DesignAgentDockContext);
  if (!ctx) {
    return {
      open: false,
      setOpen: () => undefined,
      toggle: () => undefined,
    };
  }
  return ctx;
}

/** Compact workspace control — opens the production agent panel. */
export function DesignAgentOpenButton(props: { className?: string; interactionId?: string }) {
  const { toggle, open } = useDesignAgentDock();
  const compact = props.className?.includes('tod-agent-iconBtn');
  return (
    <button
      type="button"
      className={`${props.className ?? 'tod-agent-open'}${open ? ' is-open' : ''}`}
      aria-expanded={open}
      aria-controls="s00-dad-panel"
      aria-label={open ? 'Close Opus design agent panel' : 'Open Opus design agent'}
      title={open ? 'Close Opus design agent panel' : 'Open Opus design agent'}
      data-testid="design-agent-open"
      data-interaction-id={props.interactionId ?? 'view-row-opus'}
      onClick={toggle}
    >
      {compact ?
        <>
          <TodIconCube className="tod-ico tod-agent-iconBtn__ico" />
          <span className="tod-agent-iconBtn__label">OPUS</span>
        </>
      : open ?
        'OPUS · OPEN'
      : 'OPUS'}
    </button>
  );
}
