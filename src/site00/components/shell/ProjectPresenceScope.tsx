import type { CSSProperties, ReactNode } from 'react';
import { useProjectPresenceCssVars } from '../../hooks/useProjectPresenceAccent';

type ProjectPresenceScopeProps = {
  children: ReactNode;
  projectSlug?: string | null;
  className?: string;
  style?: CSSProperties;
};

/**
 * Scopes --site00-project-presence-accent to active project context.
 * Host red remains on --site00-host-accent.
 */
export function ProjectPresenceScope({ children, projectSlug, className, style }: ProjectPresenceScopeProps) {
  const vars = useProjectPresenceCssVars({ projectSlug });
  return (
    <div
      className={className}
      style={{ ...vars, ...style } as CSSProperties}
      data-project-presence={projectSlug ?? vars['--site00-project-presence-accent'] ? 'active' : 'host'}
    >
      {children}
    </div>
  );
}
