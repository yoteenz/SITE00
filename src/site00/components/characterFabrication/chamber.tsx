/**
 * FABRICATION CHAMBER — the workspace itself, not a backdrop.
 *
 * One persistent SUBJECT STAGE sits in a glass capsule. Every station is an operating MODE of the same apparatus:
 * the modules mounted around the capsule change, and approved upstream layers ACCUMULATE on the subject
 * (calibration marks → fitted garments → appearance layers → behavior field → motion rail → test envelope → locks).
 *
 * Honesty rules: the figure is a PROPORTION PROXY (live SVG), never invented human imagery. When a real subject asset
 * exists for `actor.sw017.body.neutral.front` (or the simulation feed slot while testing) it occupies the capsule.
 * Every overlay is driven by real FabricationState — nothing decorative claims data that does not exist.
 */
import type { ReactNode } from 'react';
import {
  CALIBRATION_FIXTURE,
  GARMENT_BY_ID,
  SKIN_BY_ID,
  STATION_LABEL,
  STATION_ORDER,
  stationNumber,
  type BehaviorRole,
  type StationId,
  type StationStatus,
} from '../../../../shared/site00-character-fabrication/index.js';
import { useFabrication } from './FabricationContext';
import { CfImage } from './CfImage';
import { IcArrowR, IcLock } from '../productionHub/icons';

export const ROLE_COLOR: Record<BehaviorRole, string> = { PRIMARY: '#e5231b', SECONDARY: '#3c8fd0', ACCENT: '#d9a21f', FOUNDATIONAL: '#8a8c94' };

const DONE: StationStatus[] = ['APPROVED', 'LOCKED'];
const SUBJECT_SLOT = 'actor.sw017.body.neutral.front';
const FEED_SLOT = 'simulation.sw017.current.preview';

const MODE_TITLE: Record<StationId, { op: string; verb: string }> = {
  identity: { op: 'SOURCE INTAKE', verb: 'WHO IS THE SOURCE PERFORMER' },
  body: { op: 'CALIBRATION', verb: 'APPROVED PHYSICAL BASELINE' },
  look: { op: 'FITTING', verb: 'WHAT THE CHARACTER WEARS' },
  appearance: { op: 'APPEARANCE LAYERING', verb: 'HAIR + MAKEUP APPLIED TO SUBJECT' },
  character: { op: 'ROLE CONSTRUCTION', verb: 'WHO THE ACTOR BECOMES' },
  performance: { op: 'ACTIVATION', verb: 'WHAT THE CHARACTER CAN DO' },
  simulation: { op: 'CONTROLLED TEST', verb: 'DOES IT HOLD TOGETHER' },
  authority: { op: 'AUTHORITY LOCK', verb: 'WHAT IS NOW CANONICAL' },
};

/* ── subject proportion proxy (SVG, capsule coordinates) ─────────────────── */

const P = {
  head: 'M195 66c9 0 15 7 15 18s-6 20-15 20-15-9-15-20 6-18 15-18z',
  torso: 'M171 112q24-8 48 0l7 58q-4 26-12 38h-38q-8-12-12-38z',
  hips: 'M176 206h38l5 24h-48z',
  legL: 'M172 228h21l-3 62-4 44h-12l2-44z',
  legR: 'M197 228h21l-4 62 2 44h-12l-4-44z',
  armL: 'M170 114l-10 6-11 60-2 34h8l6-32 11-46z',
  armR: 'M220 114l10 6 11 60 2 34h-8l-6-32-11-46z',
  neck: 'M189 100h12v14h-12z',
  hair: 'M180 84c-1-14 6-22 15-22s17 8 15 22c-2-8-8-11-15-11s-13 3-15 11z',
  feetL: 'M172 330h14v6h-16z',
  feetR: 'M204 330h14l2 6h-16z',
};
const BODY_PARTS = ['head', 'neck', 'torso', 'hips', 'legL', 'legR', 'armL', 'armR'] as const;
const CAL_LINES = [
  { y: 66, k: 'HEAD' },
  { y: 114, k: 'SHOULDER' },
  { y: 206, k: 'HIP' },
  { y: 280, k: 'KNEE' },
  { y: 336, k: 'FLOOR' },
];

