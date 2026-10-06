/**
 * 02 CASTING — root · roles · actors · characters · continuity · role-detail · actor-profile · character-profile.
 *
 * ROLE = CastingRequirement (what the story needs) · ACTOR = StudioWorldActor (catalogue talent) ·
 * CHARACTER = ProductionCharacter (story identity played by an actor in a role). Each has its own list, its own
 * detail route and its own record type; they are linked by ids only and never shown as one merged object.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { castingCreativeSearch, getStudioWorldActorCatalogue, type StudioWorldActor } from '../../../../../../shared/site00-studio-world/acting-catalogue/index.js';
import { pad2 } from '../../primitives';
import { upper, words } from '../expressionData';
import { Actions, Btn, Chip, Donut, Empty, Grid, Img, Kv, Mono, Panel, Row, Stat, type Tone } from '../ExpressionFamilyShell';
import type { FamilyProps } from './types';

const IMPORTANCE: Record<string, string> = { HERO: 'LEAD', SUPPORTING: 'SUPPORTING', ENSEMBLE: 'ENSEMBLE', BACKGROUND: 'BACKGROUND' };
const availTone = (s: string): Tone => (s === 'AVAILABLE' ? 'green' : s === 'IN_CURRENT_PRODUCTION' ? 'red' : 'amber');

/**
 * Actor headshot — a PORTRAIT at the catalogue's headshot aspect, face-safe at every width. CHIP inside list rows,
 * TILE in the talent rail, PREVIEW on the actor record. With no headshot the initials tile keeps the same slot.
 */
function ActorFace({ actor, label, scale = 'CHIP' }: { actor: StudioWorldActor | null; label: string; scale?: 'CHIP' | 'TILE' | 'PREVIEW' }) {
  const media = { role: 'PORTRAIT', scale, aspect: 'ACTOR_HEADSHOT', slot: scale === 'CHIP' ? 'ROW_THUMB' : 'PORTRAIT', focal: 'face' } as const;
  return actor?.headshotPreviewUrl ? <Img url={actor.headshotPreviewUrl} label={label} className="exf-face" {...media} fit="PORTRAIT_COVER" /> : <Mono text={actor?.stageName ?? label} className="exf-face" media={media} />;
}

