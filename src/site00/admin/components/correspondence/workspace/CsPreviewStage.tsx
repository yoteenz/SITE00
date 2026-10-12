import { forwardRef, useCallback, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { DEVICE_PREVIEW_MIN_HEIGHT, DEVICE_PREVIEW_WIDTHS } from '../../../../../../shared/site00-correspondence-studio/devicePreview.js';
import type { DevicePreviewMode } from '../../../../../../shared/site00-correspondence-studio/types.js';
import type { CopyContract } from '../../../../../../shared/site00-correspondence-studio/workspaceLibrary.js';
import type { EmailDocumentState } from './emailDocument';

export type PreviewStageHandle = {
  /** Scrolls the stage to a top-level email block. Returns false when the block is hidden at the current device width. */
  scrollToBlock: (index: number) => boolean;
};

export type StageView = 'html' | 'reference' | 'compare';

type Props = {
  state: EmailDocumentState;
  device: DevicePreviewMode;
  title: string;
  contract: CopyContract | null;
  view?: StageView;
  /** Founder device references for the version; tablet has none and shows the desktop reference. */
  reference?: { desktop: string; mobile: string } | null;
};

const STAGE_PAD = 28;
const COMPARE_GAP = 24;

export const CsPreviewStage = forwardRef<PreviewStageHandle, Props>(function CsPreviewStage(
  { state, device, title, contract, view = 'html', reference = null },
  ref,
) {
  const mode: StageView = reference ? view : 'html';
  const refDevice = device === 'mobile' ? 'mobile' : 'desktop';
  const refSrc = reference ? reference[refDevice] : null;
  const viewportRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const width = DEVICE_PREVIEW_WIDTHS[device];
  const minHeight = DEVICE_PREVIEW_MIN_HEIGHT[device];
  const [available, setAvailable] = useState(0);
  const [contentHeight, setContentHeight] = useState(minHeight);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => setAvailable(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [state.status]);

  const srcDoc = state.status === 'ready' ? state.doc.srcDoc : '';

  useLayoutEffect(() => {
    setContentHeight(minHeight);
    viewportRef.current?.scrollTo({ top: 0 });
  }, [srcDoc, minHeight]);

  const contentObserver = useRef<ResizeObserver | null>(null);

  const measureContent = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc?.documentElement) return;
    const email = doc.querySelector('.email') as HTMLElement | null;
    const next = email ? email.offsetTop + email.offsetHeight : doc.body.scrollHeight;
    setContentHeight((prev) => (Math.abs(prev - next) > 1 ? Math.max(next, 200) : prev));
  }, []);

  const handleLoad = useCallback(() => {
    measureContent();
    contentObserver.current?.disconnect();
    const body = iframeRef.current?.contentDocument?.body;
    if (!body || typeof ResizeObserver === 'undefined') return;
    contentObserver.current = new ResizeObserver(measureContent);
    contentObserver.current.observe(body);
  }, [measureContent]);

  useLayoutEffect(() => () => contentObserver.current?.disconnect(), []);

  const columns = mode === 'compare' ? 2 : 1;
  const scale = available > 0 ? Math.min(1, (available - STAGE_PAD * 2 - (columns - 1) * COMPARE_GAP) / (width * columns)) : 1;

  useImperativeHandle(
    ref,
    () => ({
      scrollToBlock(index: number) {
        const doc = iframeRef.current?.contentDocument;
        const node = doc?.querySelector('.email')?.children[index] as HTMLElement | undefined;
        if (!node || node.getClientRects().length === 0) return false;
        let top = 0;
        for (let el: HTMLElement | null = node; el && el !== doc?.body; el = el.offsetParent as HTMLElement | null) top += el.offsetTop;
        viewportRef.current?.scrollTo({ top: Math.max(0, top * scale + STAGE_PAD - 12), behavior: 'smooth' });
        node.animate?.([{ outline: '2px solid #d90c0c' }, { outline: '2px solid transparent' }], { duration: 1400 });
        return true;
      },
    }),
    [scale],
  );

  return (
    <div className={`csw-stage__viewport${mode === 'compare' ? ' is-compare' : ''}`} ref={viewportRef} data-device={device} data-view={mode}>
      {state.status === 'loading' && mode !== 'reference' ? <p className="csw-stage__status">LOADING PREVIEW…</p> : null}
      {state.status === 'unavailable' ? (
        <article className="csw-stage__empty" aria-live="polite">
          <p className="csw-micro">NO COMPOSED EMAIL FOR THIS VERSION</p>
          <h2>{title}</h2>
          <p className="csw-stage__reason">{state.reason}</p>
          {contract ? (
            <dl className="csw-contract">
              <p className="csw-micro">REGISTRY COPY CONTRACT · READ ONLY</p>
              {contract.subject ? (
                <>
                  <dt>SUBJECT</dt>
                  <dd>{contract.subject}</dd>
                </>
              ) : null}
              {contract.preheader ? (
                <>
                  <dt>PREHEADER</dt>
                  <dd>{contract.preheader}</dd>
                </>
              ) : null}
              {contract.body_outline.length ? (
                <>
                  <dt>BODY OUTLINE</dt>
                  <dd>
                    <ol>
                      {contract.body_outline.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ol>
                  </dd>
                </>
              ) : null}
              {contract.primary_cta ? (
                <>
                  <dt>PRIMARY ACTION</dt>
                  <dd>{contract.primary_cta}</dd>
                </>
              ) : null}
            </dl>
          ) : null}
        </article>
      ) : null}
      {refSrc && mode !== 'html' ? (
        <figure className="csw-stage__ref" style={{ width: width * scale }}>
          <figcaption className="csw-micro">
            FOUNDER AUTHORITY · {refDevice.toUpperCase()}
            {device === 'tablet' ? ' · NO TABLET AUTHORITY' : ''}
          </figcaption>
          <img src={refSrc} alt={`${title} — founder ${refDevice} reference`} style={{ width: width * scale }} />
        </figure>
      ) : null}
      {state.status === 'ready' && mode !== 'reference' ? (
        <div className={`csw-stage__slot${mode === 'compare' ? ' is-compare' : ''}`} style={{ width: width * scale, height: contentHeight * scale }}>
          {mode === 'compare' ? <p className="csw-micro csw-stage__label">LIVE HTML · {width}PX</p> : null}
          <div className="csw-stage__canvas" style={{ width, height: contentHeight, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <iframe
              ref={iframeRef}
              title={`${title} — ${device} preview`}
              srcDoc={srcDoc}
              sandbox="allow-same-origin"
              scrolling="no"
              onLoad={handleLoad}
              style={{ width, height: contentHeight, border: 0, display: 'block' }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
});