function SubjectProxy({ mode }: { mode: StationId }) {
  const { state } = useFabrication();
  const f = state.fitting;
  const hidden = new Set(state.fittingHidden);
  const sw = (k: 'L1' | 'L2' | 'L3' | 'L4') => (f[k] && !hidden.has(k) ? GARMENT_BY_ID[f[k]!]?.swatch ?? null : null);
  const top = sw('L1');
  const bottom = sw('L2');
  const outer = sw('L3');
  const shoes = sw('L4');
  const layers = state.appearanceLayers;
  const hairL = layers.find((l) => l.layerId === 'hairStyle');
  const hairOn = !!hairL?.visible && (state.touched.appearance || state.authority.appearance !== 'NONE');
  const bodyCal = state.bodyCalibrated;
  const bodyLocked = state.authority.body === 'LOCKED' && !state.stale.body;
  return (
    <g className="cf-subj" data-subject-proxy>
      {/* base form */}
      {BODY_PARTS.map((k) => <path key={k} d={P[k]} className="cf-subj__base" />)}
      <path d={P.feetL} className="cf-subj__base" />
      <path d={P.feetR} className="cf-subj__base" />
      {/* LOOK — fitted garments accumulate on the form (real fitting state) */}
      {top ? <path d={P.torso} fill={top} className="cf-subj__garment" data-layer="L1" /> : null}
      {bottom ? (
        <g data-layer="L2">
          <path d={P.hips} fill={bottom} className="cf-subj__garment" />
          <path d={P.legL} fill={bottom} className="cf-subj__garment" />
          <path d={P.legR} fill={bottom} className="cf-subj__garment" />
        </g>
      ) : null}
      {outer ? (
        <g data-layer="L3">
          <path d={P.armL} fill={outer} className="cf-subj__garment" />
          <path d={P.armR} fill={outer} className="cf-subj__garment" />
          <path d="M171 112q24-8 48 0l7 58q-2 14-6 24h-6l-2-70h-34l-2 70h-6q-4-10-6-24z" fill={outer} className="cf-subj__garment" />
        </g>
      ) : null}
      {shoes ? (
        <g data-layer="L4">
          <path d={P.feetL} fill={shoes} className="cf-subj__garment" />
          <path d={P.feetR} fill={shoes} className="cf-subj__garment" />
        </g>
      ) : null}
      {/* HAIR + MAKEUP — hair layer mass, opacity from the live layer */}
      {hairOn ? <path d={P.hair} className="cf-subj__hair" style={{ opacity: ((hairL?.opacity ?? 100) / 100) * 0.9 }} data-layer="hair" /> : null}
      {/* BODY — calibration marks persist once calibrated; turn green when locked */}
      {bodyCal || mode === 'body'
        ? CAL_LINES.map((l) => (
            <g key={l.k} className={`cf-cal ${bodyLocked ? 'is-locked' : bodyCal ? 'is-cal' : ''}`}>
              <line x1="140" x2="250" y1={l.y} y2={l.y} />
              <line x1="140" x2="146" y1={l.y - 3} y2={l.y - 3} />
            </g>
          ))
        : null}
    </g>
  );
}

/* ── capsule + structure ───────────────────────────────────────────────── */

