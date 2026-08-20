import { normalizeAccessCredentialCode } from '../../config/access-credentials';
import { CredentialAccessShell } from './CredentialAccessShell';
import type { Site00AccessCredentialPublicView } from '../../config/access-credentials';

type AccessCredentialPanelsProps = {
  view: Site00AccessCredentialPublicView;
  onEnter: () => void;
  entering?: boolean;
  staticAuthorized?: boolean;
  forceLayout?: 'desktop' | 'mobile';
};

export function AccessCredentialRecognizedPanel({
  view,
  onEnter,
  entering,
  staticAuthorized,
  forceLayout,
}: AccessCredentialPanelsProps) {
  return (
    <CredentialAccessShell
      credentialCode={view.credentialCode}
      view={view}
      variant="recognized"
      onEnter={onEnter}
      entering={entering}
      staticAuthorized={staticAuthorized}
      forceLayout={forceLayout}
    />
  );
}

export function AccessCredentialNotRecognizedPanel({
  credentialId,
  staticAuthorized,
  forceLayout,
}: {
  credentialId: string;
  staticAuthorized?: boolean;
  forceLayout?: 'desktop' | 'mobile';
}) {
  const code = normalizeAccessCredentialCode(credentialId) ?? credentialId;
  return (
    <CredentialAccessShell
      credentialCode={code}
      variant="not_found"
      staticAuthorized={staticAuthorized}
      forceLayout={forceLayout}
    />
  );
}

export function AccessCredentialClosedPanel({
  credentialId,
  onEnterPublic,
  staticAuthorized,
  forceLayout,
}: {
  credentialId: string;
  onEnterPublic: () => void;
  staticAuthorized?: boolean;
  forceLayout?: 'desktop' | 'mobile';
}) {
  const code = normalizeAccessCredentialCode(credentialId) ?? credentialId;
  return (
    <CredentialAccessShell
      credentialCode={code}
      variant="closed"
      onEnter={onEnterPublic}
      staticAuthorized={staticAuthorized}
      forceLayout={forceLayout}
    />
  );
}

export function AccessCredentialInactivePanel({
  credentialId,
  staticAuthorized,
  forceLayout,
}: {
  credentialId: string;
  staticAuthorized?: boolean;
  forceLayout?: 'desktop' | 'mobile';
}) {
  const code = normalizeAccessCredentialCode(credentialId) ?? credentialId;
  return (
    <CredentialAccessShell
      credentialCode={code}
      variant="inactive"
      staticAuthorized={staticAuthorized}
      forceLayout={forceLayout}
    />
  );
}
