/**
 * 02 CASTING — root · roles · actors · characters · continuity · role-detail · actor-profile · character-profile.
 *
 * ROLE = CastingRequirement (what the story needs) · ACTOR = StudioWorldActor (catalogue talent) ·
 * CHARACTER = ProductionCharacter (story identity played by an actor in a role). Each has its own list, its own
 * detail route and its own record type; they are linked by ids only and never shown as one merged object.
 *
 * Media first (STUDIOOS_EXPRESSION_AUTHORITY_LITE_v2 / 02_Casting): every list is a card grid led by the record's
 * canonical image (expressionMedia.ts) and every detail opens on a portrait hero; metadata sits under / beside it.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  castingCreativeSearch,
  getProductionStudioWorldActorCatalogue,
  type StudioWorldActor,
} from '../../../../../../shared/site00-studio-world/acting-catalogue/index.js';
import { pad2 } from '../../primitives';
import { upper, words } from '../expressionData';
import { actorMedia, characterMedia, first, roleMedia, type MediaItem } from '../expressionMedia';
import { Actions, Btn, Chip, Donut, Empty, Grid, Kv, Panel, Row, Stat, type Tone } from '../ExpressionFamilyShell';
import { FaceRail, Gallery, MediaCard, MediaGrid, RecordHero, useMediaInspector } from '../ExpressionMediaKit';
import type { FamilyProps } from './types';

const IMPORTANCE: Record<string, string> = { HERO: 'LEAD', SUPPORTING: 'SUPPORTING', ENSEMBLE: 'ENSEMBLE', BACKGROUND: 'BACKGROUND' };
const availTone = (s: string): Tone => (s === 'AVAILABLE' ? 'green' : s === 'IN_CURRENT_PRODUCTION' ? 'red' : 'amber');

export function CastingFamily({ d, r, go }: FamilyProps) {
  const insp = useMediaInspector();
  if (!d.ok) return <Empty title="NO CAMPAIGN ENTRY IN PRODUCTION" body={`${d.slug.toUpperCase()} HAS NO CASTING YET.`} testId="expression-no-entry" />;
  const roles = d.cast.requirements;
  const castRoles = roles.filter((q) => d.charactersForRole(q.requirementId).some((c) => !!c.actorId));
  const unresolved = roles.length - castRoles.length;
  const inCast = new Set(d.cast.characters.map((c) => c.actorId).filter(Boolean));
  const available = d.actors.filter((a) => a.availabilityState === 'AVAILABLE');

  /** Role card: the filling character's image, or an OPEN slot that sends you to the catalogue. */
  const roleCard = (q: (typeof roles)[number], i: number, opts: { dir?: 'v' | 'h'; lead?: boolean } = {}) => {
    const chars = d.charactersForRole(q.requirementId);
    const c = chars[0] ?? null;
    const actor = d.actor(c?.actorId);
    const cast = chars.some((x) => !!x.actorId);
    const media = roleMedia(d, q.requirementId);
    return (
      <MediaCard
        key={q.requirementId}
        dir={opts.dir}
        media={first(media)}
        num={pad2(i + 1)}
        kicker={IMPORTANCE[q.screenImportance] ?? q.screenImportance}
        title={q.narrativeRole}
        to={go('casting', 'role-detail', q.requirementId)}
        sub={actor ? `${actor.stageName.toUpperCase()} · ${actor.catalogueNumber}` : c ? c.characterName : 'NO PERFORMER YET'}
        chips={<Chip tone={cast ? 'green' : 'amber'}>{cast ? 'CAST' : 'OPEN'}</Chip>}
        onInspect={media.length ? () => insp.open(media, 0, q.narrativeRole) : undefined}
        emptyLabel="OPEN ROLE"
        emptyAction={
          <Link to={go('casting', 'actors')} className="exc-find" data-testid="casting-find-talent">
            <span aria-hidden>+</span>
            <b>FIND TALENT</b>
            <small>CAST THIS ROLE</small>
          </Link>
        }
        testId={opts.lead ? 'casting-lead-authority-media' : 'casting-role-row'}
      />
    );
  };
  const actorCard = (a: StudioWorldActor, dir: 'v' | 'h' = 'h') => {
    const media = actorMedia(a);
    return (
      <MediaCard
        key={a.actorId}
        dir={dir}
        media={first(media)}
        kicker={`${a.catalogueNumber}${(a as { residentBadgeLabel?: string }).residentBadgeLabel ? ' · RESIDENT' : ''}`}
        title={a.stageName}
        to={go('casting', 'actor-profile', a.actorId)}
        sub={a.roleArchetypes.slice(0, 2).map(words).join(' · ')}
        chips={<Chip tone={availTone(a.availabilityState)}>{words(a.availabilityState)}</Chip>}
        onInspect={media.length ? () => insp.open(media, 0, a.stageName) : undefined}
        emptyLabel="NO HEADSHOT"
        testId={`actor-row-${a.catalogueNumber}`}
      />
    );
  };
  const talent = d.actors.map((a) => ({ key: a.actorId, media: first(actorMedia(a)), name: a.stageName.toUpperCase(), sub: words(a.availabilityState), to: go('casting', 'actor-profile', a.actorId) }));
  const overview = (
    <div className="exf-overview" data-testid="casting-overview">
      <Donut value={castRoles.length} max={roles.length} label="ROLES CAST" />
      <Kv
        rows={[
          ['TOTAL ROLES', pad2(roles.length)],
          ['CHARACTERS', pad2(d.cast.characters.length)],
          ['CAST ASSIGNED', pad2(inCast.size)],
          ['UNRESOLVED', <b className={unresolved ? 'exf-red' : undefined}>{pad2(unresolved)}</b>],
          ['CAST GATE', d.gate.allRequiredCharactersLocked ? 'LOCKED' : 'OPEN'],
        ]}
      />
    </div>
  );
  const body = (() => {
    switch (r.route.id) {
      case 'roles':
        return (
          <Grid rows={{ d: '1fr 0.42fr', t: '1fr 0.44fr', m: '1fr 0.36fr' }}>
            <Panel title="CASTING / ROLES" meta={`${roles.length} CASTING REQUIREMENTS`} at={{ d: [12, 1], t: [12, 1], m: [6, 1] }} testId="casting-roles" className="exc-pane">
              <MediaGrid cols={{ d: Math.max(3, roles.length), t: Math.max(3, roles.length), m: Math.min(3, Math.max(1, roles.length)) }} testId="casting-role-cards">
                {roles.map((q, i) => roleCard(q, i, { dir: 'v' }))}
              </MediaGrid>
            </Panel>
            <Panel title="ROLE POOL" meta={`${d.actors.length} STUDIO WORLD RESIDENTS`} to={go('casting', 'actors')} toLabel="CATALOGUE" at={{ d: [8, 1], t: [8, 1], m: [4, 1] }} testId="casting-role-pool" className="exc-pane">
              {/* the roles list links roles only (ROLE / ACTOR / CHARACTER stay distinct): the pool opens via CATALOGUE */}
              <FaceRail items={talent.map(({ to: _to, ...x }) => x)} label="Role pool" testId="casting-role-pool-faces" />
            </Panel>
            <Panel title="CAST GATE" meta={d.gate.allRequiredCharactersLocked ? 'LOCKED' : 'OPEN'} at={{ d: [4, 1], t: [4, 1], m: [2, 1] }} testId="casting-gate" layout="compact">
              <div className="exf-stats">
                <Stat value={pad2(roles.length)} label="ROLES" />
                <Stat value={pad2(castRoles.length)} label="CAST" tone="green" />
                <Stat value={pad2(unresolved)} label="OPEN" tone={unresolved ? 'amber' : undefined} />
              </div>
              <Kv rows={[['REQUIRED LOCKED', d.gate.allRequiredCharactersLocked ? 'YES' : 'NO'], ['MISSING AUTHORITY', d.gate.missingCharacterAuthorities.length ? d.gate.missingCharacterAuthorities.join(' · ') : 'NONE']]} />
              <Actions>
                <Btn to={go('casting', 'actors')} testId="casting-open-catalogue">
                  OPEN ACTOR CATALOGUE
                </Btn>
              </Actions>
            </Panel>
          </Grid>
        );
      case 'actors':
        return <Actors d={d} actorCard={actorCard} inCast={inCast} />;
      case 'characters':
        return (
          <Grid rows={{ d: '1fr 0.46fr', t: '1fr 0.5fr', m: '1fr 0.44fr' }}>
            <Panel title="STORY CHARACTERS" meta={`${d.cast.characters.length} STORY IDENTITIES`} at={{ d: [8, 2], t: [8, 2], m: [6, 1] }} testId="casting-characters" className="exc-pane">
              <MediaGrid cols={{ d: Math.max(3, d.cast.characters.length), t: 3, m: 3 }}>
                {d.cast.characters.map((c, i) => {
                  const a = d.actor(c.actorId);
                  const media = characterMedia(d, c);
                  return (
                    <MediaCard
                      key={c.characterId}
                      media={first(media)}
                      num={pad2(i + 1)}
                      kicker={IMPORTANCE[c.screenImportance] ?? c.screenImportance}
                      title={c.characterName}
                      to={go('casting', 'character-profile', c.characterId)}
                      sub={a ? `PLAYED BY ${a.stageName.toUpperCase()}` : 'NO ACTOR'}
                      chips={<Chip tone={c.status === 'LOCKED' ? 'green' : 'amber'}>{words(c.status)}</Chip>}
                      onInspect={media.length ? () => insp.open(media, 0, c.characterName) : undefined}
                      emptyLabel="NOT CAST"
                      testId="casting-character-row"
                    />
                  );
                })}
              </MediaGrid>
            </Panel>
            <Panel title="ROLE → ACTOR → CHARACTER" meta="LINKED BY ID · NEVER MERGED" at={{ d: [4, 2], t: [4, 2], m: [6, 1] }} testId="casting-chain">
              <ol className="exf-chain">
                {d.cast.characters.map((c) => {
                  const q = d.role(c.castingRequirementId);
                  const a = d.actor(c.actorId);
                  return (
                    <li key={c.characterId} data-testid="casting-chain-row">
                      <span data-entity="role">
                        <small>ROLE</small>
                        <b>{q?.narrativeRole ?? '—'}</b>
                      </span>
                      <span data-entity="actor">
                        <small>ACTOR</small>
                        <b>{a ? `${a.catalogueNumber} · ${a.stageName}` : 'UNASSIGNED'}</b>
                      </span>
                      <span data-entity="character">
                        <small>CHARACTER</small>
                        <b>{c.characterName}</b>
                      </span>
                    </li>
                  );
                })}
              </ol>
            </Panel>
          </Grid>
        );
      case 'continuity':
        return <Continuity d={d} go={go} open={insp.open} />;
      case 'role-detail':
        return <RoleDetail d={d} id={r.param} go={go} open={insp.open} />;
      case 'actor-profile':
        return <ActorProfile d={d} id={r.param} go={go} open={insp.open} />;
      case 'character-profile':
        return <CharacterProfile d={d} id={r.param} go={go} open={insp.open} />;
      default:
        return (
          <Grid rows={{ d: '1fr 0.62fr', t: '1fr 0.62fr', m: '1fr 0.52fr 0.4fr' }}>
            <Panel title="ROLE PREVIEWS" meta={`${roles.length} ROLES`} to={go('casting', 'roles')} at={{ d: [8, 1], t: [8, 1], m: [6, 1] }} testId="casting-role-previews" className="exc-pane">
              <MediaGrid cols={{ d: Math.max(3, roles.length), t: Math.max(3, roles.length), m: Math.max(3, roles.length) }}>
                {roles.map((q, i) => roleCard(q, i, { lead: i === 0 }))}
              </MediaGrid>
            </Panel>
            <Panel title="CASTING OVERVIEW" at={{ d: [4, 1], t: [4, 1], m: [6, 1] }} testId="casting-root-overview" layout="compact">
              {overview}
              <Actions>
                <Btn to={go('casting', 'actors')} testId="casting-open-catalogue">
                  OPEN ACTOR CATALOGUE
                </Btn>
                <Btn to={go('casting', 'roles')} variant="red" testId="casting-review">
                  REVIEW CASTING
                </Btn>
              </Actions>
            </Panel>
            <Panel title="AVAILABLE TALENT" meta={`${available.length} AVAILABLE · ${d.actors.length} IN CATALOGUE`} to={go('casting', 'actors')} toLabel="CATALOGUE" at={{ d: [12, 1], t: [12, 1], m: [6, 1] }} testId="casting-available-talent" className="exc-pane exf-rail--talent">
              <FaceRail items={talent} label="Available talent" testId="casting-talent-tile" />
            </Panel>
          </Grid>
        );
    }
  })();
  return (
    <>
      {body}
      {insp.overlay}
    </>
  );
}

