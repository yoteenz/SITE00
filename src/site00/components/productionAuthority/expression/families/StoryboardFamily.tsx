/**
 * 06 STORYBOARD — root · sequence-detail · keyframes.
 * Source: hub storyboard frames (canonical pipeline panels), Entry 002 scenes (reel beat sequence), hub graph
 * storyboard / keyframes node status and the founder gate. The approve / revise decision is the existing hub
 * action (decideStoryboard) and is enabled only when the gate is open on the storyboard node and decidable.
 *
 * Frames are the subject (STUDIOOS_EXPRESSION_AUTHORITY_LITE_v2 / 06_Storyboard): every route opens on a large
 * inspectable frame (the stage grows to fill its pane — it never collapses to the filmstrip), boards are a grid
 * of frames sized to inspect, and keyframes are START · MID · END over a large keyframe view.
 */
import { useState } from 'react';
import { frameSlotId } from '../../../../../../shared/site00-production-hub/index.js';
import { pad2 } from '../../primitives';
import { words } from '../expressionData';
import type { MediaItem } from '../expressionMedia';
import { Actions, Btn, Chip, Empty, Grid, Img, Kv, MediaImg, Meter, Panel, Row, type Tone } from '../ExpressionFamilyShell';
import { MediaCard, MediaGrid, useMediaInspector } from '../ExpressionMediaKit';
import type { FamilyProps } from './types';

const ENGINE_ROUTE = (slug: string) => `/projects/${slug}/content-operations/expression-engine`;
const nodeTone = (s: string | undefined): Tone => (s === 'COMPLETE' ? 'green' : s === 'BLOCKED' ? 'red' : s === 'REVIEW_REQUIRED' || s === 'ACTIVE' ? 'amber' : 'gray');

export function StoryboardDecision({ d, testId = 'storyboard-decision' }: { d: FamilyProps['d']; testId?: string }) {
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const gate = d.graph?.founderGate;
  const can = !!(d.hub && gate?.open && gate.nodeId === 'storyboard' && gate.decidableInHub);
  const reason = !gate?.open ? 'No founder gate is open' : gate.nodeId !== 'storyboard' ? `Founder gate is on ${words(gate.nodeId ?? '').toUpperCase()}` : 'Gate is not decidable here';
  const decide = async (decision: 'APPROVE' | 'REVISE') => {
    if (!d.hub) return;
    const res = await d.hub.decideStoryboard(decision, note);
    setMsg(res.ok ? (decision === 'APPROVE' ? 'STORYBOARD AUTHORITY APPROVED' : 'REVISION REQUESTED') : `NOT RECORDED · ${res.error}`);
  };
  return (
    <Actions testId={testId} note={msg ?? (can ? gate!.detail : reason.toUpperCase())}>
      <Btn variant="red" onClick={() => decide('APPROVE')} disabled={!can || d.hub?.deciding} reason={reason} testId="storyboard-approve">
        APPROVE STORYBOARD
      </Btn>
      <Btn onClick={() => decide('REVISE')} disabled={!can || d.hub?.deciding} reason={reason} testId="storyboard-revise">
        REQUEST REVISION
      </Btn>
      {can ?
        <input className="exf-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Revision note" aria-label="Revision note" data-testid="storyboard-note" />
      : null}
    </Actions>
  );
}

