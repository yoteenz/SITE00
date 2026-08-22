import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSite00OriginWideViewport } from '../shell/useSite00OriginWideViewport';
import { site00OriginMobileLayoutPreviewActive } from '../shell/site00OriginViewport';
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
  /** Skip recognition animation — show final authorized state immediately. */
  staticAuthorized?: boolean;
  /** QA override — force desktop or mobile composition regardless of viewport. */
  forceLayout?: 'desktop' | 'mobile';
};

/** Responsive access credential presentation — independent desktop/mobile compositions. */
export function CredentialAccessShell({
  forceLayout,
  ...props
}: CredentialAccessShellProps) {
  const { search } = useLocation();
  const isWide = useSite00OriginWideViewport();
  const mobilePreview = site00OriginMobileLayoutPreviewActive(search);
  const useDesktop =
    forceLayout === 'desktop'
      ? true
      : forceLayout === 'mobile'
        ? false
        : isWide && !mobilePreview;

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

  if (useDesktop) {
    return <CredentialAccessDesktop {...props} />;
  }

  return <CredentialAccessMobile {...props} />;
}
