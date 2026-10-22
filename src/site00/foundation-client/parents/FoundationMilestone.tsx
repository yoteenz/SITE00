/** Family C — completion milestone (Board 11) and next threshold (Board 12), inside the living portal. */
import { useState } from 'react';
import type { FoundationBuildPathPreference } from '../../../../shared/site00-digital-foundation/builderHandoff.js';
import { FOUNDATION_BUILDER_DEEP_LINK_PATH } from '../../../../shared/site00-digital-foundation/builderHandoff.js';
import type { ClientDigitalFoundationPayload } from '../../../../shared/site00-digital-foundation/clientProjection.js';
import { buildClientRecords } from '../../../../shared/site00-digital-foundation/clientRecords.js';
import {
  foundationCreditDaysLeft,
  foundationCreditDisplay,
  type FoundationCreditDisplay,
} from '../../../../shared/site00-digital-foundation/creditPresentation.js';
import type { ProjectStageCode } from '../../../../shared/site00-digital-foundation/types.js';
import { PLACE_OPTIONS } from '../../builder-experience/spatialStudio/types';
import { captureBuildInterest, createBuilderHandoff } from '../api';
import {
  DfBoardList,
  DfBoardRow,
  DfHonestNote,
  DfKv,
  DfMachine,
  DfPanel,
  DfPill,
  type DfKvRow,
  type DfPillTone,
} from '../boardKit';
import type { DfIconName } from '../icons';
import { formatMoney } from '../model';
import { DfThresholdHero } from '../objects';
import { DF_REVIEW_INERT_MESSAGE, useDfReviewInert } from '../reviewInert';
import { DfCta, DfHeadline, DfLede, DfRail, DfTrust } from '../shell';
import { recordStatusTone } from './ProjectPortal';

function humanize(value: string): string {
  return value.replace(/_/g, ' ').toUpperCase();
}

function stageDone(payload: ClientDigitalFoundationPayload, code: ProjectStageCode): boolean {
  return payload.stages.some((s) => s.stage_code === code && s.status === 'COMPLETE');
}

function longDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

export type FoundationStatusRow = {
  id: string;
  icon: DfIconName;
  title: string;
  sub: { machine: boolean; text: string };
  status: string;
  tone: DfPillTone;
};

/**
 * Board 11 status rows. A row appears only when the project holds evidence for it — an ownership value or a
 * verified stage — so a partially delivered foundation never shows an invented ACTIVE.
 */
export function foundationStatusRows(payload: ClientDigitalFoundationPayload): FoundationStatusRow[] {
  const o = payload.ownership_record;
  const rows: FoundationStatusRow[] = [];
  const pill = (verified: boolean, value: string): { status: string; tone: DfPillTone } =>
    verified ? { status: value, tone: 'ok' } : { status: 'IN PROGRESS', tone: 'neutral' };
  if (o?.domain) {
    rows.push({
      id: 'domain',
      icon: 'domain',
      title: 'DOMAIN',
      sub: { machine: true, text: o.domain },
      ...pill(stageDone(payload, '02_DOMAIN'), 'ACTIVE'),
    });
  }
  if (o?.primary_mailbox) {
    rows.push({
      id: 'email',
      icon: 'email',
      title: 'PROFESSIONAL EMAIL',
      sub: { machine: true, text: o.primary_mailbox },
      ...pill(stageDone(payload, '03_PROFESSIONAL_EMAIL'), 'ACTIVE'),
    });
  }
  if (o?.dns_status) {
    const value = humanize(o.dns_status);
    rows.push({
      id: 'dns',
      icon: 'layers',
      title: 'DNS CONFIGURATION',
      sub: { machine: false, text: 'RECORDS CONFIGURED BY SITE 00' },
      status: value,
      tone: recordStatusTone(value) === 'ok' ? 'ok' : 'neutral',
    });
  }
  if (o?.security_status) {
    const value = humanize(o.security_status);
    rows.push({
      id: 'security',
      icon: 'security',
      title: 'EMAIL SECURITY',
      sub: { machine: false, text: 'SPF, DKIM, DMARC' },
      status: value,
      tone: recordStatusTone(value) === 'ok' ? 'ok' : 'neutral',
    });
  }
  if (o && payload.artifact.completion_state === 'COMPLETE') {
    rows.push({
      id: 'ownership',
      icon: 'document',
      title: 'DIGITAL OWNERSHIP',
      sub: { machine: false, text: (o.owner ?? o.business).toUpperCase() },
      ...pill(stageDone(payload, '06_FINAL_VERIFICATION') || stageDone(payload, '07_FOUNDATION_COMPLETE'), 'VERIFIED'),
    });
  }
  return rows;
}

