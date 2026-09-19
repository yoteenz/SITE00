/**
 * P0.VR.3L — Shell propagation scope selector + blast radius preview.
 */

import { useState } from 'react';
import type { ShellPropagationImpact, ShellPropagationScope } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3l/browserClient.js';
import { buildPropagationScopeFromUi, shellPropagationNeedsConfirmation } from './DesignMissingTargetQueue.js';

type Props = {
  shellId: string;
  projectId: 'SITE00' | 'NDXBOOK';
  familyId: string;
  targetId: string;
  impact: ShellPropagationImpact;
  onClose: () => void;
};

export function DesignShellPropagationPanel({ shellId, projectId, familyId, targetId, impact, onClose }: Props) {
  const [targetOnly, setTargetOnly] = useState(true);
  const [family, setFamily] = useState(false);
  const [global, setGlobal] = useState(false);

  const effectiveScope = buildPropagationScopeFromUi({ targetOnly, family, global });

  function selectScope(scope: ShellPropagationScope) {
    setTargetOnly(scope === 'TARGET_ONLY');
    setFamily(scope === 'DESIGN_FAMILY');
    setGlobal(scope === 'SHARED_SHELL_GLOBAL');
  }

  return (
    <div className="site00-dw-shell-propagation" data-visual-reconstruction="p0vr3l-shell-propagation">
      <header>
        <h3>SHELL CHANGE SCOPE</h3>
        <button type="button" onClick={onClose}>
          CLOSE
        </button>
      </header>

      <fieldset className="site00-dw-shell-propagation__scopes">
        <label>
          <input
            type="radio"
            name="shell-scope"
            checked={targetOnly}
            onChange={() => selectScope('TARGET_ONLY')}
          />
          THIS TARGET ONLY
        </label>
        <label>
          <input
            type="radio"
            name="shell-scope"
            checked={family}
            onChange={() => selectScope('DESIGN_FAMILY')}
          />
          UPDATE THIS DESIGN FAMILY
        </label>
        <label>
          <input
            type="radio"
            name="shell-scope"
            checked={global}
            onChange={() => selectScope('SHARED_SHELL_GLOBAL')}
          />
          UPDATE EVERY PAGE USING THIS SHELL
        </label>
      </fieldset>

      <p className="site00-dw-shell-propagation__blast">{impact.blastRadiusSummary}</p>
      <p>
        Affected pages: {impact.pages.concat(impact.materialScreens).join(', ') || targetId}
      </p>
      <p>Shell: {shellId} · Family: {familyId} · Project: {projectId}</p>

      {shellPropagationNeedsConfirmation(effectiveScope) && (
        <p className="site00-dw-shell-propagation__warn">Founder confirmation required before commit.</p>
      )}

      <div className="site00-dw-shell-propagation__actions">
        <button type="button" disabled>
          APPROVE TARGET
        </button>
        <button type="button" disabled={shellPropagationNeedsConfirmation(effectiveScope)}>
          APPROVE SHELL PROPAGATION
        </button>
        <button type="button">REQUEST CHANGES</button>
      </div>
    </div>
  );
}
