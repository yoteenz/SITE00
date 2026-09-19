/**
 * P0.VR.1C — Founder workspace composition primitives.
 * Behavior + semantics without universal card containment.
 */

import type { CSSProperties, ReactNode } from 'react';

export type SpatialSectionMode = 'dense' | 'standard' | 'breathing' | 'break' | 'focal';

export function WorkspaceField({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`site00-fws-workspace-field${className ? ` ${className}` : ''}`}>{children}</div>;
}

export function ArtworkLane({
  title,
  children,
  authority = 'secondary',
  action,
}: {
  title: string;
  children: ReactNode;
  authority?: 'primary' | 'secondary';
  action?: ReactNode;
}) {
  return (
    <section
      className={`site00-fws-artwork-lane site00-fws-artwork-lane--${authority}`}
      aria-label={title}
    >
      <header className="site00-fws-artwork-lane__head">
        <h3 className="site00-fws-artwork-lane__title">{title}</h3>
        {action}
      </header>
      <div className="site00-fws-artwork-lane__body">{children}</div>
    </section>
  );
}

export function MediaBand({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <section className="site00-fws-media-band" aria-label={label}>
      {children}
    </section>
  );
}

export function EditorialRail({
  identity,
  period,
  status,
  cadence,
  meta,
  navigation,
}: {
  identity: string | null;
  period: string | null;
  status?: string;
  cadence?: string | null;
  meta?: ReactNode;
  navigation?: ReactNode;
}) {
  return (
    <header className="site00-fws-editorial-rail" aria-label="Campaign identity">
      <div className="site00-fws-editorial-rail__identity">
        <p className="site00-fws-editorial-rail__campaign">
          {identity ?? 'Campaign planned — not initialized'}
        </p>
        {period ? <p className="site00-fws-editorial-rail__period">{period}</p> : null}
        <div className="site00-fws-editorial-rail__meta-row">
          {status ? <InlineMeta label="Status" value={status.replace(/_/g, ' ')} /> : null}
          {cadence ? <InlineMeta label="Cadence" value={cadence} /> : null}
          {meta}
        </div>
      </div>
      {navigation ? <div className="site00-fws-editorial-rail__nav">{navigation}</div> : null}
    </header>
  );
}

export function SpatialSection({
  mode = 'standard',
  children,
  className,
  ariaLabel,
}: {
  mode?: SpatialSectionMode;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <section
      className={`site00-fws-spatial site00-fws-spatial--${mode}${className ? ` ${className}` : ''}`}
      aria-label={ariaLabel}
    >
      {children}
    </section>
  );
}

export function AsymmetricGrid({
  variant,
  children,
  className,
}: {
  variant: 'pages' | 'margins' | 'motion';
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`site00-fws-asymmetric-grid site00-fws-asymmetric-grid--${variant}${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  );
}

export function QuietAction({
  children,
  onClick,
  disabled,
  href,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  href?: string;
}) {
  if (href) {
    return (
      <a href={href} className="site00-fws-quiet-action">
        {children}
      </a>
    );
  }
  return (
    <button type="button" className="site00-fws-quiet-action" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function InlineMeta({ label, value }: { label: string; value: ReactNode }) {
  return (
    <span className="site00-fws-inline-meta">
      <span className="site00-fws-inline-meta__label">{label}</span>
      <span className="site00-fws-inline-meta__value">{value}</span>
    </span>
  );
}

export function GhostSlot({
  variant,
  label,
  style,
}: {
  variant: 'page' | 'margin' | 'motion';
  label?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`site00-fws-ghost site00-fws-ghost--${variant}`}
      role="img"
      aria-label={label ?? 'Creative slot — awaiting content'}
      style={style}
    >
      {label ? <span className="site00-fws-ghost__label">{label}</span> : null}
    </div>
  );
}
