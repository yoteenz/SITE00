/**
 * P0.VR.8R3R5R1 / P0.VR.MOF.R2 — MORE tab hub + child tool pages.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { listInstructionPresets } from './designAssetJobApi';
import { fetchFalProviderHealth } from './designAssetReconstructionApi';
import type { DesignInstructionPreset } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr5/browserClient.js';
import { DesignMoreSystemHub } from './DesignMoreSystemHub';
import { DesignChildExperiencePanel } from './DesignChildExperiencePanel';
import { DesignTaskWizardShell } from './wizard/DesignTaskWizardShell';
import { DesignMoreCapturePage } from './more/DesignMoreCapturePage';
import { DesignMoreSystemPage } from './more/DesignMoreSystemPage';
import { DesignMoreProvidersPage } from './more/DesignMoreProvidersPage';
import { DesignMoreRouteAuditPage } from './more/DesignMoreRouteAuditPage';
import { DesignMoreStoragePage } from './more/DesignMoreStoragePage';
import { DesignMoreAutomationPage } from './more/DesignMoreAutomationPage';
import { DesignMorePresetsPage } from './more/DesignMorePresetsPage';
import type { ProjectCaptureRefreshState } from './usePageMirror';
import {
  MORE_CATEGORIES,
  normalizeMoreCategory,
  type MoreCategory,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr8r3r1/designWizardSteps.js';
import '../../styles/site00-design-more-hub.css';
import '../../styles/site00-design-more-tool.css';

type Props = {
  projectId: string;
  onOpenInspect?: () => void;
  onCaptureScreen?: () => void;
  onMatchReference?: () => void;
  moreCategory?: string;
  onMoreCategoryChange?: (category: MoreCategory) => void;
  captureRefresh?: ProjectCaptureRefreshState;
  recentActivityCount?: number;
  onTestWorker?: () => void | Promise<boolean | void>;
  onGoToPages?: () => void;
};

export function DesignMoreTab({
  projectId,
  onOpenInspect,
  onCaptureScreen,
  onMatchReference,
  moreCategory: moreCategoryProp,
  onMoreCategoryChange,
  captureRefresh,
  recentActivityCount = 0,
  onTestWorker,
  onGoToPages,
}: Props) {
  const [presets, setPresets] = useState<DesignInstructionPreset[]>([]);
  const [falAvailable, setFalAvailable] = useState<boolean | null>(null);
  const [localCategory, setLocalCategory] = useState<MoreCategory>('landing');

  const activeCategory = moreCategoryProp ? normalizeMoreCategory(moreCategoryProp) : localCategory;

  useEffect(() => {
    if (moreCategoryProp) setLocalCategory(normalizeMoreCategory(moreCategoryProp));
  }, [moreCategoryProp]);

  useEffect(() => {
    void listInstructionPresets().then((res) => {
      if (res.presets) setPresets(res.presets);
    });
    void fetchFalProviderHealth().then((res) => {
      const health = res.health as { liveDispatchAllowed?: boolean } | undefined;
      setFalAvailable(health?.liveDispatchAllowed ?? null);
    });
  }, []);

  const goTo = (category: MoreCategory | 'child-experience') => {
    if (category === 'child-experience') {
      onMoreCategoryChange?.('child-experience' as MoreCategory);
      return;
    }
    setLocalCategory(category);
    onMoreCategoryChange?.(category);
  };

  const backToLanding = () => goTo('landing');
  const automationOn = true;

  if (moreCategoryProp === 'child-experience') {
    return (
      <section className="site00-dw-v3-more site00-dw-wizard-host" data-design-tab="more" data-more-category="child-experience">
        <DesignTaskWizardShell
          stepTitle="CHILD EXPERIENCE"
          headline="LINKAGE MATRIX"
          support="Experience ✓ and Wiring ✓ required for CURRENT status."
          onBack={() => goTo('landing')}
          transitionKey="more-child-experience"
        >
          <DesignChildExperiencePanel projectSlug={projectId} />
        </DesignTaskWizardShell>
      </section>
    );
  }

  if (activeCategory === 'landing') {
    return (
      <div className="site00-dw-v3-more site00-dw-wizard-host">
        <DesignMoreSystemHub
          onSelectCategory={goTo}
          onOpenChildExperience={() => goTo('child-experience')}
          falAvailable={falAvailable}
          presetCount={presets.length}
          automationOn={automationOn}
          captureRefresh={captureRefresh}
          recentActivityCount={recentActivityCount}
        />
      </div>
    );
  }

  const childShell = (category: MoreCategory, content: ReactNode) => (
    <section className="site00-dw-v3-more site00-dw-wizard-host" data-design-tab="more" data-more-category={category}>
      {content}
    </section>
  );

  if (activeCategory === 'providers') {
    return childShell('providers', <DesignMoreProvidersPage onBack={backToLanding} falAvailable={falAvailable} />);
  }

  if (activeCategory === 'capture') {
    return childShell(
      'capture',
      <DesignMoreCapturePage
        projectId={projectId}
        onBack={backToLanding}
        captureRefresh={captureRefresh}
        onTestWorker={onTestWorker}
        onGoToPages={onGoToPages}
      />,
    );
  }

  if (activeCategory === 'route-audit') {
    return childShell('route-audit', <DesignMoreRouteAuditPage projectId={projectId} onBack={backToLanding} />);
  }

  if (activeCategory === 'storage') {
    return childShell('storage', <DesignMoreStoragePage onBack={backToLanding} />);
  }

  if (activeCategory === 'automation') {
    return childShell('automation', <DesignMoreAutomationPage onBack={backToLanding} />);
  }

  if (activeCategory === 'presets') {
    return childShell('presets', <DesignMorePresetsPage onBack={backToLanding} presets={presets} />);
  }

  if (activeCategory === 'system') {
    return childShell(
      'system',
      <DesignMoreSystemPage
        onBack={backToLanding}
        captureRefresh={captureRefresh}
        falAvailable={falAvailable}
        onOpenInspect={onOpenInspect}
        recentActivityCount={recentActivityCount}
        onCaptureScreen={onCaptureScreen}
        onMatchReference={onMatchReference}
      />,
    );
  }

  return null;
}

export { MORE_CATEGORIES };
