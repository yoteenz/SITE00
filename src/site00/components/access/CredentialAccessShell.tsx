import { useEffect } from 'react';
import { useSite00OriginWideViewport } from '../shell/useSite00OriginWideViewport';
import { CredentialAccessDesktop } from './CredentialAccessDesktop';
import { CredentialAccessMobile } from './CredentialAccessMobile';
import { accessReticleUrl } from './AccessReticle';
import type { Site00AccessCredentialPublicView } from '../../config/access-credentials';

export type CredentialAccessShellProps = {
  credentialCode: string;
  view?: Site00AccessCredentialPublicView;
  variant: 'recognized' | 'not_found' | 'closed' | 'inactive';
  onEnter?: () => void;
  entering?: boolean;
};

/** Responsive access credential presentation — independent desktop/mobile compositions. */
export function CredentialAccessShell(props: CredentialAccessShellProps) {
  const isWide = useSite00OriginWideViewport();

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = accessReticleUrl;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  if (isWide) {
    return <CredentialAccessDesktop {...props} />;
  }

  return <CredentialAccessMobile {...props} />;
}