function recordSummaryRows(payload: ClientDigitalFoundationPayload): DfKvRow[] {
  const o = payload.ownership_record;
  const out: DfKvRow[] = [];
  const completed = longDate(payload.artifact.completed_at);
  if (completed) out.push({ label: 'COMPLETED ON', value: completed, icon: 'calendar' });
  const owner = o?.owner ?? o?.business ?? payload.artifact.intake.business_name ?? null;
  if (owner) out.push({ label: 'OWNER', value: owner.toUpperCase(), icon: 'user' });
  out.push({
    label: 'RECORD STATUS',
    value: payload.artifact.completion_state === 'COMPLETE' ? 'ACTIVE + VERIFIED' : 'IN PROGRESS',
    icon: 'document',
    tone: payload.artifact.completion_state === 'COMPLETE' ? 'ok' : undefined,
  });
  if (o?.administrative_access_model) {
    out.push({ label: 'ACCESS MODEL', value: humanize(o.administrative_access_model), icon: 'link' });
  }
  return out;
}

export function P11FoundationComplete({
  payload,
  onRecords,
  onLocation,
  onOverview,
}: {
  payload: ClientDigitalFoundationPayload;
  onRecords: () => void;
  onLocation: () => void;
  onOverview: () => void;
}) {
  const complete = payload.artifact.completion_state === 'COMPLETE';
  const rows = foundationStatusRows(payload);
  const records = buildClientRecords(payload);
  const categories = [...new Set(records.map((r) => r.category))].filter((c) => c !== 'PAYMENTS' && c !== 'PROJECT');
  return (
    <>
      <DfRail index="11" label="FOUNDATION COMPLETE" />
      <DfHeadline lines={complete ? ['YOUR', 'FOUNDATION', 'IS COMPLETE'] : ['YOUR', 'FOUNDATION', 'IS IN PROGRESS']} />
      <DfLede>
        {complete
          ? 'YOUR DIGITAL INFRASTRUCTURE IS NOW ESTABLISHED, VERIFIED AND IN PRODUCTION. YOU OWN YOUR DOMAIN, EMAIL AND SECURITY.'
          : 'SITE 00 MARKS YOUR FOUNDATION COMPLETE ONLY AFTER FINAL VERIFICATION. YOUR PROJECT OVERVIEW SHOWS WHAT IS LEFT.'}
      </DfLede>
      {rows.length > 0 && (
        <DfPanel>
          <DfBoardList label="FOUNDATION STATUS">
            {rows.map((r) => (
              <DfBoardRow
                key={r.id}
                rowId={`status-${r.id}`}
                icon={r.icon}
                title={r.title}
                sub={r.sub.machine ? <DfMachine>{r.sub.text}</DfMachine> : r.sub.text}
                aside={<DfPill tone={r.tone}>{r.status}</DfPill>}
              />
            ))}
          </DfBoardList>
        </DfPanel>
      )}
      <DfPanel label="RECORD SUMMARY">
        <DfKv rows={recordSummaryRows(payload)} />
      </DfPanel>
      {records.length > 0 && (
        <DfPanel>
          <DfBoardList>
            <DfBoardRow
              rowId="view-records"
              icon="folder"
              title="VIEW RECORDS"
              sub={categories.length ? categories.join(', ') : `${records.length} RECORD${records.length === 1 ? '' : 'S'}`}
              onOpen={onRecords}
            />
          </DfBoardList>
        </DfPanel>
      )}
      <div className="df-actions">
        {records.length > 0 ? (
          <DfCta label="VIEW RECORDS" action="view-records" onClick={onRecords} />
        ) : (
          <DfCta label="BACK TO OVERVIEW" onClick={onOverview} />
        )}
        {complete && <DfCta tone="outline" label="NEXT THRESHOLD" action="next-threshold" onClick={onLocation} />}
      </div>
      <DfTrust text={complete ? 'VERIFIED. DELIVERED. OWNED.' : 'SAFE. SECURE. ON TRACK.'} />
    </>
  );
}

