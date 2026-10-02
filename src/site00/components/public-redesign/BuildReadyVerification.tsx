import { useState } from 'react';
import {
  IDENTITY_AUTHORITY_DOMAINS,
  IDENTITY_AUTHORITY_STATUS_LABEL,
  authorityCheckStatus,
  resolveDisplayedAuthorityStatus,
  summarizeIdentityEvidence,
  type IdentityAuthorityDomain,
  type IdentityAuthorityStatus,
  type IdentityEvidenceState,
  type ServerIdentityAuthoritySnapshot,
} from '../../lib/identityAuthorityVerification';
import { PublicLineIcon } from './PublicLineIcon';
import { IdentityMachineGlyph } from './IdentityMachines';

/**
 * BUILD READY — identity-authority verification surfaces.
 *
 * HONESTY: every status shown here is either (a) a provisional description of what the USER has
 * supplied, or (b) a server snapshot value. Nothing on these screens claims SITE 00 has verified
 * anything, and none of them unlock BLDR.
 */

type Common = {
  evidence: IdentityEvidenceState;
  snapshot: ServerIdentityAuthoritySnapshot | null;
};

const PROVIDED: IdentityAuthorityStatus[] = ['EVIDENCE_RECEIVED', 'PENDING_REVIEW', 'AUTHORITY_ESTABLISHED'];

const isProvided = (status: IdentityAuthorityStatus) => PROVIDED.includes(status);

function StatusMark({ status }: { status: IdentityAuthorityStatus }) {
  const provided = isProvided(status);
  return (
    <span className={`s00pr-vmark ${provided ? 's00pr-vmark--on' : ''}`.trim()} aria-hidden="true">
      {provided ? (
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3.500 8.500 3 3 6-7" />
        </svg>
      ) : null}
    </span>
  );
}

function StatusLabel({ status }: { status: IdentityAuthorityStatus }) {
  const attention = status === 'REVIEW_REQUIRED' || status === 'GAP_IDENTIFIED' || status === 'NOT_PROVIDED';
  return (
    <span className={`s00pr-vstatus ${attention ? 's00pr-vstatus--attention' : ''}`.trim()} data-authority-status={status}>
      {IDENTITY_AUTHORITY_STATUS_LABEL[status]}
    </span>
  );
}

function NodeGlyph({ on }: { on: boolean }) {
  const color = on ? '#e8192c' : '#a7a7a7';
  return (
    <svg className="s00pr-vnode" viewBox="0 0 28 44" aria-hidden="true">
      <line x1="14" y1="2" x2="14" y2="42" stroke={color} strokeWidth="1" />
      <line x1="4" y1="22" x2="24" y2="22" stroke={color} strokeWidth="1" />
      <circle cx="14" cy="22" r="3" fill={on ? color : '#fff'} stroke={color} strokeWidth="1" />
      <circle cx="14" cy="8" r="2" fill={color} />
      <circle cx="14" cy="36" r="2" fill={color} />
      <circle cx="4" cy="22" r="1.800" fill={color} />
      <circle cx="24" cy="22" r="1.800" fill={color} />
    </svg>
  );
}

function Chevron() {
  return (
    <svg className="s00pr-vchevron" viewBox="0 0 10 16" width="8" height="13" fill="none" stroke="currentColor" strokeWidth="1.400" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m2 2 6 6-6 6" />
    </svg>
  );
}