function Actors({ d, actorCard, inCast }: { d: FamilyProps['d']; actorCard: (a: StudioWorldActor, dir?: 'v' | 'h') => React.ReactNode; inCast: Set<string | null> }) {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<string>('ALL');
  const catalogue = getProductionStudioWorldActorCatalogue();
  const searched = useMemo(() => (query.trim() ? castingCreativeSearch(query, catalogue) : catalogue.actors), [catalogue, query]);
  const states = ['ALL', ...new Set(d.actors.map((a) => a.availabilityState))];
  const list = state === 'ALL' ? searched : searched.filter((a) => a.availabilityState === state);
  return (
    <Grid rows={{ d: '1fr', t: '1fr', m: '1fr' }}>
      <Panel title="CASTING / ACTORS" meta={`${list.length} OF ${d.actors.length} ACTORS · ${inCast.size} IN THIS PRODUCTION`} at={{ d: [12, 1], t: [12, 1], m: [6, 1] }} testId="casting-actors" className="exc-pane exc-pane--catalogue">
        <div className="exc-filter">
          <label className="exf-search">
            <span>CREATIVE SEARCH</span>
            <input type="search" value={query} placeholder="warm but intimidating woman in her 40s" onChange={(e) => setQuery(e.target.value)} data-testid="acting-catalogue-search" />
          </label>
          <div className="exf-seg" role="group" aria-label="Availability" data-testid="casting-availability">
            {states.map((s) => (
              <button key={s} type="button" className={s === state ? 'is-active' : ''} aria-pressed={s === state} onClick={() => setState(s)}>
                {words(s)}
              </button>
            ))}
          </div>
        </div>
        {list.length ?
          <MediaGrid cols={{ d: 4, t: 4, m: 2 }} testId="casting-actor-grid">
            {list.map((a) => actorCard(a, 'h'))}
          </MediaGrid>
        : <Empty title="NO CATALOGUE MATCH" body="TRY A DIFFERENT CREATIVE SEARCH." />}
      </Panel>
    </Grid>
  );
}