const PATH_FOR: Record<'SIMPLE' | 'ADVANCED' | 'CUSTOM', FoundationBuildPathPreference> = {
  SIMPLE: 'SIMPLE_BUILD',
  ADVANCED: 'ADVANCED_BUILD',
  CUSTOM: 'CUSTOM_BUILD',
};

const PATH_ICON: Record<FoundationBuildPathPreference, DfIconName> = {
  SIMPLE_BUILD: 'cube',
  ADVANCED_BUILD: 'layers',
  CUSTOM_BUILD: 'options',
};

/** Builder place paths that a foundation handoff can carry, labelled from the builder's own definitions. */
export const FOUNDATION_BUILD_PATHS = PLACE_OPTIONS.filter(
  (p): p is (typeof PLACE_OPTIONS)[number] & { id: keyof typeof PATH_FOR } => p.id in PATH_FOR,
).map((p) => ({ id: PATH_FOR[p.id], label: p.label, hint: p.hint }));

const CREDIT_TONE: Record<FoundationCreditDisplay['state'], DfPillTone> = {
  AVAILABLE: 'ok',
  PENDING_VERIFICATION: 'info',
  REDEEMED: 'muted',
  EXPIRED: 'muted',
  NOT_ELIGIBLE: 'muted',
};

export function creditSubline(display: FoundationCreditDisplay, now = new Date()): string {
  switch (display.state) {
    case 'AVAILABLE': {
      const days = foundationCreditDaysLeft(display.expires_at, now);
      if (days === null) return 'REDEEMABLE IN THE SITE 00 BUILDER';
      if (days < 1) return 'VALID UNTIL TODAY';
      return `VALID FOR ${days} DAY${days === 1 ? '' : 'S'}`;
    }
    case 'PENDING_VERIFICATION':
      return 'SITE 00 IS VERIFYING THIS CREDIT';
    case 'REDEEMED':
      return 'ALREADY APPLIED TO A SITE 00 BUILD';
    case 'EXPIRED':
      return 'THE REDEMPTION WINDOW HAS CLOSED';
    default:
      return 'NOT AVAILABLE ON THIS PROJECT';
  }
}

function ConceptPreview({ business }: { business: string | null }) {
  const name = (business ?? 'YOUR BUSINESS').toUpperCase();
  return (
    <DfPanel label="CONCEPT PREVIEW — NOT FINAL DESIGN" className="df-concept-panel">
      <div className="df-concept" aria-hidden="true">
        <div className="df-concept__laptop">
          <span className="df-concept__art">
            <DfThresholdHero />
          </span>
          <span className="df-concept__name">{name}</span>
        </div>
        <div className="df-concept__phone">
          <span className="df-concept__art">
            <DfThresholdHero />
          </span>
          <span className="df-concept__name">{name}</span>
        </div>
      </div>
    </DfPanel>
  );
}

