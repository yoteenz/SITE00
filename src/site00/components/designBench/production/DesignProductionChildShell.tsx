import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { useDesignProductionEmbedded } from './DesignProductionEmbeddedContext';
import { useDesignProductionNavigation } from './useDesignProductionNavigation';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function DesignProductionChildShell({ title, subtitle, children }: Props) {
  const embedded = useDesignProductionEmbedded();
  const { workspacePath } = useDesignProductionNavigation();

  if (embedded) {
    return (
      <div className="tod-child-embedded" data-testid="design-production-child-embedded">
        {children}
      </div>
    );
  }

  return (
    <div className="tod-root tod-root--child" data-testid="design-production-child">
      <div className="tod-child">
        <header className="tod-child__head">
          <Link to={workspacePath} className="tod-child__back" data-testid="design-child-back">
            ← WORKSPACE
          </Link>
          <h1 className="tod-child__title">{title}</h1>
          {subtitle ? <p className="tod-child__sub">{subtitle}</p> : null}
        </header>
        <div className="tod-child__body">{children}</div>
      </div>
    </div>
  );
}