type Opener = (items: readonly MediaItem[], index: number, title: string) => void;

function Continuity({ d, go, open }: { d: FamilyProps['d']; go: FamilyProps['go']; open: Opener }) {
  const [sel, setSel] = useState(d.cast.characters.find((c) => characterMedia(d, c).length)?.characterId ?? d.cast.characters[0]?.characterId ?? '');
  const c = d.character(sel);
  const media = characterMedia(d, c);
  const cont = d.continuity.find((x) => x.character.characterId === sel);
  const a = d.actor(c?.actorId);
  return (
    <Grid rows={{ d: '1fr 0.62fr', t: '1.25fr 0.38fr 0.6fr', m: '0.9fr 0.55fr 0.5fr 0.45fr' }}>
      <Panel title="SELECTED CHARACTER" meta={c ? words(c.status) : undefined} at={{ d: [3, 1], t: [4, 1], m: [3, 1] }} testId="casting-continuity-selected" className="exc-pane">
        {c ?
          <MediaCard
            media={first(media)}
            kicker={IMPORTANCE[c.screenImportance] ?? c.screenImportance}
            title={c.characterName}
            to={go('casting', 'character-profile', c.characterId)}
            sub={a ? `PERFORMER · ${a.stageName.toUpperCase()}` : 'NO ACTOR'}
            onInspect={media.length ? () => open(media, 0, c.characterName) : undefined}
            emptyLabel="NO CANONICAL IMAGE"
          />
        : <Empty title="NO CHARACTERS" />}
      </Panel>
      <Panel title="APPEARANCE REFERENCE" meta={`${media.length} AUTHORITY IMAGES`} at={{ d: [6, 1], t: [8, 1], m: [6, 1] }} testId="casting-continuity-appearance" className="exc-pane">
        {media.length ?
          <MediaGrid cols={{ d: Math.min(4, media.length), t: Math.min(4, media.length), m: 4 }}>
            {media.slice(0, 4).map((m, i) => (
              <MediaCard key={m.url} media={m} title={m.label} onInspect={() => open(media, i, c?.characterName ?? 'APPEARANCE')} />
            ))}
          </MediaGrid>
        : <Empty title="NO APPEARANCE AUTHORITY" body="NO CANONICAL IMAGERY IS RECORDED FOR THIS CHARACTER." />}
      </Panel>
      <Panel title="CONTINUITY STATUS" meta={cont?.valid ? 'ON TRACK' : 'DRIFT'} at={{ d: [3, 1], t: [12, 1], m: [3, 1] }} testId="casting-continuity">
        {d.continuity.map(({ character: x, valid, flags }) => (
          <Row
            key={x.characterId}
            onClick={() => setSel(x.characterId)}
            active={x.characterId === sel}
            testId="casting-continuity-row"
            media={<i className={`exf-dot exf-dot--${valid ? 'green' : 'red'}`} aria-hidden />}
            title={x.characterName}
            sub={valid ? 'NO DRIFT' : flags.join(' · ')}
            aside={<Chip tone={valid ? 'green' : 'red'}>{valid ? 'OK' : `${flags.length}`}</Chip>}
          />
        ))}
      </Panel>
      <Panel title="AUTHORITY SHEETS" meta={`${d.cast.authoritySheets.filter((s) => s.locked).length}/${d.cast.authoritySheets.length} LOCKED`} at={{ d: [6, 1], t: [6, 1], m: [6, 1] }} testId="casting-authority-sheets">
        {d.cast.authoritySheets.map((s) => (
          <Row key={s.characterAuthorityId} title={s.characterName} sub={s.continuityNotes} aside={<Chip tone={s.locked ? 'green' : 'amber'}>{s.locked ? 'LOCKED' : 'OPEN'}</Chip>} />
        ))}
      </Panel>
      <Panel title="TEMPORAL LOOKS" meta={`${d.cast.temporalLooks.length} ERAS`} at={{ d: [6, 1], t: [6, 1], m: [6, 1] }} testId="casting-temporal">
        {d.cast.temporalLooks.map((t) => (
          <Row key={t.temporalLookId} title={`${t.eraLabel} · ${d.character(t.characterId)?.characterName ?? ''}`} sub={t.narrativeReason} aside={<Chip tone={t.preservesActorIdentity ? 'green' : 'red'}>{t.preservesActorIdentity ? 'SAME ACTOR' : 'BREAK'}</Chip>} />
        ))}
      </Panel>
    </Grid>
  );
}

