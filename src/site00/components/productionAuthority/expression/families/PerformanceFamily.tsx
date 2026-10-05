/**
 * 04 CAST + PERFORMANCE — root · scenes · beats · takes.
 * Source: cast characters (performance direction, beats, shots), catalogue actor ranges, Entry 002 scenes (reel beat
 * sequence) and recorded shot cast placements. The previous Performance screen's character picker and its
 * BEHAVIOR / MOVEMENT / VOICE / EMOTION views are kept. No rendered takes exist yet → honest UNMOUNTED state.
 */
import { useState, type ReactNode } from 'react';
import { pad2 } from '../../primitives';
import { words } from '../expressionData';
import { Actions, Btn, Chip, Empty, Grid, Kv, MediaImg, Mono, Panel, Row } from '../ExpressionFamilyShell';
import type { FamilyProps } from './types';

const ENGINE_ROUTE = (slug: string) => `/projects/${slug}/content-operations/expression-engine`;
type Lens = 'behavior' | 'movement' | 'voice' | 'emotion';
const LENSES: Lens[] = ['behavior', 'movement', 'voice', 'emotion'];

function usePlayer(d: FamilyProps['d']) {
  const players = d.cast.characters.filter((c) => c.screenImportance !== 'ENSEMBLE');
  const [charId, setCharId] = useState(players[0]?.characterId ?? '');
  const character = players.find((c) => c.characterId === charId) ?? players[0] ?? null;
  const actor = character ? d.actor(character.actorId) : null;
  const select = character ? (
    <select className="exf-select" value={character.characterId} onChange={(e) => setCharId(e.target.value)} aria-label="Character" data-testid="performance-character-select">
      {players.map((c) => {
        const a = d.actor(c.actorId);
        return (
          <option key={c.characterId} value={c.characterId}>
            {c.characterName}
            {a ? ` (${a.catalogueNumber})` : ''}
          </option>
        );
      })}
    </select>
  ) : null;
  return { players, character, actor, select };
}

