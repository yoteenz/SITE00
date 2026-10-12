import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../../config/routes';
import './foundationReviewStudio.css';

type Device = 'MOBILE' | 'TABLET' | 'DESKTOP';
type Mode = 'LIVE' | 'REFERENCE' | 'COMPARE';
type Status = 'LIVE DATA' | 'REQUIRES PROJECT' | 'REQUIRES CLIENT TOKEN' | 'REFERENCE ONLY';
type Entry = {
  id: string; family: string; title: string; note: string; status: Status;
  ref: { asset: string; sha: string; native: Device };
  path: (id: string, token: string) => string | null;
};

const REF_ROOT = '/site00/idnty/digital-foundation/authority/reference';
const DEVICE: Record<Device, { w: number; h: number }> = {
  MOBILE: { w: 390, h: 844 },
  TABLET: { w: 768, h: 1024 },
  DESKTOP: { w: 1280, h: 720 },
};
const tokenPath = (station: string) => (_id: string, token: string) =>
  token ? `/foundation/${encodeURIComponent(token)}${station ? `#${station}` : ''}` : null;
const projectPath = (route: string) => (id: string) => (id ? route.replace(':id', encodeURIComponent(id)) : null);

const entries: Entry[] = [
  { id: 'P13', family: 'FOUNDER OPERATIONS', title: 'PROJECT PIPELINE', note: 'SEARCH, ATTENTION FILTER, AND ACTIVE PROJECT LINKS.', status: 'LIVE DATA', ref: { asset: 'DF-D01', sha: 'ab1b8182', native: 'DESKTOP' }, path: () => SITE00_ROUTES.digitalFoundationPipeline },
  { id: 'P14', family: 'FOUNDER OPERATIONS', title: 'PROJECT COMMAND', note: 'PROJECT STAGES, OWNERSHIP, VERIFICATION AND NEXT ACTIONS.', status: 'REQUIRES PROJECT', ref: { asset: 'DF-D02', sha: '7c1e1d93', native: 'DESKTOP' }, path: projectPath(SITE00_ROUTES.digitalFoundationProjectCommand) },
  { id: 'P15', family: 'FOUNDER OPERATIONS', title: 'EXECUTION WORKBENCH', note: 'LIVE TASK QUEUES, STATUS GROUPS AND TASK INSPECTION.', status: 'REQUIRES PROJECT', ref: { asset: 'DF-D03', sha: '6b809a13', native: 'DESKTOP' }, path: projectPath(SITE00_ROUTES.digitalFoundationWorkbench) },
  { id: 'G01', family: 'COMMUNICATIONS', title: 'COMMUNICATIONS COMMAND', note: 'TWENTY EMAIL INTENTS IN THREE FAMILIES. NO SENDING.', status: 'LIVE DATA', ref: { asset: 'DF-G01', sha: '95c4baeb', native: 'DESKTOP' }, path: () => SITE00_ROUTES.digitalFoundationCommunications },
  { id: 'C01', family: 'CLIENT EXPERIENCE', title: 'FOUNDATION COMPLETE', note: 'COMPLETION RECORD WITH VERIFIED OWNERSHIP DETAILS.', status: 'REQUIRES CLIENT TOKEN', ref: { asset: 'DF-C01', sha: 'f1c40b00', native: 'MOBILE' }, path: tokenPath('') },
  { id: 'C02', family: 'CLIENT EXPERIENCE', title: 'DIGITAL LOCATION', note: 'BUILD PATHS AND THE EXPLORE ACTION AFTER COMPLETION.', status: 'REQUIRES CLIENT TOKEN', ref: { asset: 'DF-C02', sha: '2445931c', native: 'MOBILE' }, path: tokenPath('location') },
  { id: 'F01', family: 'CLIENT EXPERIENCE', title: 'FOUNDATION CREDIT', note: 'CREDIT ONLY WHEN A VERIFIED AVAILABLE RECORD EXISTS.', status: 'REQUIRES CLIENT TOKEN', ref: { asset: 'DF-F01', sha: 'e4582181', native: 'MOBILE' }, path: tokenPath('credit') },
  { id: 'F02', family: 'CLIENT EXPERIENCE', title: 'BLDR INTRODUCTION', note: 'THE OPTIONAL NEXT-LOCATION EXPLORATION.', status: 'REQUIRES CLIENT TOKEN', ref: { asset: 'DF-F02', sha: 'fd7938eb', native: 'MOBILE' }, path: tokenPath('bldr') },
  { id: 'E01', family: 'ADDITIONAL AUTHORITY', title: 'RUNBOOK TASK', note: 'AUTHORITY ONLY. INFORMS THE WORKBENCH TASK DETAIL; NOT A DEDICATED SCREEN.', status: 'REFERENCE ONLY', ref: { asset: 'DF-E01', sha: '87488933', native: 'MOBILE' }, path: () => null },
  { id: 'E02', family: 'ADDITIONAL AUTHORITY', title: 'VERIFICATION CHECKLIST', note: 'AUTHORITY ONLY. NOT IMPLEMENTED OR VERIFIED AS A SCREEN.', status: 'REFERENCE ONLY', ref: { asset: 'DF-E02', sha: 'c5275490', native: 'MOBILE' }, path: () => null },
  { id: 'G02', family: 'ADDITIONAL AUTHORITY', title: 'TEMPLATE STUDIO', note: 'AUTHORITY ONLY. G01 LINKS TO THE EXISTING TEMPLATE LIBRARY.', status: 'REFERENCE ONLY', ref: { asset: 'DF-G02', sha: '8b297668', native: 'DESKTOP' }, path: () => null },
  { id: 'J01', family: 'ADDITIONAL AUTHORITY', title: 'COMMUNICATION PREFERENCES', note: 'AUTHORITY ONLY. NOT IMPLEMENTED OR VERIFIED AS A SCREEN.', status: 'REFERENCE ONLY', ref: { asset: 'DF-J01', sha: '6e8fc196', native: 'MOBILE' }, path: () => null },
];
const FAMILIES = ['FOUNDER OPERATIONS', 'COMMUNICATIONS', 'CLIENT EXPERIENCE', 'ADDITIONAL AUTHORITY'];

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

