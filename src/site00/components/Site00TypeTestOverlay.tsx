import { useCallback, useEffect, useRef, useState } from 'react';
import {
  isSite00TypeTestEnabled,
  logSite00TypefaceStatusOnce,
  readSite00TypeMetrics,
  type Site00TypeMetrics,
} from '../utils/site00FontVerify';
import '../styles/site00-type-test.css';

type PinnedSample = {
  id: string;
  label: string;
  metrics: Site00TypeMetrics;
};

function sampleLabel(el: Element): string {
  const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ');
  if (!text) return el.className || el.tagName.toLowerCase();
  return text.length > 48 ? `${text.slice(0, 45)}…` : text;
}

/**
 * Development-only typography inspector — ?site00TypeTest=1
 * Click SITE 00 text to inspect computed type metrics.
 */
export function Site00TypeTestOverlay() {
  const enabled = isSite00TypeTestEnabled();
  const [active, setActive] = useState(enabled);
  const [hover, setHover] = useState<Site00TypeMetrics | null>(null);
  const [hoverLabel, setHoverLabel] = useState('');
  const [pinned, setPinned] = useState<PinnedSample[]>([]);
  const pinId = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    void logSite00TypefaceStatusOnce();
  }, [enabled]);

  const onPointerMove = useCallback(
    (event: MouseEvent) => {
      if (!active) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const shell = target.closest('.site00-shell, .site00-assts-shell, .site00-loader, .site00-immersive-loader');
      if (!shell) {
        setHover(null);
        return;
      }
      const textEl =
        target.closest(
          'h1,h2,h3,h4,h5,h6,p,span,a,button,label,li,dt,dd,th,td,[class*="site00-"]',
        ) ?? target;
      if (!(textEl instanceof Element)) return;
      setHover(readSite00TypeMetrics(textEl));
      setHoverLabel(sampleLabel(textEl));
    },
    [active],
  );

  const onClick = useCallback(
    (event: MouseEvent) => {
      if (!active) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('.site00-type-test-panel')) return;
      const shell = target.closest('.site00-shell, .site00-assts-shell, .site00-loader, .site00-immersive-loader');
      if (!shell) return;
      event.preventDefault();
      event.stopPropagation();
      const textEl =
        target.closest(
          'h1,h2,h3,h4,h5,h6,p,span,a,button,label,li,dt,dd,th,td,[class*="site00-"]',
        ) ?? target;
      if (!(textEl instanceof Element)) return;
      pinId.current += 1;
      setPinned((prev) => [
        ...prev.slice(-4),
        {
          id: `pin-${pinId.current}`,
          label: sampleLabel(textEl),
          metrics: readSite00TypeMetrics(textEl),
        },
      ]);
    },
    [active],
  );

  useEffect(() => {
    if (!enabled) return;
    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('mousemove', onPointerMove);
      document.removeEventListener('click', onClick, true);
    };
  }, [enabled, onPointerMove, onClick]);

  if (!enabled) return null;

  const display = hover;

  return (
    <div className="site00-type-test-panel" aria-label="SITE 00 typography test inspector">
      <div className="site00-type-test-panel__head">
        <span className="site00-type-test-panel__title">SITE 00 TYPE TEST</span>
        <button type="button" className="site00-type-test-panel__toggle" onClick={() => setActive((v) => !v)}>
          {active ? 'Pause' : 'Inspect'}
        </button>
      </div>
      <p className="site00-type-test-panel__hint">Hover text · click to pin sample · ?site00TypeTest=1</p>
      {display ? (
        <dl className="site00-type-test-panel__metrics">
          <div>
            <dt>Sample</dt>
            <dd>{hoverLabel}</dd>
          </div>
          <div>
            <dt>Font family</dt>
            <dd>{display.fontFamily}</dd>
          </div>
          <div>
            <dt>Martian Mono</dt>
            <dd>{display.isMartianMono ? 'YES' : 'NO — CHECK LOAD'}</dd>
          </div>
          <div>
            <dt>Weight</dt>
            <dd>{display.fontWeight}</dd>
          </div>
          <div>
            <dt>Size</dt>
            <dd>{display.fontSize}</dd>
          </div>
          <div>
            <dt>Line height</dt>
            <dd>{display.lineHeight}</dd>
          </div>
          <div>
            <dt>Letter spacing</dt>
            <dd>{display.letterSpacing}</dd>
          </div>
          <div>
            <dt>Width axis (stretch)</dt>
            <dd>{display.fontStretch}</dd>
          </div>
          <div>
            <dt>Rendered width</dt>
            <dd>{display.renderedWidth}px</dd>
          </div>
          <div>
            <dt>Rendered height</dt>
            <dd>{display.renderedHeight}px</dd>
          </div>
        </dl>
      ) : (
        <p className="site00-type-test-panel__empty">Move pointer over SITE 00 copy</p>
      )}
      {pinned.length > 0 ? (
        <div className="site00-type-test-panel__pinned">
          <p className="site00-type-test-panel__pinned-title">Pinned</p>
          {pinned.map((p) => (
            <div key={p.id} className="site00-type-test-panel__pin">
              <strong>{p.label}</strong>
              <span>
                {p.metrics.fontWeight} · {p.metrics.fontSize} · stretch {p.metrics.fontStretch} ·{' '}
                {p.metrics.renderedWidth}×{p.metrics.renderedHeight}px
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