/** Screen 1 — IS YOUR IDENTITY READY TO BUILD FROM? */
export function BuildReadyVerificationList({
  evidence,
  snapshot,
  onOpenDomain,
}: Common & { onOpenDomain: (domain: IdentityAuthorityDomain) => void }) {
  return (
    <ul className="s00pr-vlist" aria-label="IDENTITY DOMAINS">
      {IDENTITY_AUTHORITY_DOMAINS.map((domain) => {
        const status = resolveDisplayedAuthorityStatus(evidence, domain.id, snapshot);
        return (
          <li key={domain.id} className="s00pr-vlist__item">
            <button type="button" className="s00pr-vrow" onClick={() => onOpenDomain(domain.id)} data-domain={domain.id}>
              <PublicLineIcon id={domain.icon} size={30} className="s00pr-vrow__icon" />
              <span className="s00pr-vrow__name">{domain.label}</span>
              <StatusMark status={status} />
              <StatusLabel status={status} />
              <NodeGlyph on={isProvided(status)} />
              <Chevron />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Screen 2 — PROVIDE YOUR IDENTITY EVIDENCE. Each domain expands to confirm source material. */
export function BuildReadyEvidenceList({
  evidence,
  snapshot,
  onToggleSource,
  onToggleReviewFlag,
  initiallyOpen = null,
}: Common & {
  onToggleSource: (domain: IdentityAuthorityDomain, sourceId: string) => void;
  onToggleReviewFlag: (domain: IdentityAuthorityDomain) => void;
  initiallyOpen?: IdentityAuthorityDomain | null;
}) {
  const [open, setOpen] = useState<IdentityAuthorityDomain | null>(initiallyOpen);

  return (
    <ul className="s00pr-vlist s00pr-vlist--evidence" aria-label="IDENTITY EVIDENCE BY DOMAIN">
      {IDENTITY_AUTHORITY_DOMAINS.map((domain) => {
        const status = resolveDisplayedAuthorityStatus(evidence, domain.id, snapshot);
        const chosen = evidence.sourcesByDomain[domain.id];
        const isOpen = open === domain.id;
        const visible = isOpen ? domain.sources : domain.sources.slice(0, 3);
        const hidden = domain.sources.length - visible.length;
        const flagged = evidence.reviewFlags.includes(domain.id);
        const panelId = `s00pr-evidence-${domain.id.toLowerCase()}`;
        return (
          <li key={domain.id} className="s00pr-vlist__item">
            <div className="s00pr-vrow s00pr-vrow--evidence" data-domain={domain.id}>
              <PublicLineIcon id={domain.icon} size={30} className="s00pr-vrow__icon" />
              <span className="s00pr-vrow__name">{domain.label}</span>
              <div className="s00pr-vrow__main">
                <div className="s00pr-vrow__status">
                  <StatusMark status={status} />
                  <StatusLabel status={status} />
                </div>
                <div className="s00pr-chips" id={panelId}>
                  {visible.map((source) => {
                    const on = chosen.includes(source.id);
                    return (
                      <button
                        key={source.id}
                        type="button"
                        role="checkbox"
                        aria-checked={on}
                        className={`s00pr-chip ${on ? 's00pr-chip--on' : ''}`.trim()}
                        onClick={() => onToggleSource(domain.id, source.id)}
                      >
                        {source.label}
                      </button>
                    );
                  })}
                  {hidden > 0 ? (
                    <button type="button" className="s00pr-chip s00pr-chip--more" onClick={() => setOpen(domain.id)} aria-label={`SHOW ${hidden} MORE ${domain.label} SOURCES`}>
                      +{hidden}
                    </button>
                  ) : null}
                </div>
                {isOpen ? (
                  <label className="s00pr-vflag">
                    <input type="checkbox" checked={flagged} onChange={() => onToggleReviewFlag(domain.id)} />
                    <span>ASK SITE 00 TO REVIEW THIS DOMAIN</span>
                  </label>
                ) : null}
              </div>
              <button
                type="button"
                className="s00pr-vtoggle"
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-label={`${isOpen ? 'COLLAPSE' : 'EXPAND'} ${domain.label} EVIDENCE`}
                onClick={() => setOpen(isOpen ? null : domain.id)}
              >
                <Chevron />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Screen 3 — WHAT STILL NEEDS AUTHORITY? Gaps only; nothing is "established" without a server snapshot. */
export function BuildReadyAuthorityCheckList({
  evidence,
  snapshot,
  onOpenDomain,
}: Common & { onOpenDomain: (domain: IdentityAuthorityDomain) => void }) {
  return (
    <>
      <ul className="s00pr-vlist" aria-label="AUTHORITY CHECK BY DOMAIN">
        {IDENTITY_AUTHORITY_DOMAINS.map((domain) => {
          const status = authorityCheckStatus(evidence, domain.id, snapshot);
          return (
            <li key={domain.id} className="s00pr-vlist__item">
              <button type="button" className="s00pr-vrow" onClick={() => onOpenDomain(domain.id)} data-domain={domain.id}>
                <PublicLineIcon id={domain.icon} size={30} className="s00pr-vrow__icon" />
                <span className="s00pr-vrow__name">{domain.label}</span>
                <StatusMark status={status} />
                <StatusLabel status={status} />
                <NodeGlyph on={isProvided(status)} />
                <Chevron />
              </button>
            </li>
          );
        })}
      </ul>
      <p className="s00pr-vnote">PROVISIONAL — BASED ON WHAT YOU HAVE ADDED. NOTHING HAS BEEN REVIEWED OR VERIFIED BY SITE 00 YET.</p>
    </>
  );
}

/** Review mode — five domain tiles + EVIDENCE STATUS. */
export function BuildReadyReview({ evidence, snapshot }: Common) {
  const summary = summarizeIdentityEvidence(evidence);
  const needsReview = summary.requireReview + summary.notProvided;
  return (
    <div className="s00pr-vreview">
      <p className="s00pr-review__intro">REVIEW YOUR IDENTITY AUTHORITY BEFORE SUBMITTING FOR VERIFICATION.</p>
      <ul className="s00pr-vtiles" aria-label="IDENTITY DOMAIN EVIDENCE">
        {IDENTITY_AUTHORITY_DOMAINS.map((domain) => {
          const status = resolveDisplayedAuthorityStatus(evidence, domain.id, snapshot);
          return (
            <li key={domain.id} className="s00pr-vtile" data-domain={domain.id}>
              <PublicLineIcon id={domain.icon} size={28} className="s00pr-vtile__icon" />
              <span className="s00pr-vtile__name">{domain.label}</span>
              <StatusMark status={status} />
              <StatusLabel status={status} />
            </li>
          );
        })}
      </ul>
      <div className="s00pr-vsummary">
        <div>
          <p className="s00pr-vsummary__title">EVIDENCE STATUS</p>
          <p className="s00pr-vsummary__line">
            {summary.provided} {summary.provided === 1 ? 'DOMAIN' : 'DOMAINS'} PROVIDED
          </p>
          <p className="s00pr-vsummary__line">
            {needsReview} {needsReview === 1 ? 'DOMAIN REQUIRES' : 'DOMAINS REQUIRE'} REVIEW
          </p>
        </div>
        <IdentityMachineGlyph machine="authority" className="s00pr-vsummary__glyph" />
      </div>
    </div>
  );
}
