/**
 * 06 STORYBOARD — root · sequence-detail · keyframes.
 * Source: hub storyboard frames (canonical pipeline panels), Entry 002 scenes (reel beat sequence), hub graph
 * storyboard / keyframes node status and the founder gate. The approve / revise decision is the existing hub
 * action (decideStoryboard) and is enabled only when the gate is open on the storyboard node and decidable.
 */
import { useState } from 'react';
import { frameSlotId } from '../../../../../../shared/site00-production-hub/index.js';
import { pad2 } from '../../primitives';
import { words } from '../expressionData';
import { Actions, Btn, Chip, Empty, Grid, Img, Kv, Meter, Panel, Row, type Tone } from '../ExpressionFamilyShell';
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
  const boards = (sel: number, onSel: (i: number) => void, testId = 'storyboard-boards') =>
    d.frames.length ?
      <div className="exf-frames" data-testid={testId}>
        {d.frames.map((f, i) => (
          <button key={f.frameId} type="button" className={`exf-frame${sel === i ? ' is-active' : ''}`} onClick={() => onSel(i)} aria-pressed={sel === i} data-testid="storyboard-frame">
            <Img url={url(i)} slotId={frameSlotId(f)} label={`F${pad2(f.number)}`} />
            <small>F{pad2(f.number)}</small>
          </button>
        ))}
      </div>
    : <Empty title="NO STORYBOARD FRAMES" body="FRAMES APPEAR WHEN THE STORYBOARD PIPELINE PRODUCES PANELS." />;
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

  switch (r.route.id) {
    case 'sequence-detail': {
      const s = d.scenes.find((x) => x.sceneId === r.param);
      if (!s) return <Empty title="SEQUENCE NOT FOUND" body="NO SCENE WITH THIS ID IN ENTRY 002." testId="storyboard-sequence-missing" />;
      const beat = d.plan.beats.find((b) => b.beatId === s.sceneId);
      const idx = d.scenes.indexOf(s);
      return (
        <Grid rows={{ d: '1fr 0.8fr', t: '0.95fr 0.8fr 0.75fr', m: '0.85fr 0.85fr 0.8fr 0.6fr' }}>
          <Panel title={`SEQUENCE ${pad2(s.order)} · ${s.label}`} meta={s.durationRange ?? 'DURATION NOT SET'} at={{ d: [5, 1], t: [12, 1], m: [6, 1] }} testId="storyboard-sequence-detail" className="exf-record">
            <p className="exf-text">{s.purpose}</p>
            <div className="exf-tags">
              <Chip tone={s.tensionStage === 'PEAK' ? 'red' : 'gray'}>{s.tensionStage ?? '—'}</Chip>
              {beat ? <Chip>{words(beat.shotFunction)}</Chip> : null}
            </div>
          </Panel>
          <Panel title="SHOT NOTES" meta="BEAT" at={{ d: [4, 1], t: [6, 1], m: [3, 1] }} testId="storyboard-shot-notes">
            {beat ?
              <Kv rows={[['ROLE', beat.beatRole], ['AUDIENCE KNOWS', beat.whatAudienceKnows], ['CHANGES', beat.whatChangesInThisBeat], ['NEXT', beat.whyNextBeatIsNecessary]]} />
            : <Empty title="NO BEAT RECORD" />}
          </Panel>
          <Panel title="SEQUENCE NAVIGATION" meta={`${d.scenes.length} SCENES`} at={{ d: [3, 2], t: [6, 1], m: [3, 1] }} testId="storyboard-sequence-nav">
            {sequences}
          </Panel>
          <Panel title="STORYBOARD FRAMES" meta={`${d.frames.length} PANELS · ENTRY`} at={{ d: [9, 1], t: [12, 1], m: [6, 1] }} testId="storyboard-sequence-frames">
            {boards(frame, setFrame)}
          </Panel>
          <Panel title="APPROVAL" at={{ d: [0, 0], t: [0, 0], m: [6, 1] }} hide="d t" testId="storyboard-sequence-approval">
            <Btn to={go('storyboard', 'sequence-detail', d.scenes[(idx + 1) % d.scenes.length]!.sceneId)} variant="ghost" testId="storyboard-next-sequence">
              NEXT SEQUENCE
            </Btn>
          </Panel>
        </Grid>
      );
    }
    case 'keyframes':
      return (
        <Grid rows={{ d: '1fr 0.62fr', t: '1fr 0.7fr', m: '1fr 0.75fr 0.7fr' }}>
          <Panel title="KEYFRAME SEQUENCE" meta={`${d.frames.length} SOURCE FRAMES`} at={{ d: [8, 1], t: [12, 1], m: [6, 1] }} testId="storyboard-keyframes">
            {boards(frame, setFrame, 'storyboard-keyframe-frames')}
          </Panel>
          <Panel title="KEYFRAME AUTHORITY" meta="HUB NODE" at={{ d: [4, 2], t: [6, 1], m: [6, 1] }} testId="storyboard-keyframe-node">
            <Img url={d.nodeArt('keyframes')} label="KEYFRAME PLATE" className="exf-fill" />
            <Kv rows={[['STATUS', <Chip tone={nodeTone(kfNode?.status)}>{words(kfNode?.status ?? 'NOT_STARTED')}</Chip>], ['WHY', kfNode?.statusDetail ?? '—']]} />
          </Panel>
          <Panel title="APPROVE KEYFRAMES" at={{ d: [8, 1], t: [6, 1], m: [6, 1] }} testId="storyboard-keyframe-approval">
            <Actions note="KEYFRAMES ARE APPROVED IN THE EXPRESSION ENGINE ONCE THE STORYBOARD AUTHORITY IS COMPLETE.">
              <Btn variant="red" disabled reason={`Keyframes node is ${words(kfNode?.status ?? 'NOT_STARTED')}`} testId="storyboard-keyframes-approve">
                APPROVE KEYFRAMES
              </Btn>
              {engine}
            </Actions>
          </Panel>
        </Grid>
      );
    default: {
      const f = d.frames[frame];
      return (
        <Grid rows={{ d: '1fr 0.75fr', t: '1fr 0.8fr 0.7fr', m: '0.9fr 0.8fr 0.75fr 0.7fr' }}>
          <Panel title="SEQUENCE NAVIGATION" meta={`${d.scenes.length} SCENES`} at={{ d: [3, 2], t: [4, 2], m: [3, 1] }} testId="storyboard-sequences">
            {sequences}
          </Panel>
          <Panel title="STORYBOARD BOARDS" meta={`${d.frames.length} FRAMES`} to={go('storyboard', 'keyframes')} toLabel="KEYFRAMES" at={{ d: [6, 1], t: [8, 1], m: [6, 1] }} testId="storyboard-root-boards">
            {boards(frame, setFrame)}
          </Panel>
          <Panel title="BOARD INSPECTOR" meta={f ? `F${pad2(f.number)}` : undefined} at={{ d: [3, 2], t: [4, 1], m: [3, 1] }} testId="storyboard-inspector">
            {f ?
              <>
                <Img url={url(frame)} slotId={frameSlotId(f)} label={`F${pad2(f.number)}`} className="exf-fill" />
                <Kv rows={[['FRAME', `F${pad2(f.number)} OF ${d.frames.length}`], ['STATE', url(frame) ? 'RENDERED' : 'SLOT EMPTY']]} />
              </>
            : <Empty title="NO FRAME SELECTED" />}
          </Panel>
          <Panel title="STORYBOARD PROGRESS" at={{ d: [3, 1], t: [4, 1], m: [6, 1] }} testId="storyboard-root-progress">
            {progress}
          </Panel>
          <Panel title="FOUNDER APPROVAL" meta={d.graph?.founderGate.open ? 'GATE OPEN' : 'NO GATE'} at={{ d: [3, 1], t: [12, 1], m: [6, 1] }} testId="storyboard-root-approval">
            <StoryboardDecision d={d} />
            {engine}
          </Panel>
        </Grid>
      );
    }
  }
}
