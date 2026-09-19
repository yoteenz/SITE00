import type { CSSProperties } from 'react';
import { useProjectPresenceAccent } from '../../hooks/useProjectPresenceAccent';
import { evaluateProjectPresenceContrast } from '../../../../shared/site00-studio-world-production/projectPresenceAccent/index.js';

export type Site00DiamondMode = 'HOST_DEFAULT' | 'PROJECT_CONTEXT';

type Site00DiamondProps = {
  mode?: Site00DiamondMode;
  projectSlug?: string | null;
  className?: string;
  style?: CSSProperties;
};

/**
 * SITE 00 presence diamond — host red by default; inherits active project primary in project context.
 */
export function Site00Diamond({ mode = 'PROJECT_CONTEXT', projectSlug, className, style }: Site00DiamondProps) {
  const presence = useProjectPresenceAccent({
    projectSlug: mode === 'HOST_DEFAULT' ? null : projectSlug,
  });

  const contrast = evaluateProjectPresenceContrast(presence.resolvedColor);
  const useKeyline = contrast.useKeyline;

  const diamondStyle: CSSProperties = {
    ...style,
    ...(mode === 'HOST_DEFAULT'
      ? {}
      : {
          background: presence.resolvedColor,
          boxShadow: useKeyline ? '0 0 0 1px rgba(0,0,0,0.12)' : undefined,
        }),
  };

  return (
    <span
      className={['site00-diamond', className].filter(Boolean).join(' ')}
      style={diamondStyle}
      aria-hidden="true"
      data-presence-source={presence.source}
      data-presence-project={presence.projectId ?? 'host'}
    />
  );
}