function RoleDetail({ d, id, go, open }: { d: FamilyProps['d']; id: string | null; go: FamilyProps['go']; open: Opener }) {
  const q = d.role(id);
  if (!q) return <Empty title="ROLE NOT FOUND" body={`NO CASTING REQUIREMENT ${upper(id)} IN THIS ENTRY.`} testId="casting-role-missing" />;
  const chars = d.charactersForRole(q.requirementId);
  const arche = new Set(q.suggestedRoleArchetypes ?? []);
  const matches = d.actors.filter((a) => a.roleArchetypes.some((x) => arche.has(x)));
  const firstChar = chars[0];
  const media = roleMedia(d, q.requirementId);
  return (
    <Grid rows={{ d: '1.1fr 0.62fr', t: '1fr 0.62fr', m: '1fr 0.42fr 0.46fr 0.42fr' }}>
      <Panel title="ROLE" meta={`${IMPORTANCE[q.screenImportance]} · ${chars.length ? 'CAST' : 'OPEN FOR CASTING'}`} at={{ d: [8, 1], t: [8, 1], m: [6, 1] }} testId="casting-role-detail" className="exc-pane">
        <RecordHero
          media={first(media)}
          kicker={`CASTING / ROLES / ${IMPORTANCE[q.screenImportance] ?? ''}`}
          title={q.narrativeRole}
          sub={q.era}
          chips={
            <>
              <Chip tone={chars.length ? 'green' : 'amber'}>{chars.length ? 'CAST' : 'OPEN FOR CASTING'}</Chip>
              {(q.suggestedRoleArchetypes ?? []).slice(0, 3).map((x) => (
                <Chip key={x}>{words(x)}</Chip>
              ))}
            </>
          }
          facts={<p className="exf-text">{q.storyFunction}</p>}
          actions={
            <>
              {firstChar ?
                <Btn to={go('casting', 'character-profile', firstChar.characterId)} testId="casting-view-character">
                  VIEW CHARACTER
                </Btn>
              : null}
              {firstChar?.actorId ?
                <Btn to={go('casting', 'actor-profile', firstChar.actorId)} variant="red" testId="casting-view-actor">
                  VIEW ACTOR
                </Btn>
              : <Btn to={go('casting', 'actors')} variant="red" testId="casting-cast-role">
                  CAST THIS ROLE
                </Btn>
              }
            </>
          }
          onInspect={media.length ? () => open(media, 0, q.narrativeRole) : undefined}
          testId="casting-role-hero"
        />
      </Panel>
      <Panel title="VISUAL REQUIREMENTS" at={{ d: [4, 1], t: [4, 1], m: [6, 1] }} testId="casting-role-requirements">
        <Kv
          rows={[
            ['AGE', q.approximateAgePresentation],
            ['PRESENTATION', q.presentationRequirements],
            ['ERA', q.era],
            ['WARDROBE', q.wardrobeContext],
            ['CONTINUITY', q.requiredContinuity],
            ['SPECIAL', q.specialVisualRequirements],
            ['PERFORMANCE', q.performanceEnergy],
          ]}
        />
      </Panel>
      <Panel title="KEY MOMENTS" meta={`${media.length} AUTHORITY IMAGES`} at={{ d: [5, 1], t: [5, 1], m: [6, 1] }} testId="casting-role-current" className="exc-pane">
        {media.length ?
          <MediaGrid cols={{ d: Math.min(4, media.length), t: Math.min(4, media.length), m: Math.min(4, media.length) }}>
            {media.slice(0, 4).map((m, i) => (
              <MediaCard key={m.url} media={m} title={m.label} onInspect={() => open(media, i, q.narrativeRole)} />
            ))}
          </MediaGrid>
        : <Empty title="NOT CAST YET" body="NO CHARACTER FILLS THIS ROLE — NO IMAGERY EXISTS." />}
      </Panel>
      <Panel title="SHORTLIST · CATALOGUE MATCHES" meta={`${matches.length} BY ARCHETYPE`} to={go('casting', 'actors')} toLabel="CATALOGUE" at={{ d: [7, 1], t: [7, 1], m: [6, 1] }} testId="casting-role-matches" className="exc-pane">
        {matches.length ?
          <FaceRail items={matches.map((a) => ({ key: a.actorId, media: first(actorMedia(a)), name: a.stageName.toUpperCase(), sub: a.catalogueNumber, to: go('casting', 'actor-profile', a.actorId) }))} label="Catalogue matches" />
        : <Empty title="NO ARCHETYPE MATCH" />}
      </Panel>
    </Grid>
  );
}