function DeviceFrame({ path, title, device, width }: { path: string | null; title: string; device: Device; width: number }) {
  const { w, h } = DEVICE[device];
  const scale = width > 0 ? Math.min(1, width / w) : 1;
  return (
    <div className="df-review__device" style={{ width: w * scale, height: h * scale }} data-device={device}>
      {path ? (
        <iframe key={`${path}-${device}`} title={title} src={path}
          style={{ width: w, height: h, transform: `scale(${scale})` }} />
      ) : (
        <div className="df-review__placeholder">
          <span>REVIEW CONTEXT REQUIRED</span>
          <h2>CONNECT A REAL ARTIFACT.</h2>
          <p>ENTER THE REQUIRED IDENTIFIER ABOVE, OR LOAD THE DEV PREVIEW FIXTURE, TO PREVIEW THIS SCREEN WITH ITS REAL DATA CONTRACT.</p>
        </div>
      )}
    </div>
  );
}

function ReferenceFrame({ entry, height, width }: { entry: Entry; height: number; width: number }) {
  const portrait = entry.ref.native === 'MOBILE';
  const ratio = portrait ? 2016 / 3584 : 3584 / 2016;
  const h = Math.min(height, width / ratio);
  return (
    <figure className="df-review__ref" style={{ width: h * ratio }}>
      <img src={`${REF_ROOT}/${entry.ref.asset.toLowerCase()}.webp`} alt={`${entry.ref.asset} generated visual authority for ${entry.title}`}
        style={{ height: h }} />
      <figcaption>{entry.ref.asset} · SHA256 {entry.ref.sha}… · ORIGINAL C–J AUTHORITY</figcaption>
    </figure>
  );
}

