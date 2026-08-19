import { Link } from 'react-router-dom';
import type { IdentityBrandState } from '../../config/identity';
import type { EnterMenuIconId } from '../../config/directory';
import { resolveEnterDirectoryRowHref } from '../../config/directory';
import { useSignedInFromStorage } from '../../../hooks/useSignedInFromStorage';
import { GeometricIcon } from '../icons/GeometricIcon';
import { BldrBuildClassIcon } from '../bldr/BldrBuildClassIcon';
import type { BldrBuildClassIconId } from '../../config/bldr-build-class-icons';
import { IdntyBrandStateIcon } from '../idnty/IdntyBrandStateIcon';
import type { IdntyBrandStateIconId } from '../../config/idnty-brand-state-icons';
import { ArrowIconSmall } from '../icons/ArrowAction';
import { EnterMenuIcon, Site00ArrowRightIcon } from '../../icons';
import { Site00ArtboardBottomChromePortal } from '../shell/Site00ArtboardBottomChromePortal';
import { Site00SummaryStripText } from '../shell/Site00SummaryStripText';

type StateCardProps = {
  state: IdentityBrandState;
  selected?: boolean;
  onSelect: (stateId: string) => void;
};

export function StateCard({ state, selected, onSelect }: StateCardProps) {
  return (
    <button
      type="button"
      className={`site00-state-card ${selected ? 'site00-state-card--selected' : ''}`.trim()}
      onClick={() => onSelect(state.id)}
      aria-pressed={selected}
    >
      <span className="site00-label-red">{state.code}</span>
      <div className="site00-brand-state-icon" style={{ margin: '16px 0', flex: 1, display: 'flex', alignItems: 'center' }}>
        <IdntyBrandStateIcon id={state.id} title={state.title} />
      </div>
      <p className="site00-heading" style={{ marginBottom: 8 }}>
        {state.title}
      </p>
      <p className="site00-body" style={{ fontSize: 11, whiteSpace: 'pre-line', marginBottom: 16 }}>
        {state.description}
      </p>
      <span className="site00-action-link site00-action-link--red">
        SELECT STATE
        <ArrowIconSmall />
      </span>
    </button>
  );
}

type BuildClassCardProps = {
  buildClassId: BldrBuildClassIconId;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  selected?: boolean;
  onSelect: () => void;
};

export function BuildClassCard({
  buildClassId,
  code,
  title,
  subtitle,
  description,
  cta,
  selected,
  onSelect,
}: BuildClassCardProps) {
  return (
    <button
      type="button"
      className={`site00-state-card ${selected ? 'site00-state-card--selected' : ''}`.trim()}
      onClick={onSelect}
      aria-pressed={selected}
      style={{ minHeight: 320 }}
    >
      <span className="site00-label-red">{code}</span>
      <div className="site00-build-class-icon" style={{ margin: '12px 0', flex: 1, display: 'flex', alignItems: 'center' }}>
        <BldrBuildClassIcon id={buildClassId} title={title} />
      </div>
      <p className="site00-panel-title" style={{ marginBottom: 4 }}>
        {title}
      </p>
      <p className="site00-label" style={{ marginBottom: 8 }}>
        {subtitle}
      </p>
      <p className="site00-body" style={{ fontSize: 11, marginBottom: 16, flex: 1 }}>
        {description}
      </p>
      <span className="site00-action-link site00-action-link--red">{cta}</span>
    </button>
  );
}

type InvestmentColumnProps = {
  label: string;
  priceLabel: string;
  items: string[];
  iconVariant?: 'cube-simple' | 'cube-medium' | 'cube-complex' | 'cube-solid' | undefined;
  buildClassId?: BldrBuildClassIconId;
  brandStateId?: IdntyBrandStateIconId;
};

export function InvestmentColumn({ label, priceLabel, items, iconVariant, buildClassId, brandStateId }: InvestmentColumnProps) {
  return (
    <div style={{ padding: '12px 8px' }}>
      {buildClassId ? (
        <div style={{ marginBottom: 8 }}>
          <BldrBuildClassIcon id={buildClassId} title={label} className="site00-bldr-build-class-icon--sm" />
        </div>
      ) : brandStateId ? (
        <div style={{ marginBottom: 8 }}>
          <IdntyBrandStateIcon id={brandStateId} title={label} className="site00-idnty-brand-state-icon--sm" />
        </div>
      ) : iconVariant ? (
        <div style={{ marginBottom: 8 }}>
          <GeometricIcon variant={iconVariant} size="sm" />
        </div>
      ) : null}
      <p className="site00-label-red" style={{ marginBottom: 4 }}>
        {label}
      </p>
      <p className="site00-heading" style={{ marginBottom: 8 }}>
        {priceLabel}
      </p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((item) => (
          <li key={item} className="site00-body" style={{ fontSize: 10, marginBottom: 4 }}>
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

type WorkflowSummaryProps = {
  text: string;
};

export function WorkflowSummary({ text }: WorkflowSummaryProps) {
  return (
    <Site00ArtboardBottomChromePortal>
      <footer className="site00-summary-strip-panel site00-workflow-summary-strip">
        <Site00SummaryStripText text={text} />
      </footer>
    </Site00ArtboardBottomChromePortal>
  );
}

type DirectoryRowProps = {
  number?: string;
  title: string;
  description: string;
  href: string;
  enabled: boolean;
  requiresAuth?: boolean;
  enterIcon?: EnterMenuIconId;
};

export function DirectoryRow({
  number,
  title,
  description,
  href,
  enabled,
  requiresAuth = false,
  enterIcon,
}: DirectoryRowProps) {
  const [isSignedIn] = useSignedInFromStorage();
  const resolvedHref = resolveEnterDirectoryRowHref(href, requiresAuth, isSignedIn);
  const locked = requiresAuth && !isSignedIn;

  const content = (
    <>
      <div className="site00-enter-row__main">
        {enterIcon ? (
          <span className="site00-enter-icon-slot">
            <EnterMenuIcon id={enterIcon} />
          </span>
        ) : number ? (
          <span className="site00-mono site00-enter-row__number">{number}</span>
        ) : null}
        <div className="site00-enter-row__copy">
          <p className="site00-heading site00-enter-row__title">{title}</p>
          <p className="site00-body site00-enter-row__description">{description}</p>
        </div>
      </div>
      <span className="site00-enter-row__arrow">
        <Site00ArrowRightIcon size={18} />
      </span>
    </>
  );

  if (enabled) {
    return (
      <Link
        to={resolvedHref}
        className={`site00-enter-row${locked ? ' site00-enter-row--locked' : ''}`.trim()}
        aria-label={locked ? `${title} — sign in to enter` : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="site00-enter-row site00-enter-row--disabled" aria-disabled="true">
      {content}
    </div>
  );
}