function ActorProfile({ d, id, go, open }: { d: FamilyProps['d']; id: string | null; go: FamilyProps['go']; open: Opener }) {
  const a = d.actor(id);
  if (!a) return <Empty title="ACTOR NOT FOUND" body={`NO CATALOGUE ACTOR ${upper(id)}.`} testId="casting-actor-missing" />;
  const plays = d.charactersForActor(a.actorId);
  const media = actorMedia(a);
  return (
    <Grid rows={{ d: '1.08fr 0.6fr', t: '1fr 0.62fr', m: '1fr 0.42fr 0.5fr' }}>
      <Panel title="ACTOR" meta={`${a.catalogueNumber} · ${words(a.status)}`} at={{ d: [8, 1], t: [8, 1], m: [6, 1] }} testId="casting-actor-profile" className="exc-pane">
        <RecordHero
          media={first(media)}
          kicker={`CASTING / ACTORS / ${a.catalogueNumber}`}
          title={a.stageName}
          sub={[a.presentation, a.ageRange].filter((x) => x && x !== '—').join(' · ').toUpperCase()}
          chips={
            <>
              <Chip tone={availTone(a.availabilityState)}>{words(a.availabilityState)}</Chip>
              <Chip tone={a.continuityRisk === 'LOW' ? 'green' : 'amber'}>RISK {a.continuityRisk}</Chip>
            </>
          }
          facts={
            <Kv
              rows={[
                ['ARCHETYPES', a.roleArchetypes.map(words).join(', ')],
                ['PERFORMANCE', a.performanceProfile.map(words).join(', ')],
                ['LANGUAGES', a.languages.join(', ')],
              ]}
            />
          }
          actions={
            plays[0] ?
              <Btn to={go('casting', 'character-profile', plays[0].characterId)} variant="red" testId="casting-actor-character">
                VIEW CHARACTER
              </Btn>
            : <Btn to={go('casting', 'roles')} variant="red" testId="casting-actor-cast">
                CAST IN ROLE
              </Btn>
          }
          onInspect={media.length ? () => open(media, 0, a.stageName) : undefined}
          testId="casting-actor-hero"
        />
      </Panel>
      <Panel title="VISUAL AUTHORITIES" meta={`${media.length} IMAGES`} at={{ d: [4, 2], t: [4, 2], m: [6, 1] }} testId="casting-actor-visuals" className="exc-pane">
        <Gallery items={media} title={a.stageName} open={open} testId="casting-actor-hero-media" emptyLabel="NO HEADSHOT" railOnPhone />
      </Panel>
      <Panel title="IDENTITY · RANGE" at={{ d: [4, 1], t: [4, 1], m: [3, 1] }} testId="casting-actor-identity">
        <Kv
          rows={[
            ['PRESENTATION', a.presentation],
            ['AGE RANGE', a.ageRange],
            ['HEIGHT', a.heightRange],
            ['BUILD', a.build],
            ['HAIR', a.hairBaseline],
            ['EYES', a.eyeDescription],
            ['EMOTIONAL', a.emotionalRange.join(', ')],
            ['PERIODS', a.periodAdaptability.join(', ')],
            ['DRAMATIC FIT', a.dramaticFit.join(', ')],
          ]}
        />
      </Panel>
      <Panel title="CURRENT / PAST CASTING" meta={`${plays.length} IN ENTRY 002`} at={{ d: [4, 1], t: [4, 1], m: [3, 1] }} testId="casting-actor-characters">
        {plays.length ?
          plays.map((c) => <Row key={c.characterId} to={go('casting', 'character-profile', c.characterId)} title={c.characterName} sub={`ROLE · ${d.role(c.castingRequirementId)?.narrativeRole ?? '—'}`} />)
        : <Empty title="NOT IN THIS PRODUCTION" body="THIS ACTOR PLAYS NO CHARACTER IN ENTRY 002." />}
        <Kv rows={[['PROJECTS', a.projectsUsed.join(', ').toUpperCase() || '—'], ['CAMPAIGNS', a.campaignsUsed.join(', ').toUpperCase() || '—']]} />
      </Panel>
    </Grid>
  );
}