function Structure({ mode, running }: { mode: StationId; running: boolean }) {
  return (
    <g aria-hidden>
      <defs>
        <linearGradient id="cfChrome" x1="0" x2="1">
          <stop offset="0" stopColor="#8d929b" />
          <stop offset=".35" stopColor="#f7f8fa" />
          <stop offset=".55" stopColor="#c6cad1" />
          <stop offset="1" stopColor="#7d828c" />
        </linearGradient>
        <linearGradient id="cfGlass2" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".2" />
          <stop offset=".12" stopColor="#eef3f7" stopOpacity=".75" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".1" />
          <stop offset=".88" stopColor="#eef3f7" stopOpacity=".7" />
          <stop offset="1" stopColor="#fff" stopOpacity=".2" />
        </linearGradient>
        <radialGradient id="cfPlate" cx=".5" cy=".45" r=".6">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".7" stopColor="#dde0e5" />
          <stop offset="1" stopColor="#b8bcc4" />
        </radialGradient>
        <linearGradient id="cfSubj" x1="0" x2="1">
          <stop offset="0" stopColor="#c9ccd3" />
          <stop offset=".45" stopColor="#f3f4f6" />
          <stop offset="1" stopColor="#b9bdc5" />
        </linearGradient>
      </defs>
      {/* back wall: panel seams + ceiling light strips */}
      {[0, 48, 96, 294, 342].map((x) => <rect key={x} x={x} y="0" width="48" height="330" className="cf-wall" />)}
      {[18, 38].map((y) => <line key={y} x1="0" x2="390" y1={y} y2={y} className="cf-lightstrip" />)}
      {/* gantry columns with joints */}
      {[70, 320].map((x) => (
        <g key={x}>
          <rect x={x - 7} y="30" width="14" height="318" fill="url(#cfChrome)" className="cf-col" />
          {[80, 160, 240, 310].map((y) => <rect key={y} x={x - 10} y={y} width="20" height="7" rx="1.5" className="cf-joint" />)}
        </g>
      ))}
      {/* top ring */}
      <ellipse cx="195" cy="44" rx="128" ry="22" fill="none" stroke="url(#cfChrome)" strokeWidth="9" />
      <ellipse cx="195" cy="44" rx="96" ry="15" className={`cf-ring-red${running ? ' is-live' : ''}`} />
      {/* capsule glass */}
      <rect x="126" y="44" width="138" height="302" fill="url(#cfGlass2)" className="cf-capsule" />
      <line x1="126" x2="126" y1="44" y2="346" className="cf-capsule-edge" />
      <line x1="264" x2="264" y1="44" y2="346" className="cf-capsule-edge" />
      {/* calibration ticks on capsule edge (structural; brighter in body mode) */}
      <g className={`cf-ticks${mode === 'body' ? ' is-on' : ''}`}>
        {Array.from({ length: 26 }, (_, i) => 60 + i * 11).map((y, i) => <line key={y} x1="126" x2={i % 5 === 0 ? 136 : 131} y1={y} y2={y} />)}
      </g>
      {/* platform */}
      <ellipse cx="195" cy="356" rx="170" ry="30" fill="url(#cfPlate)" className="cf-plate" />
      <ellipse cx="195" cy="352" rx="120" ry="19" className="cf-plate-ring" />
      <ellipse cx="195" cy="350" rx="84" ry="12" className={`cf-ring-red${running ? ' is-live' : ''}`} />
    </g>
  );
}

/* ── mode apparatus (SVG parts that live inside the chamber coordinate system) ── */

function ModeApparatus({ mode }: { mode: StationId }) {
  const { state } = useFabrication();
  if (mode === 'body')
    return (
      <g className="cf-app cf-app--body" aria-hidden>
        <line x1="130" x2="260" y1="60" y2="60" className="cf-scan" />
        <rect x="136" y="60" width="118" height="276" className="cf-calframe" />
        {['FRONT', 'SIDE', 'BACK'].map((v, i) => (
          <text key={v} x={150 + i * 45} y="344" className={`cf-svglabel${state.bodyView === v ? ' is-on' : ''}`}>{v}</text>
        ))}
      </g>
    );
  if (mode === 'identity')
    return (
      <g className="cf-app" aria-hidden>
        <path d="M92 250 C 120 250 128 210 150 200" className="cf-link-line" />
        <path d="M240 200 C 262 210 270 150 298 150" className="cf-link-line cf-link-line--red" />
      </g>
    );
  if (mode === 'look') {
    const ys = { L1: 150, L2: 262, L3: 184, L4: 332 } as const;
    return (
      <g className="cf-app" aria-hidden>
        <line x1="300" x2="300" y1="96" y2="336" className="cf-rail-v" />
        {(['L1', 'L2', 'L3', 'L4'] as const).map((k, i) => (
          <path key={k} d={`M300 ${112 + i * 58} L 270 ${112 + i * 58} L 232 ${ys[k]}`} className={`cf-link-line${state.fitting[k] ? ' cf-link-line--red' : ''}`} />
        ))}
      </g>
    );
  }
  if (mode === 'appearance')
    return (
      <g className="cf-app" aria-hidden>
        {[...state.appearanceLayers].sort((a, b) => a.order - b.order).map((l, i) => (
          <path key={l.layerId} d={`M141 ${115 + i * 14} C 158 ${115 + i * 14} 164 ${78 + i * 4} 181 ${76 + i * 4}`} className={`cf-link-line${l.visible ? ' cf-link-line--red' : ''}`} style={{ opacity: l.visible ? 0.25 + l.opacity / 140 : 0.15, strokeWidth: 0.6 }} />
        ))}
      </g>
    );
  if (mode === 'character') {
    const total = 2 * Math.PI * 150;
    let acc = 0;
    return (
      <g className="cf-app" aria-hidden>
        {state.behaviorLayers.map((l) => {
          const len = (l.weight / 400) * total;
          const off = acc;
          acc += len + 6;
          return <ellipse key={l.skinId} cx="195" cy="200" rx="150" ry="150" className="cf-field" stroke={ROLE_COLOR[l.role]} strokeDasharray={`${len} ${total}`} strokeDashoffset={-off} transform="rotate(-90 195 200)" />;
        })}
      </g>
    );
  }
  if (mode === 'performance')
    return (
      <g className="cf-app" aria-hidden>
        <path d="M60 372 H330" className="cf-motionrail" />
        <path d="M150 338 C 170 318 220 318 240 338" className={`cf-trail${state.motionPlaying ? ' is-live' : ''}`} />
        <path d="M140 300 C 165 270 225 270 250 300" className={`cf-trail${state.motionPlaying ? ' is-live' : ''}`} />
      </g>
    );
  if (mode === 'simulation') {
    const n = (state.run?.config.cameraAngles ?? state.simConfig.cameraAngles) as number;
    const pos = [[40, 70], [350, 70], [40, 300], [350, 300]].slice(0, n);
    return (
      <g className="cf-app" aria-hidden>
        <rect x="112" y="52" width="166" height="302" className="cf-envelope" />
        {pos.map(([x, y], i) => (
          <g key={i} className="cf-cam">
            <rect x={x! - 9} y={y! - 6} width="18" height="12" rx="2" />
            <line x1={x} y1={y} x2="195" y2="200" />
          </g>
        ))}
      </g>
    );
  }
  if (mode === 'authority')
    return (
      <g className="cf-app" aria-hidden>
        <ellipse cx="195" cy="200" rx="104" ry="168" className="cf-lockring" />
        <ellipse cx="195" cy="200" rx="92" ry="156" className="cf-lockring cf-lockring--inner" />
      </g>
    );
  return null;
}