export function CastingFamily({ d, r, go }: FamilyProps) {
  if (!d.ok) return <Empty title="NO CAMPAIGN ENTRY IN PRODUCTION" body={`${d.slug.toUpperCase()} HAS NO CASTING YET.`} testId="expression-no-entry" />;
  const roles = d.cast.requirements;
  // A role is cast only when its character is played by a CATALOGUED actor (a placeholder actor id is not a cast).
  const castRoles = roles.filter((q) => d.charactersForRole(q.requirementId).some((c) => !!d.actor(c.actorId)));
  const unresolved = roles.length - castRoles.length;
  const inCast = new Set(d.cast.characters.map((c) => c.actorId).filter((id) => !!d.actor(id)));
  const available = d.actors.filter((a) => a.availabilityState === 'AVAILABLE');
  const castArt = d.nodeArt('cast');

  const roleCard = (q: (typeof roles)[number], i: number) => {
    const chars = d.charactersForRole(q.requirementId);
    const actor = d.actor(chars[0]?.actorId);
    const cast = chars.some((c) => !!c.actorId);
    return (
      <Row
        key={q.requirementId}
        to={go('casting', 'role-detail', q.requirementId)}
        testId="casting-role-row"
        media={<ActorFace actor={actor} label={q.narrativeRole} />}
        title={
          <>
            <em className="exf-num">{pad2(i + 1)}</em> {q.narrativeRole}
          </>
        }
        sub={`${IMPORTANCE[q.screenImportance] ?? q.screenImportance} · ${q.era}`}
        aside={<Chip tone={cast ? 'green' : 'amber'}>{cast ? 'CAST' : 'OPEN'}</Chip>}
      />
    );
  };
  const actorRow = (a: StudioWorldActor) => (
    <Row
      key={a.actorId}
      to={go('casting', 'actor-profile', a.actorId)}
      testId={`actor-row-${a.catalogueNumber}`}
      media={<ActorFace actor={a} label={a.stageName} />}
      title={a.stageName}
      sub={`${a.catalogueNumber} · ${a.ageRange} · ${a.roleArchetypes.slice(0, 2).map(words).join(' · ')}`}
      aside={<Chip tone={availTone(a.availabilityState)}>{words(a.availabilityState)}</Chip>}
    />
  );
  const characterRow = (c: (typeof d.cast.characters)[number]) => {
    const actor = d.actor(c.actorId);
    return (
      <Row
        key={c.characterId}
        to={go('casting', 'character-profile', c.characterId)}
        testId="casting-character-row"
        media={<Mono text={c.characterName} className="exf-face exf-face--char" media={{ role: 'PORTRAIT', scale: 'CHIP', slot: 'ROW_THUMB' }} />}
        title={c.characterName}
        sub={`${c.narrativeRole} · ${actor ? `PLAYED BY ${actor.catalogueNumber}` : 'NO ACTOR'}`}
        aside={<Chip tone={c.status === 'LOCKED' ? 'green' : 'amber'}>{words(c.status)}</Chip>}
      />
    );
  };
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

  switch (r.route.id) {
    case 'roles':
      return (
        <Grid rows={{ d: '1fr 0.75fr', t: '1fr 0.8fr', m: '1.2fr 0.85fr 0.6fr' }}>
          <Panel title="ROLES" meta={`${roles.length} CASTING REQUIREMENTS`} at={{ d: [8, 2], t: [7, 2], m: [6, 1] }} media="MEDIA_INLINE" testId="casting-roles">
            {roles.map(roleCard)}
          </Panel>
          <Panel title="CASTING OVERVIEW" at={{ d: [4, 1], t: [5, 1], m: [6, 1] }} testId="casting-roles-overview">
            {overview}
          </Panel>
          <Panel title="CAST GATE" meta={d.gate.allRequiredCharactersLocked ? 'LOCKED' : 'OPEN'} at={{ d: [4, 1], t: [5, 1], m: [6, 1] }} testId="casting-gate">
            <Kv
              rows={[
                ['REQUIRED LOCKED', d.gate.allRequiredCharactersLocked ? 'YES' : 'NO'],
                ['UNCATALOGUED LEADS', d.gate.uncataloguedHeroes.length ? d.gate.uncataloguedHeroes.join(' · ') : 'NONE'],
                ['MISSING AUTHORITY', d.gate.missingCharacterAuthorities.length ? d.gate.missingCharacterAuthorities.join(' · ') : 'NONE'],
              ]}
            />
            <Actions>
              <Btn to={go('casting', 'actors')} testId="casting-open-catalogue">
                OPEN ACTOR CATALOGUE
              </Btn>
            </Actions>
          </Panel>
        </Grid>
      );
    case 'actors':
      return <Actors d={d} actorRow={actorRow} inCast={inCast} />;
    case 'characters':
      return (
        <Grid rows={{ d: '1fr 0.62fr', t: '1fr 0.7fr', m: '1.15fr 1fr' }}>
          <Panel title="CHARACTERS" meta={`${d.cast.characters.length} STORY IDENTITIES`} at={{ d: [7, 2], t: [7, 2], m: [6, 1] }} media="MEDIA_INLINE" testId="casting-characters">
            {d.cast.characters.map(characterRow)}
          </Panel>
          <Panel title="ROLE → ACTOR → CHARACTER" meta="LINKED BY ID · NEVER MERGED" at={{ d: [5, 2], t: [5, 2], m: [6, 1] }} testId="casting-chain">
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
      return (
        <Grid rows={{ d: '1fr 0.8fr', t: '1fr 0.85fr', m: '1fr 0.9fr 0.7fr' }}>
          <Panel title="CONTINUITY MATRIX" meta={`${d.continuity.filter((c) => c.valid).length}/${d.continuity.length} VALID`} at={{ d: [7, 2], t: [7, 2], m: [6, 1] }} testId="casting-continuity">
            {d.continuity.map(({ character: c, valid, flags }) => (
              <Row
                key={c.characterId}
                to={go('casting', 'character-profile', c.characterId)}
                testId="casting-continuity-row"
                media={<i className={`exf-dot exf-dot--${valid ? 'green' : 'red'}`} aria-hidden />}
                title={c.characterName}
                sub={valid ? 'NO DRIFT' : flags.join(' · ')}
                aside={<Chip tone={valid ? 'green' : 'red'}>{valid ? 'ON TRACK' : `${flags.length} FLAG${flags.length === 1 ? '' : 'S'}`}</Chip>}
              />
            ))}
          </Panel>
          <Panel title="AUTHORITY SHEETS" meta={`${d.cast.authoritySheets.filter((s) => s.locked).length}/${d.cast.authoritySheets.length} LOCKED`} at={{ d: [5, 1], t: [5, 1], m: [6, 1] }} testId="casting-authority-sheets">
            {d.cast.authoritySheets.map((s) => (
              <Row key={s.characterAuthorityId} title={s.characterName} sub={s.continuityNotes} aside={<Chip tone={s.locked ? 'green' : 'amber'}>{s.locked ? 'LOCKED' : 'OPEN'}</Chip>} />
            ))}
          </Panel>
          <Panel title="TEMPORAL LOOKS" meta={`${d.cast.temporalLooks.length} ERAS`} at={{ d: [5, 1], t: [5, 1], m: [6, 1] }} testId="casting-temporal">
            {d.cast.temporalLooks.map((t) => (
              <Row key={t.temporalLookId} title={`${t.eraLabel} · ${d.character(t.characterId)?.characterName ?? ''}`} sub={t.narrativeReason} aside={<Chip tone={t.preservesActorIdentity ? 'green' : 'red'}>{t.preservesActorIdentity ? 'SAME ACTOR' : 'IDENTITY BREAK'}</Chip>} />
            ))}
          </Panel>
        </Grid>
      );
    case 'role-detail':
      return <RoleDetail d={d} id={r.param} go={go} actorRow={actorRow} />;
    case 'actor-profile':
      return <ActorProfile d={d} id={r.param} go={go} />;
    case 'character-profile':
      return <CharacterProfile d={d} id={r.param} go={go} />;
    default:
      return (
        <Grid rows={{ d: '1.05fr 0.9fr', t: '1fr 0.8fr 0.75fr', m: '1.05fr 0.8fr 0.75fr 0.5fr' }}>
          <Panel title="ROLE PREVIEWS" meta={`${roles.length} ROLES`} to={go('casting', 'roles')} at={{ d: [8, 1], t: [12, 1], m: [6, 1] }} media="MEDIA_INLINE" testId="casting-role-previews">
            <div className="exf-list">
              {roles.map((q, i) => roleCard(q, i))}
            </div>
          </Panel>
          <Panel title="CASTING OVERVIEW" at={{ d: [4, 1], t: [6, 1], m: [6, 1] }} testId="casting-root-overview">
            {overview}
          </Panel>
          <Panel title="AVAILABLE TALENT" meta={`${available.length} AVAILABLE · ${d.actors.length} IN CATALOGUE`} to={go('casting', 'actors')} toLabel="CATALOGUE" at={{ d: [5, 1], t: [6, 1], m: [6, 1] }} media="PORTRAIT_GRID" testId="casting-available-talent">
            <div className="exf-rail">
              {d.actors.map((a) => (
                <Link key={a.actorId} to={go('casting', 'actor-profile', a.actorId)} className="exf-tile" data-testid="casting-talent-tile">
                  <ActorFace actor={a} label={a.stageName} scale="TILE" />
                  <b>{a.stageName}</b>
                  <small>{a.roleArchetypes.slice(0, 2).map(words).join(' · ')}</small>
                </Link>
              ))}
            </div>
          </Panel>
          <Panel title="CASTING ACTIONS" at={{ d: [3, 1], t: [6, 1], m: [6, 1] }} testId="casting-actions">
            <Actions>
              <Btn to={go('casting', 'actors')} testId="casting-open-catalogue">
                OPEN ACTOR CATALOGUE
              </Btn>
              <Btn to={go('casting', 'roles')} variant="red" testId="casting-review">
                REVIEW CASTING
              </Btn>
            </Actions>
          </Panel>
          <Panel title="LEAD AUTHORITY" meta="HUB CAST NODE" at={{ d: [4, 1], t: [6, 1], m: [6, 1] }} media="AUTHORITY_PREVIEW" testId="casting-lead-authority">
            <Img url={castArt} label="CAST AUTHORITY" className="exf-fill" role="REFERENCE_AUTHORITY" scale="PREVIEW" aspect="node:cast" />
          </Panel>
          <Panel title="CASTING STATUS" at={{ d: [0, 0], t: [0, 0], m: [6, 1] }} hide="d t" testId="casting-status-strip">
            <div className="exf-stats">
              <Stat value={pad2(unresolved)} label="UNRESOLVED ROLES" tone={unresolved ? 'red' : 'green'} />
              <Stat value={pad2(inCast.size)} label="CAST ASSIGNED" />
              <Stat value={pad2(available.length)} label="AVAILABLE TALENT" />
            </div>
          </Panel>
        </Grid>
      );
  }
}

function Actors({ d, actorRow, inCast }: { d: FamilyProps['d']; actorRow: (a: StudioWorldActor) => React.ReactNode; inCast: Set<string | null> }) {
  const [query, setQuery] = useState('');
  const catalogue = getStudioWorldActorCatalogue();
  const list = useMemo(() => (query.trim() ? castingCreativeSearch(query, catalogue) : catalogue.actors), [catalogue, query]);
  const states = [...new Set(d.actors.map((a) => a.availabilityState))];
  return (
    <Grid rows={{ d: '1fr 0.7fr', t: '1fr 0.75fr', m: '1.35fr 0.65fr' }}>
      <Panel title="ACTOR CATALOGUE" meta={`${list.length} OF ${d.actors.length} ACTORS`} at={{ d: [8, 2], t: [7, 2], m: [6, 1] }} media="MEDIA_INLINE" testId="casting-actors">
        <label className="exf-search">
          <span>CREATIVE SEARCH</span>
          <input type="search" value={query} placeholder="warm but intimidating woman in her 40s" onChange={(e) => setQuery(e.target.value)} data-testid="acting-catalogue-search" />
        </label>
        <div className="exf-list" data-scroll="internal">
          {list.length ? list.map(actorRow) : <Empty title="NO CATALOGUE MATCH" body="TRY A DIFFERENT CREATIVE SEARCH." />}
        </div>
      </Panel>
      <Panel title="AVAILABILITY" meta="CATALOGUE" at={{ d: [4, 1], t: [5, 1], m: [3, 1] }} testId="casting-availability">
        <div className="exf-stats exf-stats--col">
          {states.map((s) => (
            <Stat key={s} value={pad2(d.actors.filter((a) => a.availabilityState === s).length)} label={words(s)} tone={availTone(s)} />
          ))}
        </div>
      </Panel>
      <Panel title="IN THIS PRODUCTION" meta={`${inCast.size} ACTORS`} at={{ d: [4, 1], t: [5, 1], m: [3, 1] }} testId="casting-in-production">
        {d.actors
          .filter((a) => inCast.has(a.actorId))
          .map((a) => (
            <Row key={a.actorId} title={a.stageName} sub={d.charactersForActor(a.actorId).map((c) => c.characterName).join(' · ')} />
          ))}
      </Panel>
    </Grid>
  );
}

function RoleDetail({ d, id, go, actorRow }: { d: FamilyProps['d']; id: string | null; go: FamilyProps['go']; actorRow: (a: StudioWorldActor) => React.ReactNode }) {
  const q = d.role(id);
  if (!q) return <Empty title="ROLE NOT FOUND" body={`NO CASTING REQUIREMENT ${upper(id)} IN THIS ENTRY.`} testId="casting-role-missing" />;
  const chars = d.charactersForRole(q.requirementId);
  const arche = new Set(q.suggestedRoleArchetypes ?? []);
  const matches = d.actors.filter((a) => a.roleArchetypes.some((x) => arche.has(x)));
  const firstChar = chars[0];
  return (
    <Grid rows={{ d: '0.9fr 1fr', t: '0.85fr 0.85fr 0.8fr', m: '0.8fr 0.95fr 0.8fr 0.55fr' }}>
      <Panel title="ROLE" meta={`${IMPORTANCE[q.screenImportance]} · ${chars.length ? 'CAST' : 'OPEN FOR CASTING'}`} at={{ d: [5, 1], t: [12, 1], m: [6, 1] }} testId="casting-role-detail" className="exf-record">
        <h4 className="exf-record__title">{q.narrativeRole}</h4>
        <p className="exf-text">{q.storyFunction}</p>
        <div className="exf-tags">
          <Chip tone="ink">{IMPORTANCE[q.screenImportance]}</Chip>
          {(q.suggestedRoleArchetypes ?? []).map((a) => (
            <Chip key={a}>{words(a)}</Chip>
          ))}
        </div>
      </Panel>
      <Panel title="VISUAL REQUIREMENTS" at={{ d: [4, 1], t: [6, 1], m: [6, 1] }} testId="casting-role-requirements">
        <Kv
          rows={[
            ['AGE', q.approximateAgePresentation],
            ['PRESENTATION', q.presentationRequirements],
            ['ERA', q.era],
            ['WARDROBE', q.wardrobeContext],
            ['CONTINUITY', q.requiredContinuity],
            ['SPECIAL', q.specialVisualRequirements],
          ]}
        />
      </Panel>
      <Panel title="PERFORMANCE BRIEF" at={{ d: [3, 1], t: [6, 1], m: [6, 1] }} testId="casting-role-brief">
        <p className="exf-text">{q.performanceEnergy}</p>
      </Panel>
      <Panel title="CURRENT CAST" meta={`${chars.length} CHARACTER${chars.length === 1 ? '' : 'S'}`} at={{ d: [4, 1], t: [4, 1], m: [6, 1] }} media="MEDIA_INLINE" testId="casting-role-current">
        {chars.length ?
          chars.map((c) => {
            const a = d.actor(c.actorId);
            return (
              <Row
                key={c.characterId}
                to={go('casting', 'character-profile', c.characterId)}
                media={<ActorFace actor={a} label={c.characterName} />}
                title={c.characterName}
                sub={a ? `ACTOR · ${a.catalogueNumber} ${a.stageName}` : 'NO ACTOR ASSIGNED'}
                aside={<Chip tone={c.status === 'LOCKED' ? 'green' : 'amber'}>{words(c.status)}</Chip>}
              />
            );
          })
        : <Empty title="NOT CAST YET" body="NO CHARACTER FILLS THIS ROLE." />}
      </Panel>
      <Panel title="CATALOGUE MATCHES" meta={`${matches.length} BY ARCHETYPE`} at={{ d: [5, 1], t: [4, 1], m: [6, 1] }} media="MEDIA_INLINE" testId="casting-role-matches">
        {matches.length ? matches.map(actorRow) : <Empty title="NO ARCHETYPE MATCH" />}
      </Panel>
      <Panel title="ACTIONS" at={{ d: [3, 1], t: [4, 1], m: [6, 1] }} testId="casting-role-actions">
        <Actions>
          {firstChar ?
            <Btn to={go('casting', 'character-profile', firstChar.characterId)} testId="casting-view-character">
              VIEW CHARACTER
            </Btn>
          : null}
          {firstChar?.actorId ?
            <Btn to={go('casting', 'actor-profile', firstChar.actorId)} variant="red" testId="casting-view-actor">
              VIEW ACTOR
            </Btn>
          : null}
          <Btn to={go('casting', 'roles')} variant="ghost">
            ALL ROLES
          </Btn>
        </Actions>
      </Panel>
    </Grid>
  );
}

function ActorProfile({ d, id, go }: { d: FamilyProps['d']; id: string | null; go: FamilyProps['go'] }) {
  const a = d.actor(id);
  if (!a) return <Empty title="ACTOR NOT FOUND" body={`NO CATALOGUE ACTOR ${upper(id)}.`} testId="casting-actor-missing" />;
  const plays = d.charactersForActor(a.actorId);
  return (
    <Grid rows={{ d: '1fr 0.85fr', t: '0.9fr 0.8fr 0.75fr', m: '0.85fr 0.9fr 0.8fr 0.6fr' }}>
      <Panel title="ACTOR" meta={`${a.catalogueNumber} · ${words(a.status)}`} at={{ d: [4, 2], t: [6, 1], m: [6, 1] }} media="MEDIA_LEAD" testId="casting-actor-profile" className="exf-record">
        <div className="exf-record__media">
          <ActorFace actor={a} label={a.stageName} scale="PREVIEW" />
        </div>
        <h4 className="exf-record__title">{a.stageName}</h4>
        <div className="exf-tags">
          <Chip tone={availTone(a.availabilityState)}>{words(a.availabilityState)}</Chip>
          <Chip tone={a.continuityRisk === 'LOW' ? 'green' : 'amber'}>RISK {a.continuityRisk}</Chip>
        </div>
      </Panel>
      <Panel title="IDENTITY" at={{ d: [4, 1], t: [6, 1], m: [6, 1] }} testId="casting-actor-identity">
        <Kv
          rows={[
            ['AGE RANGE', a.ageRange],
            ['PRESENTATION', a.presentation],
            ['HEIGHT', a.heightRange],
            ['BUILD', a.build],
            ['HAIR', a.hairBaseline],
            ['EYES', a.eyeDescription],
            ['LANGUAGES', a.languages.join(', ')],
            ['ACCENTS', a.accentCapabilities.join(', ')],
          ]}
        />
      </Panel>
      <Panel title="RANGE" at={{ d: [4, 1], t: [6, 1], m: [6, 1] }} testId="casting-actor-range">
        <Kv
          rows={[
            ['PERFORMANCE', a.performanceProfile.map(words).join(', ')],
            ['EMOTIONAL', a.emotionalRange.join(', ')],
            ['ARCHETYPES', a.roleArchetypes.map(words).join(', ')],
            ['PERIODS', a.periodAdaptability.join(', ')],
            ['DRAMATIC FIT', a.dramaticFit.join(', ')],
          ]}
        />
      </Panel>
      <Panel title="CHARACTERS IN THIS PRODUCTION" meta={`${plays.length}`} at={{ d: [5, 1], t: [6, 1], m: [6, 1] }} testId="casting-actor-characters">
        {plays.length ?
          plays.map((c) => <Row key={c.characterId} to={go('casting', 'character-profile', c.characterId)} title={c.characterName} sub={`ROLE · ${d.role(c.castingRequirementId)?.narrativeRole ?? '—'}`} />)
        : <Empty title="NOT IN THIS PRODUCTION" body="THIS ACTOR PLAYS NO CHARACTER IN ENTRY 002." />}
      </Panel>
      <Panel title="FIT + HISTORY" at={{ d: [3, 1], t: [6, 1], m: [6, 1] }} testId="casting-actor-history">
        <Kv
          rows={[
            ['COMMERCIAL', a.commercialFit.join(', ')],
            ['EDITORIAL', a.editorialFit.join(', ')],
            ['PROJECTS', a.projectsUsed.join(', ').toUpperCase() || '—'],
            ['CAMPAIGNS', a.campaignsUsed.join(', ').toUpperCase() || '—'],
          ]}
        />
      </Panel>
    </Grid>
  );
}

function CharacterProfile({ d, id, go }: { d: FamilyProps['d']; id: string | null; go: FamilyProps['go'] }) {
  const c = d.character(id);
  if (!c) return <Empty title="CHARACTER NOT FOUND" body={`NO CHARACTER ${upper(id)} IN THIS ENTRY.`} testId="casting-character-missing" />;
  const q = d.role(c.castingRequirementId);
  const a = d.actor(c.actorId);
  const looks = d.looksFor(c.characterId);
  const sheet = d.sheet(c.characterId);
  const cont = d.continuity.find((x) => x.character.characterId === c.characterId);
  return (
    <Grid rows={{ d: '1fr 0.85fr', t: '0.9fr 0.8fr 0.75fr', m: '0.85fr 0.85fr 0.8fr 0.65fr' }}>
      <Panel title="CHARACTER" meta={`${IMPORTANCE[c.screenImportance]} · ${words(c.status)}`} at={{ d: [5, 1], t: [12, 1], m: [6, 1] }} testId="casting-character-profile" className="exf-record">
        <h4 className="exf-record__title">{c.characterName}</h4>
        <p className="exf-text">{c.storyFunction}</p>
        <Kv cols={2} rows={[['PERSONALITY', c.personality], ['MOTIVATION', c.motivation], ['RELATIONSHIPS', c.relationshipMap], ['AGE', c.agePresentation]]} />
      </Panel>
      <Panel title="PLAYED BY · IN ROLE" meta="DISTINCT RECORDS" at={{ d: [4, 1], t: [6, 1], m: [6, 1] }} testId="casting-character-links">
        <Row to={q ? go('casting', 'role-detail', q.requirementId) : undefined} testId="casting-character-role" media={<Chip tone="ink">ROLE</Chip>} title={q?.narrativeRole ?? 'NO ROLE'} sub={q ? IMPORTANCE[q.screenImportance] : undefined} />
        <Row to={a ? go('casting', 'actor-profile', a.actorId) : undefined} testId="casting-character-actor" media={<Chip tone="ink">ACTOR</Chip>} title={a ? a.stageName : 'NO ACTOR'} sub={a?.catalogueNumber} />
      </Panel>
      <Panel title="CONTINUITY" meta={cont?.valid ? 'ON TRACK' : 'DRIFT'} at={{ d: [3, 1], t: [6, 1], m: [6, 1] }} testId="casting-character-continuity">
        <Kv rows={[['AUTHORITY SHEET', sheet ? (sheet.locked ? 'LOCKED' : 'OPEN') : 'NONE'], ['FLAGS', cont?.flags.length ? cont.flags.join(' · ') : 'NONE'], ['NOTES', sheet?.continuityNotes ?? '—']]} />
      </Panel>
      <Panel title="LOOKS" meta={`${looks.length}`} to={go('look', 'looks')} at={{ d: [4, 1], t: [6, 1], m: [6, 1] }} testId="casting-character-looks">
        {looks.length ? looks.map((l) => <Row key={l.lookId} title={l.label} sub={`${l.era} · ${l.colorPalette}`} />) : <Empty title="NO LOOK ASSIGNED" />}
      </Panel>
      <Panel title="PERFORMANCE" to={go('performance')} toLabel="PERFORMANCE" at={{ d: [4, 1], t: [6, 1], m: [6, 1] }} testId="casting-character-performance">
        <Kv rows={[['DIRECTION', c.performanceDirection], ['BEATS', `${c.appearsInBeats.length} · ${c.firstBeat} → ${c.lastBeat}`], ['SHOTS', pad2(c.appearsInShots.length)]]} />
      </Panel>
      <Panel title="AUTHORITY ASSETS" meta={sheet ? 'SHEET' : 'NONE'} at={{ d: [4, 1], t: [0, 0], m: [0, 0] }} hide="t m" testId="casting-character-assets">
        {sheet ?
          <Kv
            rows={[
              ['FRONT', sheet.frontPortraitAssetId ?? 'MISSING'],
              ['3/4', sheet.threeQuarterPortraitAssetId ?? 'MISSING'],
              ['PROFILE', sheet.sideProfileAssetId ?? 'MISSING'],
              ['FULL BODY', sheet.fullBodyAssetId ?? 'MISSING'],
            ]}
          />
        : <Empty title="NO AUTHORITY SHEET" />}
      </Panel>
    </Grid>
  );
}
