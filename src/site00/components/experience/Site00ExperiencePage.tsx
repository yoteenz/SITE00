/**
 * P0.VR.3G — ExperiencePage information family shell.
 */

import type { ReactNode } from 'react';
import { Site00PublicShell } from '../shell/Site00PublicShell';
import { Site00ComposerDraftBanner } from './Site00ComposerDraftBanner';

type Props = {
  pageClassName: string;
  pageLabel: string;
  children: ReactNode;
  previewOnly?: boolean;
};

export function Site00ExperiencePage({ pageClassName, pageLabel, children, previewOnly = true }: Props) {
  return (
    <Site00PublicShell>
      <div className={`site00-page ${pageClassName}`} data-experience-page="information">
        {previewOnly ? <Site00ComposerDraftBanner pageLabel={pageLabel} /> : null}
        {children}
      </div>
    </Site00PublicShell>
  );
}
