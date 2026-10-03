/**
 * Production → EXPRESSION sub-workspaces (mobile): Narrative, Casting, Wardrobe / Hair / Makeup,
 * Performance, Sets / Scene, Storyboard, Review / Handoff.
 * Reads canonical Entry 002 data; presentation only — no writes, no provider dispatch.
 */

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { productionExpressionPath } from '../../../../shared/site00-production-workspace/routes.js';
import {
  castingCreativeSearch,
  getProductionCastingResidentTalentCatalogue,
  listStudioWorldResidentTalentActors,
} from '../../../../shared/site00-studio-world/acting-catalogue/index.js';
import type { ResidentBackedStudioWorldActor } from '../../../../shared/site00-studio-world/resident-intelligence/season1-ensemble/projectToActor.js';
import type {
  CharacterCampaignLook,
  ProductionCharacter,
} from '../../../../shared/site00-studio-world/acting-catalogue/index.js';
import { ExpressionEngineNarrativeMomentumPanel } from '../founderWorkspace/expressionEngine/ExpressionEngineNarrativeMomentumPanel';
import { useExpressionEngineEntry002 } from '../founderWorkspace/expressionEngine/useExpressionEngineEntry002';
import {
  postCompileNarrativeMomentum,
  postNarrativeMomentumJudgment,
  type NarrativeMomentumFounderAction,
} from '../founderWorkspace/expressionEngine/expressionEngineNarrativeMomentumActions';
import {
  IconArrow,
  PwButton,
  PwChip,
  PwKV,
  PwRow,
  PwScreenHead,
  PwTabs,
  type PwChipTone,
} from './PwPrimitives';
import { actorFor, isEntry002Project, useEntry002Production, type PackageItemStatus } from './useEntry002Production';

const pad = (n: number) => String(n).padStart(2, '0');
const words = (s: string) => s.replace(/_/g, ' ');
const tidy = (s: string | null | undefined): string => {
  if (!s) return '—';
  const t = s.trim();
  if (t.length > 3 && t === t.toUpperCase()) {
    const l = t.toLowerCase();
    return l.charAt(0).toUpperCase() + l.slice(1);
  }
  return t;
};

