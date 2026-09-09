/**
 * SKINS child-surface flow — add → registered → implement → visual QA.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  fetchAuthorityPrefill,
  implementScreenAuthority,
  registerScreenAuthority,
} from '../../brandFamilySkin/brandFamilySkinApi.js';
import type { StandardScreenType } from '../../../../../shared/site00-brand-lore/projectSkin/brandFamily/types.js';
import {
  IMPLEMENTATION_STAGES,
  type ImplementationStage,
} from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6/skinsChildSurface.js';
import { SkinAuthorityContract } from './SkinAuthorityContract.js';
import { SkinAuthorityStatus } from './SkinAuthorityStatus.js';
import { SkinContextHeader } from './SkinContextHeader.js';
import { SkinImplementationProgress } from './SkinImplementationProgress.js';
import { SkinPrimaryActions } from './SkinPrimaryActions.js';
import { SkinReferenceUpload } from './SkinReferenceUpload.js';
import { SkinVersionTimeline, type AuthorityVersion } from './SkinVersionTimeline.js';
import { SkinViewportControl } from './SkinViewportControl.js';
import { SkinVisualQaViewer } from './SkinVisualQaViewer.js';
import { SkinWorkspaceSheet } from './SkinWorkspaceSheet.js';
import type { DriftFinding } from './SkinDriftSummary.js';

type Viewport = 'MOBILE' | 'TABLET' | 'DESKTOP';

export type SkinFlowStep =
  | 'add'
  | 'registered'
  | 'implement'
  | 'progress'
  | 'visual_qa'
  | 'replace'
  | 'version_history';

type AuthorityRecord = {
  moduleId: string;
  screenType: string;
  viewport: string;
  version: string;
  authorityMode: string;
  fidelityMode: string;
  status: string;
  implementationStatus: string;
  visualMatchStatus: string;
  referenceAssetId: string | null;
};

type Props = {
  open: boolean;
  brandFamilySkinId: string;
  packScreenType: StandardScreenType;
  projectId: string;
  brandName: string;
  screenNum: string;
  screenLabel: string;
  accentColor?: string | null;
  initialStep?: SkinFlowStep;
  existingAuthority?: AuthorityRecord | null;
  onClose: () => void;
  onComplete: () => void;
};

const SAMPLE_DRIFT: DriftFinding[] = [
  { region: 'SHELL', detail: '+12PX Y DRIFT', severity: 'MAJOR' },
  { region: 'PREVIEW', detail: '-18PX WIDTH', severity: 'MAJOR' },
  { region: 'TYPE', detail: '2PX LARGE', severity: 'MINOR' },
];

export function SkinAuthorityFlow({
  open,
  brandFamilySkinId,
  packScreenType,
  projectId,
  brandName,
  screenNum,
  screenLabel,
  accentColor,
  initialStep = 'add',
  existingAuthority,
  onClose,
  onComplete,
}: Props) {
  const [step, setStep] = useState<SkinFlowStep>(initialStep);
  const [viewport, setViewport] = useState<Viewport>('MOBILE');
  const [referenceAssetId, setReferenceAssetId] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [founderNote, setFounderNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [registeredAuthority, setRegisteredAuthority] = useState<AuthorityRecord | null>(existingAuthority ?? null);
  const [progressStage, setProgressStage] = useState<ImplementationStage>('PREPARING');
  const [matchStatus, setMatchStatus] = useState<'DRIFT' | 'HIGH_MATCH' | 'VERIFIED'>('DRIFT');
  const [iteration, setIteration] = useState(1);

  const [prefill, setPrefill] = useState<{
    moduleId: string;
    screenType: string;
    screenLabel: string;
    defaultViewport: Viewport;
  } | null>(null);
  const [contractPreview, setContractPreview] = useState<{
    keepFunction: boolean;
    rebuildLook: boolean;
    protectCurrentVisuals: boolean;
    screenshotQaRequired: boolean;
    visualConvergenceRequired: boolean;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep(initialStep);
    setRegisteredAuthority(existingAuthority ?? null);
    if (existingAuthority?.referenceAssetId) {
      setReferenceAssetId(existingAuthority.referenceAssetId);
    }
  }, [open, initialStep, existingAuthority]);

  useEffect(() => {
    if (!open) return;
    void fetchAuthorityPrefill(brandFamilySkinId, packScreenType).then((res) => {
      if (res.prefill) {
        setPrefill(res.prefill);
        setViewport(res.prefill.defaultViewport ?? 'MOBILE');
      }
      if (res.contractPreview) setContractPreview(res.contractPreview);
    });
  }, [open, brandFamilySkinId, packScreenType]);

  const breadcrumb = useMemo(
    () => `DESIGN → SKINS → ${brandName} → ${screenLabel}`,
    [brandName, screenLabel],
  );

  const titleForStep: Record<SkinFlowStep, string> = {
    add: 'ADD SCREEN AUTHORITY',
    registered: 'AUTHORITY REGISTERED',
    implement: 'IMPLEMENT SCREEN',
    progress: 'IMPLEMENTATION STATUS',
    visual_qa: 'VISUAL QA',
    replace: 'REPLACE AUTHORITY',
    version_history: 'VERSION HISTORY',
  };

  async function handleRegister() {
    if (!referenceAssetId.trim()) return;
    setSubmitting(true);
    try {
      const res = (await registerScreenAuthority({
        brandFamilySkinId,
        packScreenType,
        moduleId: prefill?.moduleId,
        screenType: prefill?.screenType,
        viewport,
        referenceAssetId: referenceAssetId.trim(),
        projectId,
        founderNote: founderNote.trim() || undefined,
      })) as {
        ok?: boolean;
        authority?: AuthorityRecord;
      };
      if (res.ok && res.authority) {
        setRegisteredAuthority(res.authority);
        setStep('registered');
      } else if (res.ok) {
        setRegisteredAuthority({
          moduleId: prefill?.moduleId ?? 'PROJECTS',
          screenType: prefill?.screenType ?? 'OVERVIEW',
          viewport,
          version: '1.0',
          authorityMode: 'DESIGN_AUTHORITY',
          fidelityMode: 'EXACT',
          status: 'APPROVED',
          implementationStatus: 'NOT_STARTED',
          visualMatchStatus: 'NOT_EVALUATED',
          referenceAssetId: referenceAssetId.trim(),
        });
        setStep('registered');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function runProgressStages() {
    for (let i = 0; i < IMPLEMENTATION_STAGES.length; i++) {
      setProgressStage(IMPLEMENTATION_STAGES[i]!);
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  async function handleImplement() {
    if (!registeredAuthority) return;
    setStep('progress');
    setProgressStage('PREPARING');
    setSubmitting(true);
    try {
      await runProgressStages();
      await implementScreenAuthority({
        brandFamilySkinId,
        moduleId: registeredAuthority.moduleId,
        screenType: registeredAuthority.screenType,
        viewport: registeredAuthority.viewport as Viewport,
        projectId,
      });
      setStep('visual_qa');
      setMatchStatus('DRIFT');
    } finally {
      setSubmitting(false);
    }
  }

  function handleRunCorrection() {
    if (iteration >= 3) return;
    setIteration((n) => n + 1);
    setMatchStatus(iteration + 1 >= 3 ? 'HIGH_MATCH' : 'DRIFT');
  }

  function handleAcceptMatch() {
    setMatchStatus('VERIFIED');
    onComplete();
  }

  const versionEntries: AuthorityVersion[] = [
    {
      version: registeredAuthority?.version ?? '1.0',
      viewport,
      status: registeredAuthority?.status ?? 'APPROVED',
      date: new Date().toISOString().slice(0, 10),
      thumbnailUrl: previewUrl,
      isCurrent: true,
    },
  ];

  const isAddLike = step === 'add' || step === 'replace';

  const footer =
    isAddLike ? (
      <SkinPrimaryActions
        actions={[
          { label: 'CANCEL', variant: 'outline', onClick: onClose },
          {
            label: submitting ? 'REGISTERING…' : 'REGISTER AUTHORITY',
            variant: 'primary',
            disabled: !referenceAssetId.trim() || submitting,
            onClick: () => void handleRegister(),
          },
        ]}
      />
    ) : step === 'implement' ? (
      <SkinPrimaryActions
        actions={[
          { label: 'CANCEL', variant: 'outline', onClick: onClose },
          { label: 'IMPLEMENT SCREEN', variant: 'primary', disabled: submitting, onClick: () => void handleImplement() },
        ]}
      />
    ) : null;

  const body = (() => {
    if (step === 'registered' && registeredAuthority) {
      return (
        <SkinAuthorityStatus
          brandName={brandName}
          screenNum={screenNum}
          screenLabel={screenLabel}
          moduleId={prefill?.moduleId}
          viewport={registeredAuthority.viewport}
          accentColor={accentColor}
          previewUrl={previewUrl}
          authorityMode={registeredAuthority.authorityMode}
          fidelityMode={registeredAuthority.fidelityMode}
          status={registeredAuthority.status}
          version={registeredAuthority.version}
          onImplement={() => setStep('implement')}
          onViewAuthority={() => setStep('version_history')}
          onReplace={() => setStep('replace')}
        />
      );
    }

    if (step === 'implement' && registeredAuthority) {
      return (
        <div className="site00-dw-skins-flow__implement">
          <SkinContextHeader
            brandName={brandName}
            screenNum={screenNum}
            screenLabel={screenLabel}
            moduleId={prefill?.moduleId}
            viewport={registeredAuthority.viewport}
            accentColor={accentColor}
          />
          <div className="site00-dw-skins-flow__contract-cards">
            <div className="site00-dw-skins-flow__info-row">
              <span>SCREEN</span>
              <strong>{screenLabel}</strong>
            </div>
            <div className="site00-dw-skins-flow__info-row">
              <span>VIEWPORT</span>
              <strong>{registeredAuthority.viewport}</strong>
            </div>
            <div className="site00-dw-skins-flow__info-row">
              <span>AUTHORITY VERSION</span>
              <strong>V{registeredAuthority.version}</strong>
            </div>
            <div className="site00-dw-skins-flow__info-row">
              <span>TARGET PROJECT</span>
              <strong>{projectId.toUpperCase()}</strong>
            </div>
            <div className="site00-dw-skins-flow__info-row">
              <span>TARGET ROUTE</span>
              <strong>/PROJECTS/{screenLabel}</strong>
            </div>
          </div>
          <SkinAuthorityContract contract={contractPreview} />
        </div>
      );
    }

    if (step === 'progress') {
      return <SkinImplementationProgress currentStage={progressStage} />;
    }

    if (step === 'visual_qa') {
      return (
        <SkinVisualQaViewer
          referenceUrl={previewUrl}
          liveUrl={previewUrl}
          overlayUrl={previewUrl}
          diffUrl={previewUrl}
          matchStatus={matchStatus}
          majorCount={3}
          minorCount={5}
          findings={SAMPLE_DRIFT}
          iteration={iteration}
          maxIterations={3}
          onRunCorrection={handleRunCorrection}
          onAcceptMatch={handleAcceptMatch}
          layout={typeof window !== 'undefined' && window.innerWidth >= 960 ? 'desktop' : 'mobile'}
        />
      );
    }

    if (step === 'version_history') {
      return <SkinVersionTimeline versions={versionEntries} />;
    }

    return (
      <div className="site00-dw-skins-flow__add">
        <SkinContextHeader
          brandName={brandName}
          screenNum={screenNum}
          screenLabel={screenLabel}
          moduleId={prefill?.moduleId}
          viewport={viewport}
          accentColor={accentColor}
        />

        <div className="site00-dw-skins-flow__add-grid">
          <div className="site00-dw-skins-flow__add-upload">
            <SkinReferenceUpload
              referenceAssetId={referenceAssetId}
              previewUrl={previewUrl}
              fileName={fileName}
              onSelect={(assetId, file, url) => {
                setReferenceAssetId(`${assetId}/${brandFamilySkinId}/${packScreenType}/${viewport}`);
                setPreviewUrl(url);
                setFileName(file.name.toUpperCase());
              }}
              onRemove={() => {
                setReferenceAssetId('');
                setPreviewUrl(null);
                setFileName(null);
              }}
              disabled={submitting}
            />
          </div>

          <div className="site00-dw-skins-flow__add-side">
            {step === 'replace' && registeredAuthority ? (
              <div className="site00-dw-skins-flow__current">
                <span>CURRENT AUTHORITY</span>
                <strong>V{registeredAuthority.version}</strong>
              </div>
            ) : null}

            <SkinViewportControl value={viewport} onChange={setViewport} />
            <SkinAuthorityContract contract={contractPreview} />

            <label className="site00-dw-skins-flow__note">
              <span>FOUNDER NOTE · OPTIONAL</span>
              <small>ADDITIVE INSTRUCTIONS ONLY</small>
              <textarea
                value={founderNote}
                onChange={(e) => setFounderNote(e.target.value.toUpperCase())}
                placeholder="OPTIONAL CONTEXT FOR THIS AUTHORITY"
                rows={2}
              />
            </label>
          </div>
        </div>
      </div>
    );
  })();

  return (
    <SkinWorkspaceSheet
      open={open}
      title={titleForStep[step]}
      breadcrumb={breadcrumb}
      onClose={onClose}
      footer={footer}
      variant={typeof window !== 'undefined' && window.innerWidth >= 960 ? 'panel' : 'sheet'}
    >
      {body}
    </SkinWorkspaceSheet>
  );
}
