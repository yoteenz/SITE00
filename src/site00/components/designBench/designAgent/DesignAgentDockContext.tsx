import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type DesignAgentDockContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const DesignAgentDockContext = createContext<DesignAgentDockContextValue | null>(null);

export function DesignAgentDockProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((value) => !value), []);
  const value = useMemo(() => ({ open, setOpen, toggle }), [open, toggle]);
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
export function DesignAgentOpenButton(props: { className?: string }) {
  const { toggle, open } = useDesignAgentDock();
  return (
    <button
      type="button"
      className={`${props.className ?? 'tod-agent-open'}${open ? ' is-open' : ''}`}
      aria-expanded={open}
      aria-controls="s00-dad-panel"
      aria-label={open ? 'Close Opus design agent panel' : 'Open Opus design agent panel'}
      data-testid="design-agent-open"
      data-interaction-id="header-opus"
      onClick={toggle}
    >
      {open ? 'OPUS · OPEN' : 'OPUS'}
    </button>
  );
}
