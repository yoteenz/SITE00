/**
 * P0.VR.3G — ExperiencePage auth family shell.
 */

import type { ReactNode } from 'react';
import { Site00AuthShell } from '../auth/Site00AuthShell';
import { Site00ComposerDraftBanner } from './Site00ComposerDraftBanner';

type Props = {
  pageLabel: string;
  variant?: 'sign-in' | 'create-account';
  children?: ReactNode;
  previewOnly?: boolean;
};

export function Site00AuthExperiencePage({ pageLabel, variant = 'sign-in', children, previewOnly = true }: Props) {
  return (
    <div className="site00-auth-experience" data-experience-page="auth">
      {previewOnly ? <Site00ComposerDraftBanner pageLabel={pageLabel} /> : null}
      <Site00AuthShell variant={variant}>{children}</Site00AuthShell>
    </div>
  );
}