function CharacterProfile({ d, id, go, open }: { d: FamilyProps['d']; id: string | null; go: FamilyProps['go']; open: Opener }) {
  const c = d.character(id);
  if (!c) return <Empty title="CHARACTER NOT FOUND" body={`NO CHARACTER ${upper(id)} IN THIS ENTRY.`} testId="casting-character-missing" />;
  const q = d.role(c.castingRequirementId);
  const a = d.actor(c.actorId);
  const looks = d.looksFor(c.characterId);
  const sheet = d.sheet(c.characterId);
  const cont = d.continuity.find((x) => x.character.characterId === c.characterId);
  const media = characterMedia(d, c);
  return (
    <Grid rows={{ d: '1.08fr 0.62fr', t: '1fr 0.62fr', m: '1fr 0.42fr 0.5fr' }}>
      <Panel title="CHARACTER" meta={`${IMPORTANCE[c.screenImportance]} · ${words(c.status)}`} at={{ d: [8, 1], t: [8, 1], m: [6, 1] }} testId="casting-character-profile" className="exc-pane">
        <RecordHero
          media={first(media)}
          kicker={`CASTING / CHARACTERS / ${IMPORTANCE[c.screenImportance] ?? ''}`}
          title={c.characterName}
          sub={c.agePresentation}
          chips={
            <>
              <Chip tone={c.status === 'LOCKED' ? 'green' : 'amber'}>{words(c.status)}</Chip>
              <Chip tone={cont?.valid ? 'green' : 'red'}>{cont?.valid ? 'CONTINUITY ON TRACK' : 'CONTINUITY DRIFT'}</Chip>
            </>
          }
          facts={<p className="exf-text">{c.storyFunction}</p>}
          actions={
            <>
              <Row to={q ? go('casting', 'role-detail', q.requirementId) : undefined} testId="casting-character-role" media={<Chip tone="ink">ROLE</Chip>} title={q?.narrativeRole ?? 'NO ROLE'} />
              <Row to={a ? go('casting', 'actor-profile', a.actorId) : undefined} testId="casting-character-actor" media={<Chip tone="ink">ACTOR</Chip>} title={a ? a.stageName : 'NO ACTOR'} sub={a?.catalogueNumber} />
            </>
          }
          onInspect={media.length ? () => open(media, 0, c.characterName) : undefined}
          testId="casting-character-hero"
        />
      </Panel>
      <Panel title="APPEARANCE" meta={`${media.length} AUTHORITY IMAGES`} at={{ d: [4, 2], t: [4, 2], m: [6, 1] }} testId="casting-character-gallery" className="exc-pane">
        <Gallery items={media} title={c.characterName} open={open} testId="casting-character-media" emptyLabel="NO CANONICAL IMAGE" railOnPhone />
      </Panel>
      <Panel title="CHARACTER PREMISE" at={{ d: [4, 1], t: [4, 1], m: [3, 1] }} testId="casting-character-premise">
        <Kv rows={[['PERSONALITY', c.personality], ['MOTIVATION', c.motivation], ['RELATIONSHIPS', c.relationshipMap], ['DIRECTION', c.performanceDirection], ['BEATS', `${c.appearsInBeats.length} · ${c.firstBeat} → ${c.lastBeat}`], ['SHOTS', pad2(c.appearsInShots.length)]]} />
      </Panel>
      <Panel title="LOOKS · CONTINUITY" meta={`${looks.length} LOOKS`} to={go('look', 'looks')} toLabel="LOOKS" at={{ d: [4, 1], t: [4, 1], m: [3, 1] }} testId="casting-character-looks">
        {looks.length ? looks.map((l) => <Row key={l.lookId} title={l.label} sub={`${l.era} · ${l.colorPalette}`} />) : <Empty title="NO LOOK ASSIGNED" />}
        <Kv rows={[['AUTHORITY SHEET', sheet ? (sheet.locked ? 'LOCKED' : 'OPEN') : 'NONE'], ['FLAGS', cont?.flags.length ? cont.flags.join(' · ') : 'NONE']]} />
      </Panel>
    </Grid>
  );
}