/* ── HTML modules mounted on the apparatus ─────────────────────────────── */

function AuthorityModule({ side, eyebrow, title, sub, slotId, status, children }: { side: 'l' | 'r'; eyebrow: string; title: string; sub: string; slotId?: string; status?: ReactNode; children?: ReactNode }) {
  const { url } = useFabrication();
  return (
    <div className={`cf-amod cf-amod--${side}`} data-testid={side === 'l' ? 'cf-actor-card' : 'cf-character-card'}>
      {slotId ? <CfImage slotId={slotId} url={url(slotId)} label="" className="cf-amod__img" /> : null}
      <span className="cf-amod__txt">
        <small>{eyebrow}</small>
        <b>{title}</b>
        <em>{sub}</em>
        {status}
      </span>
      {children}
    </div>
  );
}

function Beacon({ tone }: { tone: 'red' | 'green' | 'amber' | 'grey' }) {
  return <i className={`cf-beacon cf-beacon--${tone}`} aria-hidden />;
}

function Dock({ at, children, testId, className = '' }: { at: string; children: ReactNode; testId?: string; className?: string }) {
  return (
    <div className={`cf-dock cf-dock--${at} ${className}`} data-testid={testId}>
      {children}
    </div>
  );
}

function ModeModules({ mode }: { mode: StationId }) {
  const { state, dispatch, actor, character, url, status, now } = useFabrication();
  switch (mode) {
    case 'identity':
      return (
        <>
          <Dock at="bl" testId="cf-identity-dock">
            <small>SOURCE PERFORMER</small>
            <b>{actor.catalogueNumber}</b>
            <span>{actor.stageName.toUpperCase()}</span>
            <span className="cf-dock__row">
              <button type="button" className="cf-chip" data-testid="cf-view-actor-profile" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'ACTOR_PROFILE' })}>PROFILE</button>
              <button type="button" className="cf-chip" data-testid="cf-change-actor" onClick={() => dispatch({ type: 'CHANGE_ACTOR', at: now() })}>CHANGE</button>
            </span>
          </Dock>
          <Dock at="r" testId="cf-target-dock">
            <small>INSTANTIATES</small>
            <b>{character.displayName}</b>
            <span>NDXBOOK · ENTRY {state.selectedEntryId}</span>
            <span className="cf-dim">{character.version} · ROLE RECORD</span>
          </Dock>
        </>
      );
    case 'body': {
      const cal = state.bodyCalibrated;
      return (
        <>
          <Dock at="l" testId="cf-cal-dock">
            {CAL_LINES.map((l) => <span key={l.k} className="cf-dock__tick" style={{ top: `${(l.y / 420) * 100}%` }}>{l.k}</span>)}
          </Dock>
          <Dock at="r" testId="cf-cal-readout">
            <small>CALIBRATION</small>
            <b className={cal ? '' : 'cf-dim'}>{cal ? `${CALIBRATION_FIXTURE.alignmentPct}%` : 'NOT RUN'}</b>
            <span>{cal ? `± ${CALIBRATION_FIXTURE.overall}% · FIXTURE` : 'RUN IN INSPECTOR'}</span>
            <span>BASE {state.selectedBodyVersionId}</span>
            <span className={state.authority.body === 'LOCKED' ? 'cf-ok' : 'cf-dim'}>{state.authority.body === 'LOCKED' ? 'BASELINE LOCKED' : 'BASELINE OPEN'}</span>
            <button type="button" className="cf-chip" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'BODY_INSPECTOR' })}>INSPECT</button>
          </Dock>
          <div className="cf-viewsel" role="group" aria-label="Calibration view">
            {(['FRONT', 'SIDE', 'BACK'] as const).map((v) => (
              <button key={v} type="button" aria-pressed={state.bodyView === v} className={state.bodyView === v ? 'is-on' : ''} onClick={() => dispatch({ type: 'BODY_VIEW', view: v })}>{v}</button>
            ))}
          </div>
        </>
      );
    }
    case 'look':
      return (
        <Dock at="rail" testId="cf-fitting-rail">
          {(['L1', 'L2', 'L3', 'L4'] as const).map((k) => {
            const g = state.fitting[k] ? GARMENT_BY_ID[state.fitting[k]!] : null;
            const off = state.fittingHidden.includes(k);
            return (
              <button key={k} type="button" className={`cf-gdock${g ? ' is-set' : ''}${off ? ' is-off' : ''}`} disabled={!g} aria-pressed={!!g && !off} onClick={() => dispatch({ type: 'TOGGLE_FITTING_LAYER', layer: k })} data-testid={`cf-gdock-${k}`}>
                <i style={{ background: g?.swatch ?? 'transparent' }} />
                <small>{k} · {['TOP', 'BOTTOM', 'OUTER', 'FOOT'][Number(k[1]) - 1]}</small>
                <b>{g ? g.name.replace(/ - \d+$/, '') : 'EMPTY SOCKET'}</b>
              </button>
            );
          })}
          <span className="cf-dock__foot">{state.fittingSubmitted ? 'IN FITTING STATION' : 'PULL FROM LIBRARY ↓'}</span>
        </Dock>
      );
    case 'appearance':
      return (
        <Dock at="rack" testId="cf-appearance-rack">
          {[...state.appearanceLayers].sort((a, b) => a.order - b.order).map((l) => (
            <button key={l.layerId} type="button" className={`cf-track${l.visible ? '' : ' is-off'}${state.selectedAppearanceLayerId === l.layerId ? ' is-sel' : ''}`} onClick={() => dispatch({ type: 'SELECT_APPEARANCE_LAYER', layerId: l.layerId })} aria-pressed={state.selectedAppearanceLayerId === l.layerId}>
              <i style={{ width: `${l.visible ? l.opacity : 0}%` }} />
              <span>{l.layerId.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
            </button>
          ))}
        </Dock>
      );
    case 'character': {
      const slots = ['tl', 'tr', 'bl', 'br'];
      return (
        <>
          {state.behaviorLayers.map((l, i) => {
            const s = SKIN_BY_ID[l.skinId]!;
            return (
              <div key={l.skinId} className={`cf-bmod cf-bmod--${slots[i] ?? 'br'}`} style={{ ['--role' as string]: ROLE_COLOR[l.role] }} data-testid={`cf-blayer-${l.skinId}`}>
                <small>{l.role}</small>
                <b>{s.name}</b>
                <output>{l.weight}%</output>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={l.weight}
                  aria-label={`${s.name} weight`}
                  data-testid={`cf-bweight-${l.skinId}`}
                  className="cf-slider"
                  style={{ ['--cf-fill' as string]: `${l.weight}%`, ['--cf-accent' as string]: ROLE_COLOR[l.role] }}
                  onChange={(e) => dispatch({ type: 'BEHAVIOR_WEIGHT', skinId: l.skinId, weight: Number(e.target.value) })}
                />
                {state.behaviorLayers.length > 1 ? <button type="button" className="cf-bmod__x" aria-label={`Remove ${s.name}`} onClick={() => dispatch({ type: 'REMOVE_BEHAVIOR_LAYER', skinId: l.skinId })}>×</button> : null}
              </div>
            );
          })}
          <span className="cf-transform" data-testid="cf-transform">{actor.catalogueNumber} <IcArrowR width={10} height={10} /> {character.displayName}</span>
        </>
      );
    }
    case 'performance': {
      const used = state.motionUsedIds[0];
      return (
        <Dock at="floor" testId="cf-motion-dock">
          <Beacon tone={state.motionPlaying ? 'red' : used ? 'green' : 'grey'} />
          <b>{state.selectedMotionId}</b>
          <span>{state.motionPlaying ? 'PREVIEWING' : used ? `IN USE · ${state.motionUsedIds.length} ATTACHED` : 'SELECT + USE'}</span>
          {state.motionRequests.some((r) => r.stage !== 'PUBLISH_ASSET') ? <span className="cf-red">MOTION REQUEST OPEN</span> : null}
        </Dock>
      );
    }
    case 'simulation': {
      const r = state.run;
      const phase = !r ? 'CONFIGURE' : r.status === 'COMPLETE' ? 'RESULT' : r.status;
      const res = r && r.status === 'COMPLETE' ? state.results.find((x) => x.simulationId === r.simulationId) : null;
      const pct = r ? Math.round((r.elapsedMs / (r.config.durationSec * 1000)) * 100) : 0;
      return (
        <Dock at="r" testId="cf-test-dock">
          <small>TESTING GROUND · {(r?.config.environment ?? state.simConfig.environment)}</small>
          <b className={phase === 'RUNNING' ? 'cf-red' : ''}><Beacon tone={phase === 'RUNNING' ? 'red' : res ? (res.failed ? 'amber' : 'green') : 'grey'} /> {phase}</b>
          <span>TEST {r?.testId ?? state.selectedTestId}</span>
          {r && phase !== 'RESULT' ? <span>{pct}% · {r.simulationId}</span> : null}
          {res ? <span className={res.failed ? 'cf-red' : 'cf-ok'}>{res.failed ? `${res.failed} OF ${res.checks.length} FAILED` : 'ALL CHECKS PASS'}</span> : null}
          <span className="cf-dim">LEVEL 2 · CACHED PREVIEW</span>
        </Dock>
      );
    }
    case 'authority':
      return (
        <div className="cf-seals" data-testid="cf-authority-seals">
          {STATION_ORDER.filter((s) => s !== 'authority').map((s, i) => {
            const st = status(s);
            return (
              <button key={s} type="button" className={`cf-seal cf-seal--${i}`} data-seal-status={st} onClick={() => dispatch({ type: 'GOTO_STATION', station: s })}>
                <b>{stationNumber(s)}</b>
                <small>{STATION_LABEL[s]}</small>
              </button>
            );
          })}
          <span className={`cf-seal__core${state.finalSignedOff ? ' is-locked' : ''}`}><IcLock width={14} height={14} /> {state.finalSignedOff ? 'CANONICAL' : 'AWAITING LOCK'}</span>
        </div>
      );
  }
  void url;
  return null;
}