export function PerformanceFamily({ d, r, go }: FamilyProps) {
  const { players, character, actor, select } = usePlayer(d);
  const [lens, setLens] = useState<Lens>('behavior');
  const [scene, setScene] = useState(0);
  if (!d.ok) return <Empty title="NO CAMPAIGN ENTRY IN PRODUCTION" testId="expression-no-entry" />;
  const item = d.itemFor('performance');
  const art = d.nodeArt('performance');
  const rows: Record<Lens, (readonly [string, ReactNode])[]> = {
    behavior: [
      ['PERSONALITY', character?.personality],
      ['BEHAVIOR SKIN', actor?.personalityRange.slice(0, 3).join(', ') || 'NOT ASSIGNED'],
      ['DIRECTION', character?.performanceDirection],
      ['MOTIVATION', character?.motivation],
    ],
    movement: [
      ['MOVEMENT SKIN', actor?.performanceProfile.slice(0, 3).map(words).join(', ') || 'NOT ASSIGNED'],
      ['SCREEN PRESENCE', actor?.cinematicPresence.slice(0, 3).join(', ') || '—'],
      ['ANIMATION SKIN', 'NOT ASSIGNED'],
    ],
    voice: [
      ['VOICE PROFILE', actor ? actor.languages.join(', ') : 'NOT ASSIGNED'],
      ['ACCENTS', actor?.accentCapabilities.join(', ') || '—'],
      ['TONE', character?.performanceDirection],
    ],
    emotion: [
      ['EMOTIONAL RANGE', actor?.emotionalRange.slice(0, 4).join(', ') || 'NOT ASSIGNED'],
      ['DRAMATIC FIT', actor?.dramaticFit.slice(0, 2).join(', ') || '—'],
      ['CONTINUITY RISK', actor?.continuityRisk ?? '—'],
    ],
  };
  const brief = (
    <>
      <div className="exf-picker">{select}</div>
      <div className="exf-seg" role="tablist" aria-label="Performance lens" data-testid="performance-lens">
        {LENSES.map((l) => (
          <button key={l} type="button" role="tab" aria-selected={lens === l} className={lens === l ? 'is-active' : ''} onClick={() => setLens(l)}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      {character ? <Kv rows={rows[lens]} testId="performance-brief" /> : <Empty title="NO PERFORMER" />}
    </>
  );
  const performers = players.map((c) => {
    const a = d.actor(c.actorId);
    return (
      <Row
        key={c.characterId}
        to={go('casting', 'character-profile', c.characterId)}
        testId="performance-performer-row"
        media={<Mono text={c.characterName} className="exf-face exf-face--char" />}
        title={c.characterName}
        sub={`${a ? a.stageName : 'NO ACTOR'} · ${c.performanceDirection}`}
        aside={<Chip tone={c.performanceDirection.trim() ? 'green' : 'amber'}>{c.performanceDirection.trim() ? 'DIRECTED' : 'NO DIRECTION'}</Chip>}
      />
    );
  });
  const sceneList = d.scenes.map((s, i) => (
    <Row
      key={s.sceneId}
      testId="performance-scene-row"
      onClick={() => setScene(i)}
      active={scene === i}
      media={<em className="exf-num">{pad2(s.order)}</em>}
      title={s.label}
      sub={s.purpose}
      aside={s.tensionStage ? <Chip tone={s.tensionStage === 'PEAK' ? 'red' : 'gray'}>{s.tensionStage}</Chip> : undefined}
    />
  ));
  const gate = (
    <Actions note={`PERFORMANCE · ${item.detail}`}>
      <Chip tone={item.status === 'LOCKED' || item.status === 'APPROVED' ? 'green' : 'amber'}>{words(item.status)}</Chip>
      <Btn variant="ghost" to={ENGINE_ROUTE(d.slug)} testId="performance-open-engine">
        OPEN IN EXPRESSION ENGINE
      </Btn>
    </Actions>
  );

  switch (r.route.id) {
    case 'scenes': {
      const s = d.scenes[scene];
      return (
        <Grid rows={{ d: '1fr 0.7fr', t: '1fr 0.75fr', m: '1.1fr 0.85fr 0.6fr' }}>
          <Panel title="SCENE LINEUP" meta={`${d.scenes.length} SCENES`} at={{ d: [4, 2], t: [5, 2], m: [6, 1] }} testId="performance-scenes">
            {sceneList}
          </Panel>
          <Panel title={s ? `SCENE ${pad2(s.order)} · ${s.label}` : 'SCENE'} meta={s?.durationRange ?? 'DURATION NOT SET'} at={{ d: [8, 1], t: [7, 1], m: [6, 1] }} testId="performance-scene-detail">
            {s ?
              <Kv
                rows={[
                  ['PURPOSE', s.purpose],
                  ['TENSION', s.tensionStage ?? '—'],
                  ['DURATION', s.durationRange ?? '—'],
                  ['BEAT ROLE', d.plan.beats.find((b) => b.beatId === s.sceneId)?.beatRole ?? '—'],
                  ['SHOT FUNCTION', words(d.plan.beats.find((b) => b.beatId === s.sceneId)?.shotFunction)],
                ]}
              />
            : <Empty title="NO SCENES" />}
          </Panel>
          <Panel title="SCENE CAST" meta="SHOT PLACEMENTS" at={{ d: [8, 1], t: [7, 1], m: [6, 1] }} testId="performance-scene-cast">
            {d.shotCast.length ?
              d.shotCast.map((x) => <Row key={`${x.shotId}-${x.characterId}`} title={`${d.character(x.characterId)?.characterName ?? x.characterId} · ${x.position}`} sub={`${x.shotId} · ${x.action}`} aside={<Chip>{x.expression}</Chip>} />)
            : <Empty title="NO SHOT CAST RECORDED" />}
          </Panel>
        </Grid>
      );
    }
    case 'beats':
      return (
        <Grid rows={{ d: '1fr 0.75fr', t: '1fr 0.8fr', m: '0.95fr 1fr 0.7fr' }}>
          <Panel title="PERFORMANCE BEATS" meta={character ? `${character.appearsInBeats.length} BEATS` : undefined} at={{ d: [5, 2], t: [6, 2], m: [6, 1] }} testId="performance-beats">
            <div className="exf-picker">{select}</div>
            {character?.appearsInBeats.length ?
              <ol className="exf-steps">
                {character.appearsInBeats.map((b, i) => (
                  <li key={`${b}-${i}`} data-edge={b === character.firstBeat ? 'first' : b === character.lastBeat ? 'last' : undefined}>
                    <em>{pad2(i + 1)}</em>
                    <b>{words(b)}</b>
                  </li>
                ))}
              </ol>
            : <Empty title="NO BEATS ASSIGNED" />}
          </Panel>
          <Panel title="PERFORMANCE BRIEF" meta={character?.characterName} at={{ d: [7, 1], t: [6, 1], m: [6, 1] }} testId="performance-beats-brief">
            {brief}
          </Panel>
          <Panel title="NARRATIVE BEATS" meta={`${d.plan.beats.length} IN PLAN`} to={go('narrative', 'structure')} toLabel="STRUCTURE" at={{ d: [7, 1], t: [6, 1], m: [6, 1] }} testId="performance-narrative-beats">
            <ol className="exf-arc">
              {d.plan.beats.map((b) => (
                <li key={b.beatId} data-stage={b.tensionStage}>
                  <b>{b.label}</b>
                  <small>{words(b.shotFunction)}</small>
                </li>
              ))}
            </ol>
          </Panel>
        </Grid>
      );
    case 'takes':
      return (
        <Grid rows={{ d: '1fr 0.75fr', t: '1fr 0.8fr', m: '0.9fr 0.95fr 0.7fr' }}>
          <Panel title="TAKES" meta="RENDERED PERFORMANCE" at={{ d: [7, 1], t: [12, 1], m: [6, 1] }} testId="performance-takes">
            <Empty title="NO TAKES RENDERED" body="PERFORMANCE TAKES APPEAR WHEN THE KEYFRAME / MOTION STAGE PRODUCES THEM." state="UNMOUNTED" testId="performance-takes-unmounted" />
          </Panel>
          <Panel title="BLOCKING" meta={`${d.shotCast.length} PLACEMENTS`} at={{ d: [5, 2], t: [6, 1], m: [6, 1] }} testId="performance-blocking">
            {d.shotCast.length ?
              d.shotCast.map((x) => (
                <div key={`${x.shotId}-${x.characterId}`} className="exf-take" data-testid="performance-take">
                  <b>{x.shotId.replace(/^shot-entry\d+-/, '').toUpperCase()}</b>
                  <Kv
                    rows={[
                      ['CHARACTER', d.character(x.characterId)?.characterName ?? x.characterId],
                      ['ACTION', x.action],
                      ['EXPRESSION', x.expression],
                      ['POSITION', x.position],
                      ['LOOK', d.look(x.lookId)?.label ?? x.lookId],
                      ['PRIORITY', x.screenPriority],
                    ]}
                  />
                </div>
              ))
            : <Empty title="NO BLOCKING RECORDED" />}
          </Panel>
          <Panel title="DIRECTOR NOTES" meta="PERFORMANCE DIRECTION" at={{ d: [7, 1], t: [6, 1], m: [6, 1] }} testId="performance-direction">
            {performers}
          </Panel>
        </Grid>
      );
    default:
      return (
        <Grid rows={{ d: '1.05fr 0.65fr', t: '1fr 0.75fr', m: '1.25fr 0.42fr' }}>
          <Panel title="PERFORMANCE AUTHORITY" meta="HUB NODE" at={{ d: [5, 2], t: [6, 2], m: [6, 1] }} testId="performance-art" layout="media">
            <MediaImg url={art} label="PERFORMANCE STILL" title="PERFORMANCE AUTHORITY" testId="performance-authority-media" />
            {gate}
          </Panel>
          <Panel title="PERFORMANCE BRIEF" meta={character?.characterName} at={{ d: [4, 2], t: [6, 1], m: [6, 1] }} testId="performance-root-brief" layout="compact">
            {brief}
          </Panel>
          <Panel title="CURRENT PERFORMERS" meta={`${players.length} CHARACTERS`} to={go('casting', 'characters')} toLabel="CHARACTERS" at={{ d: [3, 1], t: [6, 1], m: [6, 1] }} testId="performance-performers" layout="compact">
            {performers}
          </Panel>
          <Panel title="SCENE LINEUP" meta={`${d.scenes.length} SCENES`} to={go('performance', 'scenes')} toLabel="SCENES" at={{ d: [3, 1], t: [6, 1], m: [6, 1] }} testId="performance-root-scenes" layout="compact">
            {sceneList}
          </Panel>
        </Grid>
      );
  }
}
