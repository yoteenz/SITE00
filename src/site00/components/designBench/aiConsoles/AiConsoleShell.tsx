/**
 * P0.VR.DESIGN.OPUS-AI-CONSOLES1 — the shared shell the three DESIGN AI consoles
 * are composed from.
 *
 * Each console is a workbench with a different job, but the chrome, status
 * language, tab treatment, close behaviour and action hierarchy are one system.
 * Keeping them here is what stops the three surfaces drifting back into three
 * different products.
 */

import { useEffect, type ReactNode } from 'react';

import type { ConsoleStatusTone } from '../../../../../shared/site00-design-workspace-production/designAiConsolePresentation.js';
import {
  AIC_CONSOLE_MARK,
  statusIconForLabel,
  type AiConsoleIconId,
} from '../../../../../shared/site00-design-workspace-production/designAiConsoleIconography.js';
import '../../../styles/site00-ai-consoles.css';
import { AiConsoleIcon } from './AiConsoleIcon';

export function AiConsoleSurface({
  console: consoleId,
  name,
  model,
  status,
  statusTone,
  title,
  purpose,
  onClose,
  closeClassName,
  labelledBy,
  ariaLabel,
  tabs,
  children,
  footer,
  testId,
  panelId,
}: {
  console: 'opus' | 'grok' | 'authority';
  name: string;
  model?: string;
  status: string;
  statusTone: ConsoleStatusTone;
  title: string;
  purpose: string;
  onClose: () => void;
  closeClassName?: string;
  labelledBy?: string;
  ariaLabel: string;
  tabs?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  testId?: string;
  panelId?: string;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="s00-aic-layer" data-console={consoleId} data-testid={testId}>
      <button type="button" className="s00-aic__scrim" aria-label={`Close ${name}`} onClick={onClose} />
      <section
        id={panelId}
        className={`s00-aic s00-aic--${consoleId}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
      >
        <span className="s00-aic__grabber" aria-hidden="true" />
        <div className="s00-aic__chrome">
          <span className="s00-aic__mark" aria-hidden="true">
            <AiConsoleIcon name={AIC_CONSOLE_MARK[consoleId]} size={14} />
          </span>
          <span className="s00-aic__chromeName">{name}</span>
          {model ?
            <>
              <span className="s00-aic__chromeSep" aria-hidden="true">
                ·
              </span>
              <span className="s00-aic__chromeModel">{model}</span>
            </>
          : null}
          <span className="s00-aic__state" data-tone={statusTone} data-console-status={status}>
            <span className="s00-aic__dot" aria-hidden="true">
              <AiConsoleIcon name={statusIconForLabel(status)} size={12} />
            </span>
            {status}
          </span>
          <button
            type="button"
            className={closeClassName ?? 's00-aic__close'}
            onClick={onClose}
            aria-label={`Close ${name}`}
          >
            <AiConsoleIcon name="action-close" size={12} />
          </button>
        </div>

        <header className="s00-aic__head">
          <h2 className="s00-aic__title">{title}</h2>
          <p className="s00-aic__purpose">{purpose}</p>
        </header>

        {tabs ? <div className="s00-aic__tabs">{tabs}</div> : null}

        <div className="s00-aic__body">{children}</div>

        <footer className="s00-aic__foot">{footer}</footer>
      </section>
    </div>
  );
}

export function AiConsoleSection({
  label,
  action,
  children,
  ariaLabel,
}: {
  label: string;
  action?: ReactNode;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <section className="s00-aic__sec" aria-label={ariaLabel ?? label}>
      <div className="s00-aic__secHead">
        <span className="s00-aic__secLabel">{label}</span>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AiConsoleSectionAction({
  label,
  onClick,
  disabled,
  disabledReason,
  interactionId,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  disabledReason?: string | null;
  interactionId?: string;
}) {
  return (
    <button
      type="button"
      className="s00-aic__secAction"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? disabledReason ?? undefined : undefined}
      data-interaction-id={interactionId}
    >
      {label}
    </button>
  );
}

export function AiConsoleTab({
  label,
  active,
  onClick,
  disabled,
  disabledReason,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  disabledReason?: string | null;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`s00-aic__tab${active ? ' is-active' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={disabled ? disabledReason ?? undefined : undefined}
    >
      {label}
    </button>
  );
}

export function AiConsoleMeta({ rows }: { rows: readonly { label: string; value: string }[] }) {
  return (
    <dl className="s00-aic__meta">
      {rows.map((row) => (
        <div className="s00-aic__metaRow" key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Every preview in the system is the same object: a framed image that opens
 * fullscreen, or a designed placeholder that says what is missing. There is no
 * third case where a console shows a broken frame.
 */
export function AiConsolePreview({
  src,
  alt,
  emptyLabel,
  emptyNote,
  emptyIcon = 'empty-concept',
  onOpen,
  contain,
  interactionId,
}: {
  src: string | null;
  alt: string;
  emptyLabel: string;
  emptyNote?: string;
  emptyIcon?: AiConsoleIconId;
  onOpen?: () => void;
  contain?: boolean;
  interactionId?: string;
}) {
  return (
    <button
      type="button"
      className="s00-aic__preview"
      onClick={() => src && onOpen?.()}
      disabled={!src || !onOpen}
      aria-label={src ? `${alt} — view fullscreen` : emptyLabel}
      data-interaction-id={interactionId}
    >
      {src ?
        <img
          src={src}
          alt={alt}
          className={`s00-aic__previewImg${contain ? ' s00-aic__previewImg--contain' : ''}`}
          draggable={false}
        />
      : <span className="s00-aic__previewEmpty">
          <span className="s00-aic__previewEmptyGlyph" aria-hidden="true">
            <AiConsoleIcon name={emptyIcon} size={22} />
          </span>
          <span>{emptyLabel}</span>
          {emptyNote ? <span className="s00-aic__emptyNote">{emptyNote}</span> : null}
        </span>
      }
    </button>
  );
}

export function AiConsoleEmptyState({
  title,
  note,
  action,
  icon = 'empty-assets',
}: {
  title: string;
  note: string;
  action?: ReactNode;
  icon?: AiConsoleIconId;
}) {
  return (
    <div className="s00-aic__empty">
      <span className="s00-aic__emptyGlyph" aria-hidden="true">
        <AiConsoleIcon name={icon} size={22} />
      </span>
      <span className="s00-aic__emptyTitle">{title}</span>
      <span className="s00-aic__emptyNote">{note}</span>
      {action}
    </div>
  );
}

export function AiConsoleButton({
  label,
  onClick,
  primary,
  disabled,
  disabledReason,
  interactionId,
  glyph,
  icon,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
  disabledReason?: string | null;
  interactionId?: string;
  glyph?: string;
  icon?: AiConsoleIconId;
}) {
  return (
    <button
      type="button"
      className={`s00-aic__btn${primary ? ' s00-aic__btn--primary' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={disabled ? disabledReason ?? undefined : undefined}
      data-interaction-id={interactionId}
    >
      {icon ? (
        <span className="s00-aic__toolGlyph" aria-hidden="true">
          <AiConsoleIcon name={icon} size={12} />
        </span>
      ) : glyph ? (
        <span className="s00-aic__toolGlyph" aria-hidden="true">
          {glyph}
        </span>
      ) : null}
      {label}
    </button>
  );
}

export function AiConsoleLightboxControls({
  onFit,
  onZoomIn,
  onZoomOut,
  onPrev,
  onNext,
  onClose,
}: {
  onFit?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="s00-aic__previewTools" role="toolbar" aria-label="Preview controls">
      {onPrev ? (
        <button type="button" className="s00-aic__previewTool" onClick={onPrev} aria-label="Previous">
          <AiConsoleIcon name="preview-prev" size={14} />
        </button>
      ) : null}
      {onFit ? (
        <button type="button" className="s00-aic__previewTool" onClick={onFit} aria-label="Fit">
          <AiConsoleIcon name="preview-fit" size={14} />
        </button>
      ) : null}
      {onZoomOut ? (
        <button type="button" className="s00-aic__previewTool" onClick={onZoomOut} aria-label="Zoom out">
          <AiConsoleIcon name="preview-zoom-out" size={14} />
        </button>
      ) : null}
      {onZoomIn ? (
        <button type="button" className="s00-aic__previewTool" onClick={onZoomIn} aria-label="Zoom in">
          <AiConsoleIcon name="preview-zoom-in" size={14} />
        </button>
      ) : null}
      {onNext ? (
        <button type="button" className="s00-aic__previewTool" onClick={onNext} aria-label="Next">
          <AiConsoleIcon name="preview-next" size={14} />
        </button>
      ) : null}
      {onClose ? (
        <button type="button" className="s00-aic__previewTool" onClick={onClose} aria-label="Close preview">
          <AiConsoleIcon name="preview-fullscreen" size={14} />
        </button>
      ) : null}
    </div>
  );
}