export function StoryboardFamily({ d, r, go }: FamilyProps) {
  const [frame, setFrame] = useState(0);
  const insp = useMediaInspector();
  if (!d.ok) return <Empty title="NO CAMPAIGN ENTRY IN PRODUCTION" testId="expression-no-entry" />;
  const sb = d.itemFor('storyboard');
  const sbNode = d.graph?.byId.storyboard;
  const kfNode = d.graph?.byId.keyframes;
  const url = (i: number) => (d.frames[i] ? (d.assetUrl(frameSlotId(d.frames[i]!)) ?? d.frames[i]!.canonicalUrl) : null);
  const filled = d.frames.filter((_, i) => !!url(i)).length;
  const engine = (
    <Btn variant="ghost" to={ENGINE_ROUTE(d.slug)} testId="storyboard-open-engine">
      OPEN STORYBOARD IN EXPRESSION ENGINE
    </Btn>
  );
  const frameSlides = d.frames.map((f, i) => ({
    url: url(i) ?? '',
    label: `F${pad2(f.number)}`,
    meta: url(i) ? 'RENDERED · STORYBOARD PIPELINE' : 'SLOT EMPTY',
  }));
  const frameItems: MediaItem[] = d.frames.flatMap((f, i) => (url(i) ? [{ url: url(i)!, label: `F${pad2(f.number)}`, source: 'STORYBOARD PIPELINE · ENTRY 002' }] : []));

  /** Filmstrip rail (selection) — rides under the stage. */
  const filmstrip = (sel: number, onSel: (i: number) => void, testId = 'storyboard-filmstrip') =>
    d.frames.length ?
      <div className="exf-frames exf-frames--rail" data-testid={testId} data-layout="rail" data-scroll="internal-x">
        {d.frames.map((f, i) => (
          <button key={f.frameId} type="button" className={`exf-frame${sel === i ? ' is-active' : ''}`} onClick={() => onSel(i)} aria-pressed={sel === i} data-testid="storyboard-frame">
            <Img url={url(i)} slotId={frameSlotId(f)} label={`F${pad2(f.number)}`} />
            <small>F{pad2(f.number)}</small>
          </button>
        ))}
      </div>
    : <Empty title="NO STORYBOARD FRAMES" body="FRAMES APPEAR WHEN THE STORYBOARD PIPELINE PRODUCES PANELS." />;

  /** Boards grid: frames sized to inspect; selecting a board drives the stage. */
  const boards = (sel: number, onSel: (i: number) => void, cols: { d: number; t: number; m: number }, testId = 'storyboard-boards') =>
    d.frames.length ?
      <MediaGrid cols={cols} testId={testId} className="exs-boards">
        {d.frames.map((f, i) => {
          const u = url(i);
          return (
            <MediaCard
              key={f.frameId}
              media={u ? { url: u, label: `F${pad2(f.number)}`, source: 'STORYBOARD PIPELINE · ENTRY 002' } : null}
              title={
                <button type="button" className="exs-pick" onClick={() => onSel(i)} aria-pressed={sel === i} data-testid="storyboard-board">
                  F{pad2(f.number)}
                </button>
              }
              active={sel === i}
              focus="50% 50%"
              onInspect={u ? () => insp.open(frameItems, frameItems.findIndex((m) => m.url === u), 'STORYBOARD') : undefined}
              emptyLabel={`F${pad2(f.number)} · SLOT EMPTY`}
            />
          );
        })}
      </MediaGrid>
    : <Empty title="NO STORYBOARD FRAMES" body="FRAMES APPEAR WHEN THE STORYBOARD PIPELINE PRODUCES PANELS." />;

  /** Stage: the selected frame large (grows to the pane) + filmstrip under it. */
  const boardStage = (sel: number, onSel: (i: number) => void) => {
    const f = d.frames[sel];
    return (
      <div className="exf-storyboard-stage" data-testid="storyboard-stage">
        <div className="exf-storyboard-stage__hero">
          {f ?
            <MediaImg
              url={url(sel)}
              slotId={frameSlotId(f)}
              label={`F${pad2(f.number)} · STORYBOARD`}
              title={`FRAME F${pad2(f.number)}`}
              fit="contain"
              gallery={frameSlides.filter((s) => s.url)}
              galleryIndex={Math.max(0, frameSlides.filter((s) => s.url).findIndex((s) => s.url === url(sel)))}
              testId="storyboard-active-frame"
            />
          : <Empty title="NO FRAME SELECTED" />}
        </div>
        {filmstrip(sel, onSel)}
      </div>
    );
  };
  const sequences = d.scenes.map((s) => (
    <Row
      key={s.sceneId}
      to={go('storyboard', 'sequence-detail', s.sceneId)}
      testId="storyboard-sequence-row"
      active={r.param === s.sceneId}
      media={<em className="exf-num">{pad2(s.order)}</em>}
      title={s.label}
      sub={s.durationRange ?? s.purpose}
    />
  ));
  const progress = (
    <div className="exf-progress" data-testid="storyboard-progress">
      <Kv
        rows={[
          ['STORYBOARD', <Chip tone={nodeTone(sbNode?.status)}>{words(sbNode?.status ?? sb.status)}</Chip>],
          ['FRAMES', `${filled} / ${d.frames.length} RENDERED`],
          ['GATE', sb.detail],
          ['VERSION', d.hub?.storyboardVersion ?? '—'],
        ]}
      />
      <Meter value={filled} max={Math.max(1, d.frames.length)} label="Frames rendered" />
    </div>
  );

  let body;
  switch (r.route.id) {
    case 'sequence-detail': {
      const s = d.scenes.find((x) => x.sceneId === r.param);
      if (!s) return <Empty title="SEQUENCE NOT FOUND" body="NO SCENE WITH THIS ID IN ENTRY 002." testId="storyboard-sequence-missing" />;
      const beat = d.plan.beats.find((b) => b.beatId === s.sceneId);
      const idx = d.scenes.indexOf(s);
      body = (
        <Grid rows={{ d: '1fr 0.6fr', t: '1fr 0.62fr', m: '1.15fr 0.5fr 0.42fr' }}>
          <Panel title={`SHOT · SEQUENCE ${pad2(s.order)}`} meta={`${filled} / ${d.frames.length} FRAMES`} at={{ d: [7, 2], t: [7, 2], m: [6, 1] }} testId="storyboard-sequence-frames" layout="media">
            {boardStage(frame, setFrame)}
          </Panel>
          <Panel title={`SEQUENCE ${pad2(s.order)} · ${s.label}`} meta={s.durationRange ?? 'DURATION NOT SET'} at={{ d: [5, 1], t: [5, 1], m: [3, 1] }} testId="storyboard-sequence-detail" className="exf-record">
            <p className="exf-text">{s.purpose}</p>
            <div className="exf-tags">
              <Chip tone={s.tensionStage === 'PEAK' ? 'red' : 'gray'}>{s.tensionStage ?? '—'}</Chip>
              {beat ? <Chip>{words(beat.shotFunction)}</Chip> : null}
            </div>
            <Btn to={go('storyboard', 'sequence-detail', d.scenes[(idx + 1) % d.scenes.length]!.sceneId)} variant="ghost" testId="storyboard-next-sequence">
              NEXT SEQUENCE
            </Btn>
          </Panel>
          <Panel title="SHOT NOTES" meta="BEAT" at={{ d: [3, 1], t: [5, 1], m: [3, 1] }} testId="storyboard-shot-notes">
            {beat ?
              <Kv rows={[['ROLE', beat.beatRole], ['AUDIENCE KNOWS', beat.whatAudienceKnows], ['CHANGES', beat.whatChangesInThisBeat], ['NEXT', beat.whyNextBeatIsNecessary]]} />
            : <Empty title="NO BEAT RECORD" />}
          </Panel>
          <Panel title="SEQUENCE NAVIGATION" meta={`${d.scenes.length} SCENES`} at={{ d: [2, 1], t: [0, 0], m: [6, 1] }} hide="t" testId="storyboard-sequence-nav" layout="compact">
            {sequences}
          </Panel>
        </Grid>
      );
      break;
    }
    case 'keyframes': {
      const n = d.frames.length;
      const keys = n ? [...new Set([0, Math.floor((n - 1) / 2), n - 1])] : [];
      const KEY = ['START', 'MID', 'END'];
      body = (
        <Grid rows={{ d: '1fr 0.55fr', t: '1fr 0.58fr', m: '0.62fr 1fr 0.42fr' }}>
          <Panel title="KEYFRAME SEQUENCE" meta={`${keys.length} OF ${n} SOURCE FRAMES`} at={{ d: [5, 1], t: [5, 1], m: [6, 1] }} testId="storyboard-keyframes" className="exc-pane">
            {keys.length ?
              <MediaGrid cols={{ d: keys.length, t: keys.length, m: keys.length }} testId="storyboard-keyframe-frames">
                {keys.map((k, i) => {
                  const u = url(k);
                  return (
                    <MediaCard
                      key={k}
                      media={u ? { url: u, label: `F${pad2(d.frames[k]!.number)}`, source: 'STORYBOARD PIPELINE · ENTRY 002' } : null}
                      num={pad2(i + 1)}
                      kicker={KEY[i] ?? ''}
                      title={
                        <button type="button" className="exs-pick" onClick={() => setFrame(k)} aria-pressed={frame === k}>
                          F{pad2(d.frames[k]!.number)}
                        </button>
                      }
                      active={frame === k}
                      focus="50% 50%"
                      onInspect={u ? () => insp.open(frameItems, frameItems.findIndex((m) => m.url === u), 'KEYFRAMES') : undefined}
                      emptyLabel="SLOT EMPTY"
                    />
                  );
                })}
              </MediaGrid>
            : <Empty title="NO STORYBOARD FRAMES" body="KEYFRAMES ARE CUT FROM THE STORYBOARD PANELS." />}
          </Panel>
          <Panel title="KEYFRAME" meta={d.frames[frame] ? `F${pad2(d.frames[frame]!.number)}` : undefined} at={{ d: [7, 2], t: [7, 2], m: [6, 1] }} testId="storyboard-keyframe-stage" layout="media">
            {boardStage(frame, setFrame)}
          </Panel>
          <Panel title="KEYFRAME AUTHORITY" meta="HUB NODE" at={{ d: [5, 1], t: [5, 1], m: [6, 1] }} testId="storyboard-keyframe-node" layout="compact">
            <Kv rows={[['STATUS', <Chip tone={nodeTone(kfNode?.status)}>{words(kfNode?.status ?? 'NOT_STARTED')}</Chip>], ['WHY', kfNode?.statusDetail ?? '—']]} />
            <Actions note="KEYFRAMES ARE APPROVED IN THE EXPRESSION ENGINE ONCE THE STORYBOARD AUTHORITY IS COMPLETE." testId="storyboard-keyframe-approval">
              <Btn variant="red" disabled reason={`Keyframes node is ${words(kfNode?.status ?? 'NOT_STARTED')}`} testId="storyboard-keyframes-approve">
                APPROVE KEYFRAMES
              </Btn>
              {engine}
            </Actions>
          </Panel>
        </Grid>
      );
      break;
    }
    default: {
      const f = d.frames[frame];
      body = (
        <Grid rows={{ d: '1fr 0.5fr', t: '1fr 0.56fr', m: '1.3fr 0.42fr 0.46fr' }}>
          <Panel title="BOARD INSPECTOR" meta={f ? `F${pad2(f.number)} OF ${d.frames.length} · ${url(frame) ? 'RENDERED' : 'SLOT EMPTY'}` : undefined} at={{ d: [6, 2], t: [7, 2], m: [6, 1] }} testId="storyboard-inspector" layout="media">
            {boardStage(frame, setFrame)}
          </Panel>
          <Panel title="STORYBOARD BOARDS" meta={`${d.frames.length} FRAMES`} to={go('storyboard', 'keyframes')} toLabel="KEYFRAMES" at={{ d: [6, 1], t: [5, 1], m: [0, 0] }} hide="m" testId="storyboard-root-boards" className="exc-pane">
            {boards(frame, setFrame, { d: 4, t: 3, m: 4 }, 'storyboard-root-boards-grid')}
          </Panel>
          <Panel title="SEQUENCE NAVIGATION" meta={`${d.scenes.length} SCENES`} at={{ d: [3, 1], t: [0, 0], m: [6, 1] }} hide="t" testId="storyboard-sequences" layout="compact">
            {sequences}
          </Panel>
          <Panel title="PROGRESS · APPROVAL" meta={d.graph?.founderGate.open ? 'GATE OPEN' : 'NO GATE'} at={{ d: [3, 1], t: [5, 1], m: [6, 1] }} testId="storyboard-root-progress" layout="compact">
            {progress}
            <StoryboardDecision d={d} />
            {engine}
          </Panel>
        </Grid>
      );
    }
  }
  return (
    <>
      {body}
      {insp.overlay}
    </>
  );
}