const ACRONYMS = new Set(['NDX', 'IG']);
/** "THE 2026 WOMAN" → "The 2026 Woman"; known acronyms stay upper-case. */
const titleCase = (s: string | null | undefined): string =>
  !s ? '—' : s.split(/\s+/).map((w) => (ACRONYMS.has(w.toUpperCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join(' ');

const ENGINE_ROUTE = (slug: string) => `/projects/${slug}/content-operations/expression-engine`;

function Blank({ label, ratio, className = '' }: { label: string; ratio?: string; className?: string }) {
  return (
    <div className={`pw-plate pw-plate--blank ${className}`} style={ratio ? { aspectRatio: ratio } : undefined}>
      {label}
    </div>
  );
}

function Monogram({ text, size = 84 }: { text: string; size?: number }) {
  const ini = text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <span
      className="pw-plate pw-plate--blank"
      style={{ width: size, height: size + 20, flex: `0 0 ${size}px`, fontSize: '1.05rem', fontWeight: 700, padding: 0, letterSpacing: '0.06em' }}
      aria-hidden
    >
      {ini}
    </span>
  );
}

function NoEntry({ slug }: { slug: string }) {
  return (
    <div className="pw-empty" data-testid="expression-no-entry">
      <strong>NO CAMPAIGN ENTRY IN PRODUCTION</strong>
      {slug.toUpperCase()} HAS NO EXPRESSION ENTRY YET. CAMPAIGNS ARRIVE HERE FROM PROJECT REQUESTS.
    </div>
  );
}

function importanceChip(imp: ProductionCharacter['screenImportance']) {
  const label = imp === 'HERO' ? 'LEAD' : imp === 'SUPPORTING' ? 'SUPPORTING' : imp === 'ENSEMBLE' ? 'ENSEMBLE' : 'BACKGROUND';
  return <PwChip tone={imp === 'HERO' ? 'green' : 'gray'}>{label}</PwChip>;
}

function statusTone(status: PackageItemStatus): PwChipTone {
  if (status === 'APPROVED' || status === 'LOCKED') return 'green';
  if (status === 'BLOCKED') return 'red';
  if (status === 'IN_PROGRESS') return 'orange';
  return 'gray';
}

type SubProps = { slug: string; entry: string };

const back = (slug: string, entry: string) => `${productionExpressionPath(slug)}?entry=${entry}`;

/* ─── NARRATIVE ─────────────────────────────────────────────────────── */

function NarrativeMomentumLive() {
  const { nme, reload } = useExpressionEngineEntry002();
  const { plan: canonical } = useEntry002Production();
  const [judging, setJudging] = useState(false);
  const plan = nme?.plan ?? canonical;

  const onJudgment = useCallback(
    async (a: NarrativeMomentumFounderAction) => {
      setJudging(true);
      try {
        await postNarrativeMomentumJudgment(a);
        await reload();
      } catch {
        /* API unavailable — judgment not recorded */
      } finally {
        setJudging(false);
      }
    },
    [reload],
  );
  const onRecompile = useCallback(async () => {
    setJudging(true);
    try {
      await postCompileNarrativeMomentum();
      await reload();
    } catch {
      /* API unavailable */
    } finally {
      setJudging(false);
    }
  }, [reload]);

  return (
    <div className="pw-embed-light" data-testid="expression-narrative-momentum">
      <ExpressionEngineNarrativeMomentumPanel
        plan={plan}
        grammarLibraryCount={nme?.grammarLibraryCount ?? 10}
        judging={judging}
        onJudgment={onJudgment}
        onRecompile={onRecompile}
      />
    </div>
  );
}

export function NarrativeScreen({ slug, entry }: SubProps) {
  const [tab, setTab] = useState<'story' | 'structure' | 'momentum'>('story');
  const { plan } = useEntry002Production();
  const ok = isEntry002Project(slug);

  return (
    <div data-testid="expression-sub-screen-narrative">
      <PwScreenHead backTo={back(slug, entry)} backLabel="Expression" title="Narrative" />
      <PwTabs
        tabs={[
          { id: 'story', label: 'Story' },
          { id: 'structure', label: 'Structure' },
          { id: 'momentum', label: 'Momentum' },
        ]}
        active={tab}
        onChange={setTab}
      />
      {!ok ? <NoEntry slug={slug} /> : null}
      {ok && tab === 'story' ?
        <>
          <h2 className="pw-section" style={{ marginTop: 4 }}>Narrative core</h2>
          <PwKV
            rows={[
              { k: 'Goal', v: tidy(plan.narrativeGoal) },
              { k: 'Starting belief', v: tidy(plan.audienceStartingBelief) },
              { k: 'Desired shift', v: tidy(plan.audienceDesiredShift) },
              { k: 'Grammar', v: words(plan.selectedGrammarId) },
              { k: 'Format', v: 'Cinematic campaign' },
            ]}
          />
          <div className="pw-cta">
            <PwButton variant="red" onClick={() => setTab('momentum')} testId="narrative-open-momentum">
              Open narrative momentum <IconArrow />
            </PwButton>
          </div>
        </>
      : null}
      {ok && tab === 'structure' ?
        <div className="pw-list" data-testid="narrative-structure">
          {plan.beats.map((b) => (
            <PwRow
              key={b.beatId}
              onClick={() => setTab('momentum')}
              title={`${pad(b.order)} · ${b.label}`}
              sub={tidy(b.whatChangesInThisBeat)}
              chip={<PwChip tone={b.tensionStage === 'PEAK' ? 'red' : b.tensionStage === 'ESCALATION' ? 'orange' : 'gray'}>{b.tensionStage}</PwChip>}
            />
          ))}
        </div>
      : null}
      {ok && tab === 'momentum' ? <NarrativeMomentumLive /> : null}
    </div>
  );
}

/* ─── CASTING ───────────────────────────────────────────────────────── */

export function CastingScreen({ slug, entry }: SubProps) {
  const [tab, setTab] = useState<'roles' | 'actors' | 'characters'>('roles');
  const [query, setQuery] = useState('');
  const { cast, gate } = useEntry002Production();
  const catalogue = getProductionCastingResidentTalentCatalogue();
  const actors = useMemo(
    () => (query.trim() ? castingCreativeSearch(query, catalogue) : listStudioWorldResidentTalentActors()),
    [catalogue, query],
  );
  const ok = isEntry002Project(slug);
  const lookLabel = (c: ProductionCharacter) => {
    const eras = cast.temporalLooks.filter((t) => t.characterId === c.characterId).map((t) => t.eraLabel);
    if (eras.length) return eras.join(' + ') + ' Look';
    return cast.looks.find((l) => l.lookId === c.campaignLookId)?.label ?? c.narrativeRole;
  };

  return (
    <div data-testid="expression-sub-screen-casting">
      <PwScreenHead backTo={back(slug, entry)} backLabel="Expression" title="Casting" />
      <PwTabs
        tabs={[
          { id: 'roles', label: 'Roles' },
          { id: 'actors', label: 'Actors' },
          { id: 'characters', label: 'Characters' },
        ]}
        active={tab}
        onChange={setTab}
      />
      {!ok ? <NoEntry slug={slug} /> : null}
      {ok && tab === 'roles' ?
        <>
          <div className="pw-list">
            {cast.characters.map((c) => {
              const actor = actorFor(c);
              const assigned = !!c.actorId;
              return (
                <div key={c.characterId} className="pw-row" data-testid="casting-role-row">
                  {actor?.headshotPreviewUrl ?
                    <span className="pw-row__thumb" style={{ backgroundImage: `url(${actor.headshotPreviewUrl})` }} />
                  : <Monogram text={actor?.stageName ?? c.characterName} />}
                  <span className="pw-row__text">
                    <span className="pw-row__title">{titleCase(c.characterName)}</span>
                    <span className="pw-row__sub">{lookLabel(c)}</span>
                    <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {importanceChip(c.screenImportance)}
                      <PwChip tone={assigned ? 'green' : 'orange'}>{assigned ? `ASSIGNED${actor ? ` · ${actor.catalogueNumber}` : ''}` : 'UNRESOLVED'}</PwChip>
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
          {gate.missingCharacterAuthorities.length ?
            <p className="pw-note" style={{ marginTop: 12 }}>
              Authority missing: {gate.missingCharacterAuthorities.join(' · ')}
            </p>
          : null}
          <div className="pw-cta">
            <PwButton onClick={() => setTab('actors')} testId="casting-open-catalogue">
              Open actor catalogue <IconArrow />
            </PwButton>
          </div>
        </>
      : null}
      {ok && tab === 'actors' ?
        <>
          <label className="pw-label" htmlFor="pw-actor-search">Creative search</label>
          <input
            id="pw-actor-search"
            className="pw-select"
            style={{ margin: '8px 0 12px' }}
            type="search"
            value={query}
            placeholder="warm but intimidating woman in her 40s"
            onChange={(e) => setQuery(e.target.value)}
            data-testid="acting-catalogue-search"
          />
          <div className="pw-list">
            {actors.map((a) => {
              const resident = a as ResidentBackedStudioWorldActor;
              const badge = 'residentBadgeLabel' in resident ? resident.residentBadgeLabel : null;
              const role = 'studioWorldRole' in resident ? resident.studioWorldRole : null;
              return (
                <div key={a.actorId} className="pw-row" data-testid={`actor-row-${a.catalogueNumber}`} data-resident={badge ? '1' : '0'}>
                  {a.headshotPreviewUrl ?
                    <span className="pw-row__thumb" style={{ backgroundImage: `url(${a.headshotPreviewUrl})` }} />
                  : <Monogram text={a.stageName} size={64} />}
                  <span className="pw-row__text">
                    <span className="pw-row__title">{a.stageName}</span>
                    <span className="pw-row__sub">
                      {a.catalogueNumber}
                      {role ? ` · ${role}` : ''}
                    </span>
                    <span className="pw-row__sub">{a.personalityRange[0]?.slice(0, 80) ?? a.roleArchetypes.slice(0, 2).map(words).join(' · ')}</span>
                    {badge ?
                      <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                        <PwChip tone="green">{badge}</PwChip>
                      </span>
                    : null}
                  </span>
                  <PwChip tone={a.availabilityState === 'AVAILABLE' ? 'green' : 'amber'}>{words(a.availabilityState)}</PwChip>
                </div>
              );
            })}
          </div>
        </>
      : null}
      {ok && tab === 'characters' ?
        <div className="pw-list">
          {cast.characters.map((c) => (
            <div key={c.characterId} className="pw-row" style={{ alignItems: 'flex-start' }}>
              <span className="pw-row__text">
                <span className="pw-row__title">{titleCase(c.characterName)}</span>
                <span className="pw-row__sub">{tidy(c.storyFunction)}</span>
                <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <PwChip tone={c.status === 'LOCKED' ? 'green' : 'orange'}>{words(c.status)}</PwChip>
                  {importanceChip(c.screenImportance)}
                </span>
              </span>
            </div>
          ))}
        </div>
      : null}
    </div>
  );
}

/* ─── WARDROBE / HAIR / MAKEUP ─────────────────────────────────────── */

export function WardrobeScreen({ slug, entry }: SubProps) {
  const [tab, setTab] = useState<'looks' | 'hair' | 'makeup'>('looks');
  const { cast } = useEntry002Production();
  const ok = isEntry002Project(slug);
  const dressed = cast.characters.filter((c) => c.campaignLookId);
  const [charId, setCharId] = useState(dressed[0]?.characterId ?? '');
  const character = dressed.find((c) => c.characterId === charId) ?? dressed[0];
  const temporal = character ? cast.temporalLooks.filter((t) => t.characterId === character.characterId) : [];
  const eras = temporal.length ? temporal.map((t) => ({ era: t.eraLabel, lookId: t.campaignLookId })) : character?.campaignLookId ? [{ era: 'CURRENT', lookId: character.campaignLookId }] : [];
  const [era, setEra] = useState<string>('');
  const activeEra = eras.find((e) => e.era === era) ?? eras[0];
  const look: CharacterCampaignLook | undefined = cast.looks.find((l) => l.lookId === activeEra?.lookId);
  const actor = character ? actorFor(character) : null;
  const locked = character?.status === 'LOCKED';

  return (
    <div data-testid="expression-sub-screen-wardrobe">
      <PwScreenHead backTo={back(slug, entry)} backLabel="Expression" title="Wardrobe" />
      <PwTabs
        tabs={[
          { id: 'looks', label: 'Looks' },
          { id: 'hair', label: 'Hair' },
          { id: 'makeup', label: 'Makeup' },
        ]}
        active={tab}
        onChange={setTab}
      />
      {!ok ? <NoEntry slug={slug} /> : null}
      {ok && character ?
        <div className="pw-stack">
          <div className="pw-select-wrap">
            <select
              className="pw-select"
              value={character.characterId}
              onChange={(e) => {
                setCharId(e.target.value);
                setEra('');
              }}
              aria-label="Character"
              data-testid="wardrobe-character-select"
            >
              {dressed.map((c) => {
                const a = actorFor(c);
                return (
                  <option key={c.characterId} value={c.characterId}>
                    {titleCase(c.characterName)}
                    {a ? ` (${a.catalogueNumber})` : ''}
                  </option>
                );
              })}
            </select>
          </div>
          {eras.length > 1 ?
            <div className="pw-seg" role="group" aria-label="Era">
              {eras.map((e) => (
                <button key={e.era} type="button" className={e.era === activeEra?.era ? 'is-active' : ''} onClick={() => setEra(e.era)}>
                  {e.era}
                </button>
              ))}
            </div>
          : null}
          {look ?
            <>
              <Blank label={`${look.label} · look authority`} ratio="16 / 8" className="pw-plate--look" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>{look.label}</span>
                <PwChip tone={locked ? 'green' : 'orange'}>{locked ? 'APPROVED' : 'IN REVIEW'}</PwChip>
              </div>
              {tab === 'looks' ?
                <PwKV
                  rows={[
                    { k: 'Outfit pieces', v: look.garments.length },
                    { k: 'Accessories', v: [look.jewelry, look.bag, look.accessories].filter(Boolean).length },
                    { k: 'Hair style', v: look.hairAuthorityId ?? '—' },
                    { k: 'Makeup look', v: look.makeupAuthorityId ?? '—' },
                    { k: 'Continuity', v: words(look.wardrobeContinuityDefault) },
                  ]}
                />
              : null}
              {tab === 'hair' ?
                <PwKV
                  rows={[
                    { k: 'Hair', v: tidy(look.hair) },
                    { k: 'Authority', v: look.hairAuthorityId ?? '—' },
                    { k: 'Actor baseline', v: tidy(actor?.hairBaseline) },
                    { k: 'Era', v: look.era },
                  ]}
                />
              : null}
              {tab === 'makeup' ?
                <PwKV
                  rows={[
                    { k: 'Makeup', v: tidy(look.makeup) },
                    { k: 'Nails', v: tidy(look.nails) },
                    { k: 'Grooming', v: tidy(look.grooming) },
                    { k: 'Authority', v: look.makeupAuthorityId ?? '—' },
                  ]}
                />
              : null}
            </>
          : (
            <div className="pw-empty">
              <strong>NO LOOK ASSIGNED</strong>
              THIS CHARACTER HAS NO CAMPAIGN LOOK YET.
            </div>
          )}
          <PwButton variant="ghost" to={ENGINE_ROUTE(slug)} testId="wardrobe-open-engine">
            Open fitting in expression engine <IconArrow />
          </PwButton>
        </div>
      : null}
    </div>
  );
}

/* ─── PERFORMANCE ───────────────────────────────────────────────────── */

export function PerformanceScreen({ slug, entry }: SubProps) {
  const [tab, setTab] = useState<'behavior' | 'movement' | 'voice' | 'emotion'>('behavior');
  const { cast } = useEntry002Production();
  const ok = isEntry002Project(slug);
  const players = cast.characters.filter((c) => c.screenImportance !== 'ENSEMBLE');
  const [charId, setCharId] = useState(players[0]?.characterId ?? '');
  const character = players.find((c) => c.characterId === charId) ?? players[0];
  const actor = character ? actorFor(character) : null;

  const rows: Record<typeof tab, { k: string; v: ReactNode }[]> = {
    behavior: [
      { k: 'Personality', v: tidy(character?.personality) },
      { k: 'Behavior skin', v: actor?.personalityRange.slice(0, 3).join(', ') || 'Not assigned' },
      { k: 'Direction', v: tidy(character?.performanceDirection) },
      { k: 'Motivation', v: tidy(character?.motivation) },
    ],
    movement: [
      { k: 'Movement skin', v: actor?.performanceProfile.slice(0, 3).map(words).join(', ') || 'Not assigned' },
      { k: 'Screen presence', v: actor?.cinematicPresence.slice(0, 3).join(', ') || '—' },
      { k: 'Animation skin', v: 'Not assigned' },
    ],
    voice: [
      { k: 'Voice profile', v: actor ? `${actor.languages.join(', ')}` : 'Not assigned' },
      { k: 'Accents', v: actor?.accentCapabilities.join(', ') || '—' },
      { k: 'Tone', v: tidy(character?.performanceDirection) },
    ],
    emotion: [
      { k: 'Emotional range', v: actor?.emotionalRange.slice(0, 4).join(', ') || 'Not assigned' },
      { k: 'Dramatic fit', v: actor?.dramaticFit.slice(0, 2).join(', ') || '—' },
      { k: 'Continuity risk', v: actor?.continuityRisk ?? '—' },
    ],
  };

  return (
    <div data-testid="expression-sub-screen-performance">
      <PwScreenHead backTo={back(slug, entry)} backLabel="Expression" title="Performance" />
      <PwTabs
        tabs={[
          { id: 'behavior', label: 'Behavior' },
          { id: 'movement', label: 'Movement' },
          { id: 'voice', label: 'Voice' },
          { id: 'emotion', label: 'Emotion' },
        ]}
        active={tab}
        onChange={setTab}
      />
      {!ok ? <NoEntry slug={slug} /> : null}
      {ok && character ?
        <div className="pw-stack">
          <p className="pw-label">Select character</p>
          <div className="pw-select-wrap">
            <select className="pw-select" value={character.characterId} onChange={(e) => setCharId(e.target.value)} aria-label="Character" data-testid="performance-character-select">
              {players.map((c) => {
                const a = actorFor(c);
                return (
                  <option key={c.characterId} value={c.characterId}>
                    {titleCase(c.characterName)}
                    {a ? ` (${a.catalogueNumber})` : ''}
                  </option>
                );
              })}
            </select>
          </div>
          <Blank label={`${tidy(character.characterName)} · performance rig`} ratio="16 / 5" className="pw-plate--strip" />
          <PwKV rows={rows[tab]} />
          <PwButton variant="ghost" to={ENGINE_ROUTE(slug)}>
            Open in expression engine <IconArrow />
          </PwButton>
        </div>
      : null}
    </div>
  );
}

/* ─── SETS / SCENE ──────────────────────────────────────────────────── */

export function SetsScreen({ slug, entry }: SubProps) {
  const [tab, setTab] = useState<'environments' | 'sets' | 'zones' | 'props'>('environments');
  const ok = isEntry002Project(slug);
  const empty = (title: string, body: string) => (
    <div className="pw-empty" data-testid="sets-empty">
      <strong>{title}</strong>
      {body}
    </div>
  );

  return (
    <div data-testid="expression-sub-screen-sets">
      <PwScreenHead backTo={back(slug, entry)} backLabel="Expression" title="Sets / Scene" />
      <PwTabs
        tabs={[
          { id: 'environments', label: 'Environments' },
          { id: 'sets', label: 'Sets' },
          { id: 'zones', label: 'Zones' },
          { id: 'props', label: 'Props' },
        ]}
        active={tab}
        onChange={setTab}
      />
      {!ok ? <NoEntry slug={slug} /> : null}
      {ok ?
        <div className="pw-stack">
          {tab === 'environments' ?
            empty('NO ENVIRONMENT ASSIGNED', 'ENTRY 002 HAS NO ENVIRONMENT OR SET AUTHORITY YET. REQUEST ONE FROM THE PROJECT, OR SEARCH THE ENVIRONMENT LIBRARY.')
          : empty(`NO ${tab.toUpperCase()} DEFINED`, 'THIS SLOT FILLS ONCE A SET IS ASSIGNED TO THE ENTRY.')}
          <p className="pw-label">Set details</p>
          <PwKV
            rows={[
              { k: 'Environment', v: 'Not assigned' },
              { k: 'Set', v: 'Not assigned' },
              { k: 'Zones', v: '0' },
              { k: 'Props', v: '0' },
              { k: 'Graphics / text anchors', v: '0' },
              { k: 'Camera coverage', v: 'Not planned' },
            ]}
          />
          <PwButton variant="ghost" to="/production/libraries" testId="sets-open-libraries">
            Open environment library <IconArrow />
          </PwButton>
        </div>
      : null}
    </div>
  );
}

/* ─── STORYBOARD ────────────────────────────────────────────────────── */

export function StoryboardScreen({ slug, entry }: SubProps) {
  const { items } = useEntry002Production();
  const ok = isEntry002Project(slug);
  const sb = items.find((i) => i.id === 'storyboard')!;
  return (
    <div data-testid="expression-sub-screen-storyboard">
      <PwScreenHead backTo={back(slug, entry)} backLabel="Expression" title="Storyboard" sub="Keyframes · scenes" />
      {!ok ? <NoEntry slug={slug} /> : null}
      {ok ?
        <div className="pw-stack">
          <PwKV rows={[{ k: 'Status', v: <PwChip tone={statusTone(sb.status)}>{words(sb.status)}</PwChip> }, { k: 'Gate', v: sb.detail }]} />
          <PwButton variant="red" to={ENGINE_ROUTE(slug)} testId="storyboard-open-engine">
            Open storyboard in expression engine <IconArrow />
          </PwButton>
        </div>
      : null}
    </div>
  );
}

/* ─── REVIEW / HANDOFF ──────────────────────────────────────────────── */

export function ReviewScreen({ slug, entry }: SubProps) {
  const [tab, setTab] = useState<'package' | 'checklist' | 'handoff'>('package');
  const { items, ready, total, gate } = useEntry002Production();
  const ok = isEntry002Project(slug);
  const blockers = items.filter((i) => i.status !== 'APPROVED' && i.status !== 'LOCKED');
  const allReady = blockers.length === 0;

  return (
    <div data-testid="expression-sub-screen-review">
      <PwScreenHead backTo={back(slug, entry)} backLabel="Expression" title="Review" />
      <PwTabs
        tabs={[
          { id: 'package', label: 'Package' },
          { id: 'checklist', label: 'Checklist' },
          { id: 'handoff', label: 'Handoff' },
        ]}
        active={tab}
        onChange={setTab}
      />
      {!ok ? <NoEntry slug={slug} /> : null}
      {ok && tab === 'package' ?
        <>
          <div className="pw-pkg" data-testid="review-package">
            {items.map((i) => {
              const done = i.status === 'APPROVED' || i.status === 'LOCKED';
              return (
                <div key={i.id} className="pw-pkg__row">
                  <span className={`pw-check${done ? '' : i.status === 'BLOCKED' ? ' pw-check--warn' : ' pw-check--todo'}`}>
                    {done ? '✓' : '·'}
                  </span>
                  <span>{i.label}</span>
                  <PwChip tone={statusTone(i.status)}>{words(i.status)}</PwChip>
                </div>
              );
            })}
          </div>
          <div className="pw-cta">
            <PwButton variant="red" disabled={!allReady} onClick={() => setTab('handoff')} testId="lock-production-package">
              Lock production package <IconArrow />
            </PwButton>
            {!allReady ?
              <p className="pw-note">
                {blockers.length} of {total} not ready — {blockers.map((b) => b.label).join(' · ')}
              </p>
            : null}
          </div>
        </>
      : null}
      {ok && tab === 'checklist' ?
        <div className="pw-list">
          {items.map((i) => (
            <PwRow key={i.id} to={`${productionExpressionPath(slug, i.id === 'cast' ? 'casting' : i.id === 'sets' ? 'sets' : i.id)}?entry=${entry}`} title={i.label} sub={i.detail} chip={<PwChip tone={statusTone(i.status)}>{words(i.status)}</PwChip>} />
          ))}
        </div>
      : null}
      {ok && tab === 'handoff' ?
        <div className="pw-stack">
          <PwKV
            rows={[
              { k: 'Package readiness', v: `${ready} of ${total}` },
              { k: 'Cast gate', v: gate.allRequiredCharactersLocked ? 'Locked' : 'Open' },
              { k: 'Next stage', v: 'Storyboard / keyframes' },
            ]}
          />
          <PwButton variant="red" to={ENGINE_ROUTE(slug)} disabled={!allReady} testId="handoff-send">
            Send to storyboard <IconArrow />
          </PwButton>
          {!allReady ? <p className="pw-note">Handoff unlocks when every package item is approved or locked.</p> : null}
        </div>
      : null}
    </div>
  );
}
