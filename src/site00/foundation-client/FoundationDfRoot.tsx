import type { ReactNode } from 'react';
import './foundationDfStyles';
import { DfFrame, type DfObjectKind } from './shell';
import type { DfView } from './model';

/** Standard full-viewport DF chrome (header, gutter, footer). */
export function FoundationDfRoot({
  children,
  object = 'corner',
  view = null,
  state,
  screenClassName,
  onMenu,
  menuOpen,
}: {
  children: ReactNode;
  object?: DfObjectKind;
  view?: DfView | null;
  state?: string;
  screenClassName?: string;
  onMenu?: () => void;
  menuOpen?: boolean;
}) {
  return (
    <div className="df-root">
      <DfFrame
        view={view}
        object={object}
        state={state}
        screenClassName={screenClassName}
        onMenu={onMenu}
        menuOpen={menuOpen}
      >
        {children}
      </DfFrame>
    </div>
  );
}
