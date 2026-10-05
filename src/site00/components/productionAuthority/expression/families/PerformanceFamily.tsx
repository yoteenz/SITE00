/**
 * 04 CAST + PERFORMANCE — root · scenes · beats · takes.
 * Source: cast characters (performance direction, beats, shots), catalogue actor ranges, Entry 002 scenes (reel beat
 * sequence) and recorded shot cast placements. The previous Performance screen's character picker and its
 * BEHAVIOR / MOVEMENT / VOICE / EMOTION views are kept. No rendered takes exist yet → honest UNMOUNTED state.
 */
import { useState, type ReactNode } from 'react';
import { pad2 } from '../../primitives';
import { words } from '../expressionData';
import { characterMedia, first } from '../expressionMedia';
import { Btn, Chip, Empty, Grid, Img, Kv, Panel, Row } from '../ExpressionFamilyShell';
import { MediaCard, MediaGrid, RecordHero, useMediaInspector } from '../ExpressionMediaKit';
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
  const insp = useMediaInspector();
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
  /** Performers lead with their character media (the authority's CURRENT PERFORMERS portrait row). */
  const performers = (
    <MediaGrid cols={{ d: Math.max(2, players.length), t: Math.max(2, players.length), m: Math.max(2, players.length) }} testId="performance-performers-grid">
      {players.map((c) => {
        const a = d.actor(c.actorId);
        const m = characterMedia(d, c);
        return (
          <MediaCard
            key={c.characterId}
            media={first(m)}
            kicker={a ? `${a.stageName.toUpperCase()} · ${a.catalogueNumber}` : 'NO ACTOR'}
            title={c.characterName}
            to={go('casting', 'character-profile', c.characterId)}
            sub={c.performanceDirection}
            active={c.characterId === character?.characterId}
            chips={<Chip tone={c.performanceDirection.trim() ? 'green' : 'amber'}>{c.performanceDirection.trim() ? 'DIRECTED' : 'NO DIRECTION'}</Chip>}
            onInspect={m.length ? () => insp.open(m, 0, c.characterName) : undefined}
            emptyLabel="NO CANONICAL IMAGE"
            testId="performance-performer-row"
          />
        );
      })}
    </MediaGrid>
  );
  const heroMedia = characterMedia(d, character);
  const performerHero = (
    <RecordHero
      media={first(heroMedia)}
      kicker={`PERFORMER · ${actor ? `${actor.stageName.toUpperCase()} · ${actor.catalogueNumber}` : 'NO ACTOR'}`}
      title={character?.characterName ?? 'NO PERFORMER'}
      sub={character?.performanceDirection}
      facts={brief}
      actions={
        <>
          <Chip tone={item.status === 'LOCKED' || item.status === 'APPROVED' ? 'green' : 'amber'}>{words(item.status)}</Chip>
          <Btn variant="ghost" to={ENGINE_ROUTE(d.slug)} testId="performance-open-engine">
            OPEN IN EXPRESSION ENGINE
          </Btn>
        </>
      }
      onInspect={heroMedia.length ? () => insp.open(heroMedia, 0, character?.characterName ?? 'PERFORMER') : undefined}
      testId="performance-performer-hero"
    />
  );
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

  const sceneCast = (s: (typeof d.scenes)[number] | undefined) => {
    const ids = [...new Set(d.shotCast.map((x) => x.characterId))];
    const cast = ids.map((id) => d.character(id)).filter((c): c is NonNullable<typeof c> => !!c);
    return cast.length ? cast : s ? players : [];
  };
  let body: ReactNode;
  switch (r.route.id) {
    case 'scenes': {
      const s = d.scenes[scene];
      const cast = sceneCast(s);
      body = (
        <Grid rows={{ d: '1fr 0.62fr', t: '1fr 0.64fr', m: '0.62fr 0.8fr 0.5fr' }}>
          <Panel title="SCENE LINEUP" meta={`${d.scenes.length} SCENES`} at={{ d: [4, 2], t: [5, 2], m: [6, 1] }} testId="performance-scenes">
            {sceneList}
          </Panel>
          <Panel title="KEY CAST · PERFORMERS" meta={s ? `SCENE ${pad2(s.order)}` : undefined} at={{ d: [8, 1], t: [7, 1], m: [6, 1] }} testId="performance-scene-cast-media" className="exc-pane">
            {cast.length ?
              <MediaGrid cols={{ d: Math.max(3, cast.length), t: Math.max(2, cast.length), m: Math.max(2, cast.length) }}>
                {cast.map((c) => {
                  const m = characterMedia(d, c);
                  return <MediaCard key={c.characterId} media={first(m)} title={c.characterName} to={go('casting', 'character-profile', c.characterId)} sub={c.performanceDirection} onInspect={m.length ? () => insp.open(m, 0, c.characterName) : undefined} emptyLabel="NO CANONICAL IMAGE" />;
                })}
              </MediaGrid>
            : <Empty title="NO SCENE CAST" />}
          </Panel>
          <Panel title={s ? `SCENE ${pad2(s.order)} · ${s.label}` : 'SCENE'} meta={s?.durationRange ?? 'DURATION NOT SET'} at={{ d: [4, 1], t: [7, 1], m: [6, 1] }} testId="performance-scene-detail">
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
          <Panel title="SCENE CAST" meta="SHOT PLACEMENTS" at={{ d: [4, 1], t: [0, 0], m: [0, 0] }} hide="t m" testId="performance-scene-cast">
            {d.shotCast.length ?
              d.shotCast.map((x) => <Row key={`${x.shotId}-${x.characterId}`} title={`${d.character(x.characterId)?.characterName ?? x.characterId} · ${x.position}`} sub={`${x.shotId} · ${x.action}`} aside={<Chip>{x.expression}</Chip>} />)
            : <Empty title="NO SHOT CAST RECORDED" />}
          </Panel>
        </Grid>
      );
      break;
    }
    case 'beats':
      body = (
        <Grid rows={{ d: '1fr 0.62fr', t: '1fr 0.64fr', m: '1fr 0.58fr 0.5fr' }}>
          <Panel title="PERFORMANCE BRIEF" meta={character?.characterName} at={{ d: [7, 1], t: [7, 1], m: [6, 1] }} testId="performance-beats-brief" className="exc-pane">
            {performerHero}
          </Panel>
          <Panel title="PERFORMANCE BEATS" meta={character ? `${character.appearsInBeats.length} BEATS` : undefined} at={{ d: [5, 2], t: [5, 2], m: [6, 1] }} testId="performance-beats">
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
          <Panel title="NARRATIVE BEATS" meta={`${d.plan.beats.length} IN PLAN`} to={go('narrative', 'structure')} toLabel="STRUCTURE" at={{ d: [7, 1], t: [7, 1], m: [6, 1] }} testId="performance-narrative-beats">
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
      break;
    case 'takes':
      // No takes exist yet: the honest empty state stays compact and the performers' media leads the route
      // (an empty TAKES pane had taken 60% of the frame and squeezed the portraits into strips).
      body = (
        <Grid rows={{ d: '1fr 0.42fr', t: '1fr 0.42fr', m: '1fr 0.62fr 0.36fr' }}>
          <Panel title="DIRECTOR NOTES · PERFORMERS" meta="PERFORMANCE DIRECTION" at={{ d: [7, 1], t: [7, 1], m: [6, 1] }} testId="performance-direction" className="exc-pane">
            {performers}
          </Panel>
          <Panel title="BLOCKING" meta={`${d.shotCast.length} PLACEMENTS`} at={{ d: [5, 2], t: [5, 1], m: [6, 1] }} testId="performance-blocking">
            {d.shotCast.length ?
              d.shotCast.map((x) => {
                const c = d.character(x.characterId);
                const m = first(characterMedia(d, c));
                return (
                  <div key={`${x.shotId}-${x.characterId}`} className="exf-take" data-testid="performance-take">
                    <header className="exp-take__head">
                      {m ? <Img url={m.url} label={c?.characterName ?? x.characterId} className="exf-face exf-face--portrait" /> : null}
                      <b>{x.shotId.replace(/^shot-entry\d+-/, '').toUpperCase()}</b>
                    </header>
                    <Kv
                      rows={[
                        ['CHARACTER', c?.characterName ?? x.characterId],
                        ['ACTION', x.action],
                        ['EXPRESSION', x.expression],
                        ['POSITION', x.position],
                        ['LOOK', d.look(x.lookId)?.label ?? x.lookId],
                        ['PRIORITY', x.screenPriority],
                      ]}
                    />
                  </div>
                );
              })
            : <Empty title="NO BLOCKING RECORDED" />}
          </Panel>
          <Panel title="TAKES" meta="RENDERED PERFORMANCE" at={{ d: [7, 1], t: [12, 1], m: [6, 1] }} testId="performance-takes" layout="compact">
            <Empty title="NO TAKES RENDERED" body="PERFORMANCE TAKES APPEAR WHEN THE KEYFRAME / MOTION STAGE PRODUCES THEM." state="UNMOUNTED" testId="performance-takes-unmounted" />
          </Panel>
        </Grid>
      );
      break;
    default:
      body = (
        <Grid rows={{ d: '1fr 0.62fr', t: '1fr 0.64fr', m: '1.05fr 0.9fr 0.4fr' }}>
          <Panel title="CURRENT PERFORMERS" meta={`${players.length} CHARACTERS`} to={go('casting', 'characters')} toLabel="CHARACTERS" at={{ d: [5, 1], t: [5, 1], m: [6, 1] }} testId="performance-performers" className="exc-pane">
            {performers}
          </Panel>
          <Panel title="ACTIVE PERFORMANCE BRIEF" meta={character?.characterName} at={{ d: [7, 2], t: [7, 2], m: [6, 1] }} testId="performance-root-brief" className="exc-pane">
            {performerHero}
          </Panel>
          <Panel title="SCENE LINEUP" meta={`${d.scenes.length} SCENES`} to={go('performance', 'scenes')} toLabel="SCENES" at={{ d: [5, 1], t: [5, 1], m: [6, 1] }} testId="performance-root-scenes" layout="compact">
            <Row media={<Img url={art} label="PERFORMANCE NODE" className="exf-face" />} title="PERFORMANCE AUTHORITY · HUB NODE" sub={`${words(item.status)} · ${item.detail}`} testId="performance-authority-media" />
            {sceneList}
          </Panel>
        </Grid>
      );
  }
  return (
    <>
      {body}
      {insp.overlay}
    </>
  );
}
