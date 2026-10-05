import { useCallback, useEffect, useLayoutEffect, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import {
  computeFounderWorkspacePopoverPosition,
  type FounderWorkspacePopoverPlacement,
  type FounderWorkspacePopoverWidthMode,
} from '../../../../shared/site00-studio-world-ui/founderWorkspace/founderWorkspacePopoverPosition.js';
import { FOUNDER_WORKSPACE_POPOVER_SURFACE_CLASS } from '../../../../shared/site00-studio-world-ui/founderWorkspace/notificationCenterVisualAuthority.js';

export type FounderWorkspacePopoverSurfaceProps = {
  open: boolean;
  onClose: () => void;
  anchorRef?: RefObject<HTMLElement | null>;
  placement?: FounderWorkspacePopoverPlacement;
  widthMode?: FounderWorkspacePopoverWidthMode;
  headerBottomFallback?: number;
  bottomOffsetPx?: number;
  children: ReactNode;
  ariaRole?: 'dialog' | 'menu';
  ariaLabel: string;
  className?: string;
  backdropClassName?: string;
  vrRegion?: string;
  panelRef?: RefObject<HTMLDivElement>;
};

function readViewportMetrics(): { viewportWidth: number; viewportHeight: number } {
  if (typeof window === 'undefined') {
    return { viewportWidth: 390, viewportHeight: 844 };
  }
  return { viewportWidth: window.innerWidth, viewportHeight: window.innerHeight };
}

export function FounderWorkspacePopoverSurface({
  open,
  onClose,
  anchorRef,
  placement = 'anchor-below-viewport-right',
  widthMode = 'notification',
  headerBottomFallback = 56,
  bottomOffsetPx = 12,
  children,
  ariaRole = 'dialog',
  ariaLabel,
  className,
  backdropClassName = 'site00-fws-popover-backdrop',
  vrRegion,
  panelRef,
}: FounderWorkspacePopoverSurfaceProps) {
  const [style, setStyle] = useState<CSSProperties>({});

  const updatePosition = useCallback(() => {
    if (!open || typeof window === 'undefined') return;
    const viewport = readViewportMetrics();
    const anchorRect = anchorRef?.current?.getBoundingClientRect() ?? null;
    const position = computeFounderWorkspacePopoverPosition({
      anchorRect,
      viewport,
      placement,
      widthMode,
      headerBottomFallback,
      bottomOffsetPx,
    });

    const next: CSSProperties = {
      width: position.width,
      maxHeight: position.maxHeight,
    };
    if (position.top != null) next.top = position.top;
    if (position.left != null) next.left = position.left;
    if (position.right != null) next.right = position.right;
    if (position.bottom != null) next.bottom = position.bottom;
    setStyle(next);
  }, [open, anchorRef, placement, widthMode, headerBottomFallback, bottomOffsetPx]);

  useLayoutEffect(() => {
    updatePosition();
  }, [updatePosition]);

  useEffect(() => {
    if (!open || typeof window === 'undefined') return undefined;
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const surfaceClass = [
    FOUNDER_WORKSPACE_POPOVER_SURFACE_CLASS,
    className,
    placement === 'viewport-bottom-right' ? `${FOUNDER_WORKSPACE_POPOVER_SURFACE_CLASS}--bottom` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return createPortal(
    <>
      <button type="button" className={backdropClassName} aria-label={`Close ${ariaLabel}`} onClick={onClose} />
      <div
        ref={panelRef}
        className={surfaceClass}
        style={style}
        role={ariaRole}
        aria-label={ariaLabel}
        {...(vrRegion ? { 'data-vr-region': vrRegion } : {})}
      >
        {children}
      </div>
    </>,
    document.body,
  );
}