/* ── the chamber ───────────────────────────────────────────────────────── */

export function FabricationChamber({ mode }: { mode: StationId }) {
  const { state, actor, character, url, status } = useFabrication();
  const r = state.run;
  const running = mode === 'simulation' && !!r && (r.status === 'RUNNING' || r.status === 'PAUSED');
  const feedUrl = mode === 'simulation' && r ? url(FEED_SLOT) : null;
  // appearance works on a head/face close-up of the same subject; its asset slot is the current appearance primary
  const subjectSlot = mode === 'appearance' ? 'appearance.sw017.compare.current.primary' : SUBJECT_SLOT;
  const subjectUrl = url(subjectSlot);
  const t = MODE_TITLE[mode];
  const inFab = status('authority') !== 'LOCKED';
  const accumulated = STATION_ORDER.filter((s) => s !== 'authority' && DONE.includes(status(s)));
  return (
    <section className={`cf-chamber cf-chamber--${mode}${running ? ' is-running' : ''}`} data-testid="cf-machine" data-mode={mode} aria-label={`Fabrication chamber — ${t.op}`}>
      <svg className="cf-chamber__svg" viewBox={mode === 'appearance' ? '95 48 200 216' : '0 0 390 420'} preserveAspectRatio="xMidYMid meet" role="img" aria-label={`Subject in ${t.op.toLowerCase()} mode`}>
        <Structure mode={mode} running={running} />
        <ModeApparatus mode={mode} />
        {subjectUrl || feedUrl ? null : <SubjectProxy mode={mode} />}
      </svg>
      {/* real subject asset (future Grok) occupies the capsule; until then the slot is declared on the proxy */}
      <div className="cf-capsule-slot" data-asset-slot={feedUrl ? FEED_SLOT : subjectSlot} data-asset-state={subjectUrl || feedUrl ? 'filled' : 'missing'}>
        {feedUrl ? <CfImage slotId={FEED_SLOT} url={feedUrl} label="" className="cf-capsule-img" /> : subjectUrl ? <CfImage slotId={subjectSlot} url={subjectUrl} label="" className="cf-capsule-img" /> : <span className="cf-proxy-tag">{mode === 'appearance' ? 'CLOSE-UP · HEAD + FACE · PROXY' : 'PROPORTION PROXY · SUBJECT ASSET PENDING'}</span>}
      </div>
      <header className="cf-chamber__mode" data-testid="cf-mode-plate">
        <b>{stationNumber(mode)}</b>
        <span><strong>{t.op}</strong><small>{t.verb}</small></span>
      </header>
      <AuthorityModule side="l" eyebrow="ACTOR · SOURCE" title={actor.catalogueNumber} sub={actor.verified ? '✓ VERIFIED' : 'PENDING'} slotId={actor.portraitSlotId} />
      <AuthorityModule
        side="r"
        eyebrow="CHARACTER · CONSTRUCTION"
        title={character.displayName}
        sub={`ENTRY ${state.selectedEntryId} · ${character.version}`}
        status={<em className={inFab ? 'cf-amod__st' : 'cf-amod__st is-ok'}>{inFab ? 'IN FABRICATION' : 'CANONICAL'}</em>}
      />
      <ModeModules mode={mode} />
      <div className="cf-stack" data-testid="cf-stack" aria-label="Accumulated authority">
        {STATION_ORDER.filter((s) => s !== 'authority').map((s) => (
          <i key={s} className={accumulated.includes(s) ? 'is-on' : status(s) === 'STALE' || status(s) === 'REVISION_REQUIRED' ? 'is-warn' : ''} title={STATION_LABEL[s]} />
        ))}
        <small>STACK {accumulated.length}/7</small>
      </div>
    </section>
  );
}