export function P12DigitalLocation({
  token,
  payload,
  reload,
  onOverview,
}: {
  token: string;
  payload: ClientDigitalFoundationPayload;
  reload: () => Promise<unknown>;
  onOverview: () => void;
}) {
  const inert = useDfReviewInert();
  const credit = foundationCreditDisplay({
    completion_state: payload.artifact.completion_state,
    credit: payload.credit,
  });
  const recommended = payload.artifact.build_recommendation;
  const [pathPref, setPathPref] = useState<FoundationBuildPathPreference | null>(() =>
    recommended === 'SIMPLE_BUILD' || recommended === 'ADVANCED_BUILD' || recommended === 'CUSTOM_BUILD' ? recommended : null,
  );
  const [busy, setBusy] = useState<'location' | 'later' | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const business =
    payload.artifact.intake.business_name || payload.lead.business_name || payload.ownership_record?.business || null;
  const saved = payload.artifact.build_interest === 'SAVED_FOR_LATER';

  const openLocation = async () => {
    setError(null);
    setNotice(null);
    if (inert) {
      setNotice(DF_REVIEW_INERT_MESSAGE);
      return;
    }
    setBusy('location');
    try {
      await captureBuildInterest(token, 'INTERESTED').catch(() => undefined);
      const path = credit.redeemable
        ? (await createBuilderHandoff(token, pathPref)).deep_link_path
        : FOUNDATION_BUILDER_DEEP_LINK_PATH;
      window.location.assign(path.startsWith('/') ? path : `/${path}`);
    } catch {
      setError('WE COULD NOT OPEN THE SITE 00 BUILDER. YOUR FOUNDATION RECORDS ARE UNCHANGED.');
    } finally {
      setBusy(null);
    }
  };

  const saveForLater = async () => {
    setError(null);
    setNotice(null);
    if (inert) {
      setNotice(DF_REVIEW_INERT_MESSAGE);
      return;
    }
    setBusy('later');
    try {
      await captureBuildInterest(token, 'SAVED_FOR_LATER');
      await reload();
      setNotice('SAVED. YOUR DIGITAL LOCATION WAITS ON THIS LINK WHENEVER YOU ARE READY.');
    } catch {
      setError('WE COULD NOT SAVE THIS. PLEASE TRY AGAIN.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <DfRail index="12" label="NEXT THRESHOLD" />
      <DfHeadline lines={['YOUR', 'DIGITAL', 'LOCATION']} />
      <DfLede>
        YOUR FOUNDATION IS COMPLETE. NOW YOU CAN DECIDE WHAT SHOULD LIVE AT YOUR DOMAIN NEXT. A SITE, TOOL OR SERVICE. THE
        CHOICE IS YOURS.
      </DfLede>
      <ConceptPreview business={business} />
      {payload.credit && credit.amount_minor !== null && credit.currency && (
        <DfPanel>
          <DfBoardList>
            <DfBoardRow
              rowId="foundation-credit"
              icon="receipt"
              title={`${formatMoney(credit.amount_minor, credit.currency)} FOUNDATION CREDIT`}
              sub={creditSubline(credit)}
              aside={<DfPill tone={CREDIT_TONE[credit.state]}>{credit.label}</DfPill>}
            />
          </DfBoardList>
        </DfPanel>
      )}
      {credit.redeemable && (
        <DfHonestNote>SITE 00 VERIFIES THIS CREDIT WHEN YOUR BUILD IS QUOTED. IT IS NOT APPLIED UNTIL THEN.</DfHonestNote>
      )}
      <DfPanel label="CHOOSE YOUR BUILD PATH">
        <DfBoardList label="BUILD PATHS">
          {FOUNDATION_BUILD_PATHS.map((p) => (
            <DfBoardRow
              key={p.id}
              rowId={`path-${p.id}`}
              icon={PATH_ICON[p.id]}
              title={p.label}
              sub={p.hint}
              selected={pathPref === p.id}
              aside={
                pathPref === p.id ? (
                  <DfPill tone="alert">SELECTED</DfPill>
                ) : recommended === p.id ? (
                  <DfPill tone="neutral">RECOMMENDED</DfPill>
                ) : undefined
              }
              onOpen={() => setPathPref(p.id)}
            />
          ))}
        </DfBoardList>
      </DfPanel>
      {error && (
        <p className="df-field__error" role="alert">
          {error}
        </p>
      )}
      {notice && <DfHonestNote>{notice}</DfHonestNote>}
      <div className="df-actions">
        <DfCta
          label="VIEW MY DIGITAL LOCATION"
          action="view-digital-location"
          busy={busy === 'location'}
          disabled={busy !== null}
          onClick={() => void openLocation()}
        />
        <DfCta
          tone="outline"
          label={saved ? 'SAVED FOR LATER' : 'SAVE THIS FOR LATER'}
          action="save-for-later"
          busy={busy === 'later'}
          disabled={busy !== null || saved}
          onClick={() => void saveForLater()}
        />
        <DfCta tone="text" label="RETURN TO MY PORTAL" action="return-to-portal" onClick={onOverview} />
      </div>
      <DfTrust text="YOUR FOUNDATION REMAINS ACTIVE." />
    </>
  );
}