export default function FoundationReviewStudioPage() {
  const [active, setActive] = useState('P13');
  const [device, setDevice] = useState<Device>('DESKTOP');
  const [mode, setMode] = useState<Mode>('COMPARE');
  const [projectId, setProjectId] = useState('');
  const [clientToken, setClientToken] = useState('');
  const [fixture, setFixture] = useState<{ state: 'idle' | 'loading' | 'ready' | 'error'; message?: string }>({ state: 'idle' });
  const [viewportRef, viewportWidth] = useWidth<HTMLDivElement>();
  const entry = entries.find((e) => e.id === active) ?? entries[0];
  const path = useMemo(() => entry.path(projectId.trim(), clientToken.trim()), [entry, projectId, clientToken]);
  const refOnly = entry.status === 'REFERENCE ONLY';
  const effectiveMode: Mode = refOnly ? 'REFERENCE' : mode;
  const { w, h } = DEVICE[device];

  useEffect(() => { setDevice(entry.ref.native); }, [entry]);

  const loadFixture = async () => {
    setFixture({ state: 'loading' });
    try {
      const res = await fetch('/api/dev/site00-digital-foundation-preview-bootstrap', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fixture_id: 'M_COMPLETE_CREDIT' }),
      });
      const json = (await res.json().catch(() => ({}))) as { public_token?: string; artifact?: { artifact_id?: string }; error?: string };
      if (!res.ok || !json.public_token || !json.artifact?.artifact_id) throw new Error(json.error ?? `HTTP ${res.status}`);
      setClientToken(json.public_token);
      setProjectId(json.artifact.artifact_id);
      setFixture({ state: 'ready' });
    } catch (e) {
      setFixture({ state: 'error', message: e instanceof Error ? e.message.toUpperCase() : 'FIXTURE UNAVAILABLE' });
    }
  };

  const gap = 16;
  const compare = effectiveMode === 'COMPARE';
  const stacked = viewportWidth < 500;
  const columnWidth = compare && !stacked ? Math.max(0, (viewportWidth - gap) / 2) : viewportWidth;
  const scale = columnWidth > 0 ? Math.min(1, columnWidth / w) : 1;
  const frameHeight = h * scale;

  return (
    <main className="df-review">
      <header className="df-review__top"><div><strong>SITE 00</strong><span>DIGITAL FOUNDATION / VISUAL REVIEW</span></div><span>FOUNDER ONLY · REVIEW BRANCH · NOT PUBLISHED</span></header>
      <section className="df-review__header">
        <div>
          <span className="df-review__kicker">ARTIFACT / IMPLEMENTATION REVIEW / V2 · VISUAL AUTHORITY</span>
          <h1>FOUNDATION<br />SCREEN INDEX<span>.</span></h1>
          <p>EACH LIVE REACT SCREEN BESIDE ITS ORIGINAL GENERATED AUTHORITY. LIVE DATA IS SHOWN WHERE AVAILABLE; UNAVAILABLE CONTEXT IS NEVER SIMULATED AS A SUCCESSFUL CLIENT STATE.</p>
        </div>
        <div className="df-review__count"><strong>08</strong><span>REVIEW ENTRIES / 05 SURFACES · 04 ADDITIONAL AUTHORITIES</span></div>
      </section>
      <div className="df-review__shell">
        <aside className="df-review__nav">
          <div className="df-review__aside-label">SCREEN FAMILY / SELECT TO REVIEW</div>
          {FAMILIES.map((f) => (
            <section key={f}>
              <h2>{f}</h2>
              {entries.filter((e) => e.family === f).map((e) => (
                <button type="button" className={active === e.id ? 'is-active' : ''} key={e.id} onClick={() => setActive(e.id)} aria-pressed={active === e.id}>
                  <small>{e.id}</small><span>{e.title}</span><b>{e.status === 'REFERENCE ONLY' ? 'REF' : '↗'}</b>
                </button>
              ))}
            </section>
          ))}
        </aside>
        <section className="df-review__main">
          <div className="df-review__controls">
            <div><strong>{entry.id} / {entry.title}</strong><p>{entry.note}</p></div>
            <div className="df-review__switches">
              <div className="df-review__devices" role="group" aria-label="View mode">
                {(['LIVE', 'COMPARE', 'REFERENCE'] as const).map((m) => (
                  <button type="button" key={m} aria-pressed={effectiveMode === m} disabled={refOnly && m !== 'REFERENCE'}
                    onClick={() => setMode(m)} className={effectiveMode === m ? 'is-active' : ''}>{m === 'COMPARE' ? 'SIDE BY SIDE' : m}</button>
                ))}
              </div>
              <div className="df-review__devices" role="group" aria-label="Device viewport">
                {(['MOBILE', 'TABLET', 'DESKTOP'] as const).map((d) => (
                  <button type="button" key={d} aria-pressed={device === d} disabled={effectiveMode === 'REFERENCE'}
                    onClick={() => setDevice(d)} className={device === d ? 'is-active' : ''}>{d}</button>
                ))}
              </div>
            </div>
          </div>
          {(entry.status === 'REQUIRES PROJECT' || entry.status === 'REQUIRES CLIENT TOKEN') && (
            <div className="df-review__token">
              {entry.status === 'REQUIRES PROJECT' ? (
                <label className="df-review__context">PROJECT ARTIFACT ID <input value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="PASTE A VERIFIED PROJECT ID" autoComplete="off" /></label>
              ) : (
                <label className="df-review__context">PERSONALIZED CLIENT TOKEN <input type="password" value={clientToken} onChange={(e) => setClientToken(e.target.value)} placeholder="ENTER A SAFE REVIEW TOKEN" autoComplete="off" /></label>
              )}
              <div className="df-review__fixture">
                <button type="button" onClick={loadFixture} disabled={fixture.state === 'loading'}>
                  {fixture.state === 'loading' ? 'LOADING FIXTURE…' : 'LOAD DEV PREVIEW FIXTURE'}
                </button>
                <p role={fixture.state === 'error' ? 'alert' : undefined}>
                  {fixture.state === 'ready' && 'FIXTURE M_COMPLETE_CREDIT LOADED — IN-MEMORY DEV RECORD (EXAMPLE.COM), NOT A CLIENT. RESETS WHEN THE DEV SERVER RESTARTS.'}
                  {fixture.state === 'error' && `FIXTURE UNAVAILABLE ON THIS HOST (${fixture.message}). USE A DISPOSABLE REVIEW ARTIFACT.`}
                  {fixture.state === 'idle' && (entry.status === 'REQUIRES CLIENT TOKEN'
                    ? 'USE A DISPOSABLE REVIEW ARTIFACT. THE TOKEN IS NOT STORED. THE REAL CLIENT ROUTE SHOWS EARLIER STAGES IF COMPLETION IS NOT VERIFIED.'
                    : 'DEV FIXTURE IS AN IN-MEMORY QA SCENARIO AVAILABLE ONLY ON THE PREVIEW SERVER.')}
                </p>
              </div>
            </div>
          )}
          <div className="df-review__viewport" ref={viewportRef} data-mode={effectiveMode} data-stacked={stacked}>
            {effectiveMode !== 'REFERENCE' && (
              <div className="df-review__col">
                {compare && <span className="df-review__col-label">LIVE REACT · {device} {w}×{h}</span>}
                <DeviceFrame path={path} title={`${entry.title} ${device} preview`} device={device} width={columnWidth} />
              </div>
            )}
            {effectiveMode !== 'LIVE' && (
              <div className="df-review__col">
                {compare && <span className="df-review__col-label">GENERATED AUTHORITY · {entry.ref.native}</span>}
                <ReferenceFrame entry={entry} width={columnWidth} height={compare ? Math.max(frameHeight, 360) : 760} />
              </div>
            )}
          </div>
          <div className="df-review__bottom">
            <span>{effectiveMode === 'REFERENCE' ? `REFERENCE / ${entry.ref.asset}` : `VIEWPORT / ${w}×${h} RENDERED AT ${Math.round(scale * 100)}% · LIVE REACT ROUTE · NOT A STATIC SCREENSHOT`}</span>
            {path && <a href={path} target="_blank" rel="noopener noreferrer">OPEN ACTUAL ROUTE ↗</a>}
          </div>
        </section>
      </div>
      <footer className="df-review__footer"><Link to={SITE00_ROUTES.digitalFoundationAdmin}>← RETURN TO DIGITAL FOUNDATION ADMIN</Link><span>REVIEW ONLY / NO APPROVAL OR DEPLOYMENT IMPLIED</span></footer>
    </main>
  );
}