/** Compact persistent subject for full-surface states (profile, inspector, compare, request). */
export function SubjectBar({ mode, label }: { mode: StationId; label: string }) {
  const { actor, character, status, dispatch } = useFabrication();
  const accumulated = STATION_ORDER.filter((s) => s !== 'authority' && DONE.includes(status(s)));
  return (
    <div className="cf-subjectbar" data-testid="cf-subject-bar" data-mode={mode}>
      <svg viewBox="140 56 110 290" className="cf-subjectbar__fig" aria-hidden>
        {BODY_PARTS.map((k) => <path key={k} d={P[k]} className="cf-subj__base" />)}
      </svg>
      <span className="cf-subjectbar__txt">
        <small>{stationNumber(mode)} · {label}</small>
        <b>{actor.catalogueNumber} <IcArrowR width={10} height={10} /> {character.displayName}</b>
        <span className="cf-stack cf-stack--inline">
          {STATION_ORDER.filter((s) => s !== 'authority').map((s) => <i key={s} className={accumulated.includes(s) ? 'is-on' : ''} />)}
          <small>STACK {accumulated.length}/7</small>
        </span>
      </span>
      <button type="button" className="cf-chip" onClick={() => dispatch({ type: 'SET_SURFACE', surface: 'STATION' })} data-testid="cf-return-chamber">CHAMBER</button>
    </div>
  );
}
