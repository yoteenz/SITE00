import { normalizeAccessCredentialCode } from '../../config/access-credentials';
import { CredentialAccessShell } from './CredentialAccessShell';
import type { Site00AccessCredentialPublicView } from '../../config/access-credentials';

type AccessCredentialPanelsProps = {
  view: Site00AccessCredentialPublicView;
  onEnter: () => void;
  entering?: boolean;
};

export function AccessCredentialRecognizedPanel({ view, onEnter, entering }: AccessCredentialPanelsProps) {
  return (
    <CredentialAccessShell
      credentialCode={view.credentialCode}
      view={view}
      variant="recognized"
      onEnter={onEnter}
      entering={entering}
    />
  );
}

export function AccessCredentialNotRecognizedPanel({ credentialId }: { credentialId: string }) {
  const code = normalizeAccessCredentialCode(credentialId) ?? credentialId;
  return <CredentialAccessShell credentialCode={code} variant="not_found" />;
}

export function AccessCredentialClosedPanel({ credentialId, onEnterPublic }: { credentialId: string; onEnterPublic: () => void }) {
  const code = normalizeAccessCredentialCode(credentialId) ?? credentialId;
  return (
    <CredentialAccessShell credentialCode={code} variant="closed" onEnter={onEnterPublic} />
  );
}

export function AccessCredentialInactivePanel({ credentialId }: { credentialId: string }) {
  const code = normalizeAccessCredentialCode(credentialId) ?? credentialId;
  return <CredentialAccessShell credentialCode={code} variant="inactive" />;
}
