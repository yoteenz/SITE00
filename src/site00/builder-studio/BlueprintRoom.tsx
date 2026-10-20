/** 05 BLUEPRINT — the reveal, its five inspection sections, the review status, and submission. */
import { useEffect, useId, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { BsBody } from './bldrBody';
import { normalizeIntakeStatus } from '../../../shared/site00-intakes/types';
import { IntakeGuestAccessCapture } from '../components/intake/IntakeGuestAccessCapture';
import type { BlueprintSessionSnapshot } from '../builder-experience/spatialStudio';
import { compose } from './buildObject/composition';
import { BuildThumbnail } from './buildObject/BuildObjectStage';
import {
  ArrowsIcon,
  BadgeIcon,
  BagIcon,
  BarsIcon,
  BellIcon,
  BoltIcon,
  BuildTypeIcon,
  CalendarIcon,
  CardIcon,
  ChevronDownIcon,
  ChevronSmallRightIcon,
  ClockIcon,
  CloseIcon,
  CubeIcon,
  DatabaseIcon,
  DocumentIcon,
  FolderIcon,
  FullscreenIcon,
  GlobeIcon,
  GridIcon,
  ImageIcon,
  InvestmentIcon,
  LayersIcon,
  LinkIcon,
  LockIcon,
  MailIcon,
  PeopleIcon,
  PersonIcon,
  RecenterIcon,
  SearchIcon,
  SlidersIcon,
  SparkIcon,
  StandardIcon,
  StoreIcon,
  UploadIcon,
} from './icons';
import { designConflicts, resolveDesignDetails } from './designResolution';
import {
  featuresView,
  mainExperience,
  pageGroupElements,
  pagesView,
  structurePartElements,
  structureView,
  timelineView,
  type FeatureIconKey,
  type FlowKey,
} from './blueprintTabsModel';
import { blueprintAnatomy } from './buildObject/anatomy';
import {
  CORE_INCLUDED,
  FEEL_BY_ID,
  PACE_OPTIONS,
  blockerCopy,
  buildSpec,
  buildTypeSummary,
  expandInvestment,
  featureCount,
  spacedRange,
} from './studioModel';
import type { SpatialBuilderState, StudioRoomId } from './studioModel';
import { spatialSubmission, versionFacts } from './reviewModel';
import type { StudioSession } from './useStudioSession';

export type BlueprintTab = 'OVERVIEW' | 'STRUCTURE' | 'PAGES' | 'FEATURES' | 'TIMELINE';
export const BLUEPRINT_TABS: BlueprintTab[] = ['OVERVIEW', 'STRUCTURE', 'PAGES', 'FEATURES', 'TIMELINE'];

type Props = {
  session: StudioSession;
  goToRoom: (room: StudioRoomId) => void;
  openMenu: () => void;
  tab: BlueprintTab;
  setTab: (tab: BlueprintTab) => void;
};

/* ─────────────────────────────── stage overlay ─────────────────────────────── */

export function BlueprintStageControls({
  inspecting,
  setInspecting,
  onRecenter,
  stageRef,
  tab,
}: {
  inspecting: boolean;
  setInspecting: (v: boolean) => void;
  onRecenter: () => void;
  stageRef: RefObject<HTMLElement | null>;
  tab: BlueprintTab;
}) {
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const onChange = () => setExpanded(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);
  const toggleFullscreen = async () => {
    const el = stageRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
      return;
    }
    if (el.requestFullscreen) {
      await el.requestFullscreen().catch(() => el.classList.toggle('is-expanded'));
    } else {
      el.classList.toggle('is-expanded');
    }
    setInspecting(true);
  };
  return (
    <>
      <div className="bs-inspect" role="toolbar" aria-label="INSPECT BLUEPRINT">
        <button type="button" className={`bs-inspect__btn${inspecting ? ' is-on' : ''}`} aria-pressed={inspecting} onClick={() => setInspecting(!inspecting)} aria-label="TURN THE STRUCTURE IN 3D">
          <CubeIcon size={18} />
        </button>
        {inspecting ? (
          <button type="button" className="bs-inspect__btn" onClick={onRecenter} aria-label="RESET VIEW">
            <RecenterIcon size={17} />
          </button>
        ) : null}
        <button type="button" className={`bs-inspect__btn${expanded ? ' is-on' : ''}`} onClick={() => void toggleFullscreen()} aria-label={expanded ? 'EXIT FULL SCREEN' : 'VIEW FULL SCREEN'}>
          <FullscreenIcon size={17} />
        </button>
      </div>
      {inspecting ? <p className="bs-inspect__hint">DRAG TO TURN</p> : null}
      <div className="bs-indicator" aria-hidden="true">
        {BLUEPRINT_TABS.map((t) => (
          <span key={t} className={t === tab ? 'is-on' : undefined} />
        ))}
      </div>
    </>
  );
}

/* ─────────────────────────────── review status ─────────────────────────────── */

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

/** Where this Blueprint stands with SITE 00. Rendered only for states the intake record supports. */
export function ReviewStatus({ session }: { session: StudioSession }) {
  const { review, submitted, serverIntake } = session;
  const [showSubmitted, setShowSubmitted] = useState(false);
  if (review.stage === 'DRAFT' || !serverIntake) return null;
  const facts = submitted ? versionFacts(submitted.current) : null;
  return (
    <section className={`bs-review bs-review--${review.stage.toLowerCase()}`} aria-label="REVIEW STATUS" aria-live="polite">
      <p className="bs-review__eyebrow">
        {serverIntake.publicReference}
        {review.version ? ` · VERSION ${review.version}` : ''}
        {review.submittedAt ? ` · SUBMITTED ${formatDate(review.submittedAt)}` : ''}
      </p>
      <p className="bs-review__label">
        <span className="bs-review__dot" aria-hidden="true" />
        {review.label}
      </p>
      <p className="bs-review__sub">
        <BsBody>{review.sub}</BsBody>
      </p>
      {review.stage === 'REVISION_REQUESTED' ? (
        <div className="bs-review__request">
          <p className="bs-review__request-label">FROM SITE 00{review.request ? ` · ${formatDate(review.request.requestedAt)}` : ''}</p>
          <p className="bs-review__request-text">
            <BsBody>{review.request?.message ?? 'SITE 00 REOPENED YOUR BLUEPRINT FOR CHANGES.'}</BsBody>
          </p>
          <p className="bs-review__hint">
            EDIT YOUR CHOICES, THEN RESUBMIT. VERSION {review.version} STAYS ON RECORD EXACTLY AS YOU SENT IT.
          </p>
        </div>
      ) : null}
      {review.stage === 'ACCEPTED' && review.projectId ? (
        <a className="bs-btn bs-btn--outline-dark" href={`/projects/${review.projectId}`}>
          OPEN YOUR PROJECT
        </a>
      ) : null}
      {facts && review.stage === 'REVISION_REQUESTED' ? (
        <>
          <button type="button" className="bs-link" aria-expanded={showSubmitted} onClick={() => setShowSubmitted((v) => !v)}>
            {showSubmitted ? 'HIDE' : 'VIEW'} SUBMITTED VERSION {facts.version}
          </button>
          {showSubmitted ? (
            <dl className="bs-lines bs-lines--compact">
              {[
                ['PLACE', facts.place],
                ['FEEL', facts.feel],
                ['WORK', facts.modules],
                ['PACE', facts.pace],
                ['NOTE', facts.notes || '—'],
              ].map(([k, v]) => (
                <div key={k} className="bs-line">
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

/* ─────────────────────────────── panel ─────────────────────────────── */

export function BlueprintPanel(props: Props) {
  const { tab, setTab } = props;
  const ids = useId();
  return (
    <div className="bs-blueprint">
      <ReviewStatus session={props.session} />
      <div className="bs-tabs" role="tablist" aria-label="BLUEPRINT SECTIONS">
        {BLUEPRINT_TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`${ids}-tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`${ids}-panel`}
            className={`bs-tab${tab === t ? ' is-on' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="bs-tabpanel" role="tabpanel" id={`${ids}-panel`} aria-labelledby={`${ids}-tab-${tab}`}>
        {tab === 'OVERVIEW' ? <OverviewTab {...props} /> : null}
        {tab === 'STRUCTURE' ? <StructureTab {...props} /> : null}
        {tab === 'PAGES' ? <PagesTab {...props} /> : null}
        {tab === 'FEATURES' ? <FeaturesTab {...props} /> : null}
        {tab === 'TIMELINE' ? <TimelineTab {...props} /> : null}
      </div>
    </div>
  );
}

/** Canonical confidence label under timeline and investment (plain body punctuation). */
function rangeNote(snapshot: BlueprintSessionSnapshot, preview: boolean): string {
  if (!preview) return 'SHARED AT BLUEPRINT REVIEW';
  const label = snapshot.estimate?.confidence.label ?? 'INITIAL RANGE';
  return `${label.toUpperCase()}. BASED ON YOUR CURRENT SELECTIONS AND REQUIREMENTS.`;
}

function EstimateFigure({ value, preview }: { value: string | null; preview: boolean }) {
  if (!preview) return <span className="bs-figure bs-figure--muted">AT REVIEW</span>;
  // A range that has to wrap keeps its dash on the first figure ("$38,000 –" / "$76,000").
  return <span className="bs-figure">{value ? value.replace(' – ', '\u00a0– ') : '—'}</span>;
}

function ChangeLink({ session, room, goToRoom }: { session: StudioSession; room: StudioRoomId; goToRoom: (room: StudioRoomId) => void }) {
  if (session.locked) return null;
  const label = { place: '01 · PLACE', feel: '02 · FEEL', work: '03 · WORK', pace: '04 · PACE', blueprint: '' }[room];
  return (
    <button type="button" className="bs-link" onClick={() => goToRoom(room)}>
      CHANGE IN ROOM {label}
    </button>
  );
}

function TabHead({ title, lede }: { title: string; lede: string }) {
  return (
    <header className="bs-tabhead">
      <h2 className="bs-tabhead__title">{title}</h2>
      <p className="bs-tabhead__lede">
        <BsBody>{lede}</BsBody>
      </p>
    </header>
  );
}

function Disclose({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="bs-disclose">
      <summary>
        <span>{title}</span>
        <ChevronDownIcon size={10} />
      </summary>
      <div className="bs-disclose__body">{children}</div>
    </details>
  );
}

function Glance({ items }: { items: { key: string; icon: ReactNode; value: string; label: string }[] }) {
  return (
    <ul className="bs-glance">
      {items.map((item) => (
        <li key={item.key}>
          {item.icon}
          <span className="bs-glance__text">
            <span className="bs-glance__value">{item.value}</span>
            <span className="bs-glance__label">{item.label}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function StatStrip({ items }: { items: { key: string; icon: ReactNode; label: string; value: string }[] }) {
  return (
    <ul className="bs-stats">
      {items.map((item) => (
        <li key={item.key}>
          {item.icon}
          <span className="bs-stats__label">{item.label}</span>
          <span className="bs-stats__value">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * One part of the build, drawn as the same Build Object the stage shows with only that part's real geometry lit
 * (its pages' volumes and its features' modules, from the Blueprint anatomy) and the rest held as glass.
 */
function partStill(spec: ReturnType<typeof buildSpec>, key: string, lit: readonly string[]) {
  return compose('blueprint', spec, { inspect: { key: `part-${key}-${lit.join('.')}`, lit, isolate: true } });
}

const FEATURE_ICONS: Record<FeatureIconKey, (p: { size?: number }) => ReactNode> = {
  DOCUMENT: DocumentIcon,
  BAG: BagIcon,
  CARD: CardIcon,
  PERSON: PersonIcon,
  PEOPLE: PeopleIcon,
  FOLDER: FolderIcon,
  CHART: BarsIcon,
  CALENDAR: CalendarIcon,
  BADGE: BadgeIcon,
  SEARCH: SearchIcon,
  BELL: BellIcon,
  MAIL: MailIcon,
  GLOBE: GlobeIcon,
  LINK: LinkIcon,
  BOLT: BoltIcon,
  UPLOAD: UploadIcon,
  DATABASE: DatabaseIcon,
  CUBE: CubeIcon,
  SPARK: SparkIcon,
  STORE: StoreIcon,
};

function FeatureGlyph({ icon, size = 22 }: { icon: FeatureIconKey; size?: number }) {
  const Glyph = FEATURE_ICONS[icon];
  return <Glyph size={size} />;
}

/* ─────────────────────────────── 01 OVERVIEW ─────────────────────────────── */

function OverviewTab({ session, setTab, goToRoom, openMenu }: Props) {
  const { state, snapshot } = session.view;
  const preview = session.preview;
  const selection = snapshot.selection;
  const estimate = snapshot.estimate;
  const build = buildTypeSummary(state.placePath, selection);
  const feel = state.feelVibe ? FEEL_BY_ID[state.feelVibe] : null;
  const pages = snapshot.blueprint.experiences.reduce((n, g) => n + g.items.length, 0);
  const pace = PACE_OPTIONS.find((p) => p.id === state.pace);
  const spec = buildSpec(state);
  const features = featureCount(selection);
  const world = state.placePath === 'WORLD';
  const main = mainExperience(selection);
  const cards = useMemo(() => {
    const list: { key: string; label: string; value: string; thumb: ReturnType<typeof compose>; onOpen: () => void; hint: string }[] = [
      {
        key: 'feel',
        label: 'VISUAL DIRECTION',
        value: feel?.label ?? 'NOT CHOSEN',
        thumb: compose('feel', spec),
        onOpen: () => (session.locked ? setTab('STRUCTURE') : goToRoom('feel')),
        hint: session.locked ? 'OPEN STRUCTURE' : 'CHANGE IN ROOM 02',
      },
      {
        key: 'pages',
        label: world ? 'PLACES' : 'PAGES',
        value: world ? 'AT REVIEW' : `${pages} ${pages === 1 ? 'PAGE' : 'PAGES'}`,
        thumb: compose('work', { ...spec, modules: spec.modules.filter((m) => m === 'PAGES' || m === 'BLOG') }),
        onOpen: () => setTab('PAGES'),
        hint: 'OPEN PAGES',
      },
      {
        key: 'features',
        label: 'FEATURES',
        value: `${features} ${features === 1 ? 'FEATURE' : 'FEATURES'}`,
        thumb: compose('work', spec),
        onOpen: () => setTab('FEATURES'),
        hint: 'OPEN FEATURES',
      },
      {
        key: 'pace',
        label: 'PRIORITY',
        value: pace?.label ?? 'NOT CHOSEN',
        thumb: compose('pace', spec),
        onOpen: () => setTab('TIMELINE'),
        hint: 'OPEN TIMELINE',
      },
    ];
    return list;
  }, [feel?.label, world, pages, features, pace?.label, spec, session.locked, setTab, goToRoom]);
  return (
    <>
      <TabHead
        title="A DIGITAL LOCATION SHAPED AROUND YOUR BUSINESS."
        lede="THE DIRECTION, SCALE AND RANGE OF YOUR BUILD AS IT STANDS NOW. REVIEW IT HERE BEFORE YOU SEND IT TO SITE 00."
      />
      <div className="bs-tiles">
        <div className="bs-tile">
          <BuildTypeIcon size={24} />
          <span className="bs-tile__label">BUILD TYPE</span>
          <span className="bs-tile__value">{build.label}</span>
          <span className="bs-tile__sub">
            <BsBody>{build.descriptor}.</BsBody>
          </span>
        </div>
        <div className="bs-tile">
          <ClockIcon size={24} />
          <span className="bs-tile__label">ESTIMATED TIMELINE</span>
          <EstimateFigure value={estimate ? spacedRange(estimate.productionWindow) : null} preview={preview} />
          <span className="bs-tile__sub">
            <BsBody>{rangeNote(snapshot, preview)}</BsBody>
          </span>
        </div>
        <div className="bs-tile">
          <InvestmentIcon size={24} />
          <span className="bs-tile__label">ESTIMATED INVESTMENT</span>
          <EstimateFigure value={estimate ? expandInvestment(estimate.investment) : null} preview={preview} />
          <span className="bs-tile__sub">
            <BsBody>{rangeNote(snapshot, preview)}</BsBody>
          </span>
        </div>
        <div className="bs-tile">
          <BarsIcon size={24} />
          <span className="bs-tile__label">MAIN EXPERIENCE</span>
          <span className="bs-tile__value">{main?.label ?? (world ? 'WORLD' : 'AT REVIEW')}</span>
          <span className="bs-tile__sub">
            <BsBody>{main?.plain ?? 'SHAPED WITH YOU AT BLUEPRINT REVIEW.'}</BsBody>
          </span>
        </div>
      </div>
      <div className="bs-config-head">
        <h2>{session.view.fromSubmission ? `VERSION ${session.review.version ?? ''} AS SUBMITTED` : 'YOUR CONFIGURATION'}</h2>
        {session.locked ? (
          <span className="bs-config-head__locked">LOCKED FOR REVIEW</span>
        ) : (
          <button type="button" className="bs-btn bs-btn--outline-dark" onClick={openMenu}>
            <SlidersIcon size={15} /> EDIT SELECTIONS
          </button>
        )}
      </div>
      <ul className="bs-config">
        {cards.map((card) => (
          <li key={card.key}>
            <button type="button" className="bs-config__card" onClick={card.onOpen} aria-label={`${card.label}: ${card.value}. ${card.hint}`}>
              <BuildThumbnail composition={card.thumb} width={168} height={120} alt="" />
              <span className="bs-config__label">{card.label}</span>
              <span className="bs-config__value">
                {card.value} <ChevronSmallRightIcon size={9} />
              </span>
            </button>
          </li>
        ))}
      </ul>
      <h3 className="bs-section">AT A GLANCE</h3>
      <Glance
        items={[
          { key: 'pages', icon: <DocumentIcon size={22} />, value: world ? 'AT REVIEW' : String(pages), label: world ? 'PLACES' : pages === 1 ? 'PAGE' : 'PAGES' },
          { key: 'features', icon: <GridIcon size={22} />, value: String(features), label: features === 1 ? 'KEY FEATURE' : 'KEY FEATURES' },
          { key: 'experience', icon: <PeopleIcon size={22} />, value: main?.label ?? 'AT REVIEW', label: 'EXPERIENCE' },
          { key: 'pace', icon: <BoltIcon size={22} />, value: pace?.label ?? 'NOT CHOSEN', label: 'PRODUCTION' },
        ]}
      />
    </>
  );
}

/* ─────────────────────────────── 02 STRUCTURE ─────────────────────────────── */

const COMMERCIAL_LINES = ['COMMERCE', 'PLATFORM', 'PLATFORM_USAGE', 'PAYMENT_PROCESSING', 'ONGOING_SUPPORT'];

/** "ARCHITECTURAL MINIMAL · FULL EDITION" → "ARCHITECTURAL MINIMAL": the edition is a scope detail, not a direction. */
function visualSystemName(value: string | null): string | null {
  return value ? value.split(' · ')[0].toUpperCase() : null;
}

function StructureTab({ session, goToRoom }: Props) {
  const { state, snapshot } = session.view;
  const selection = snapshot.selection;
  const build = buildTypeSummary(state.placePath, selection);
  const custom = state.placePath === 'CUSTOM';
  const spec = buildSpec(state);
  const view = useMemo(() => structureView(selection), [selection]);
  const feel = state.feelVibe ? FEEL_BY_ID[state.feelVibe] : null;
  const pace = PACE_OPTIONS.find((p) => p.id === state.pace);
  const lines = snapshot.blueprint.lines.filter((line) => !COMMERCIAL_LINES.includes(line.key));
  const system = visualSystemName(lines.find((line) => line.key === 'EXPRESSION')?.value ?? null);
  const designDetails = useMemo(() => resolveDesignDetails(selection), [selection]);
  const conflicts = useMemo(() => designConflicts(selection), [selection]);
  const anatomy = useMemo(() => blueprintAnatomy(spec, snapshot), [spec, snapshot]);
  const thumbs = useMemo(
    () => Object.fromEntries(view.groups.map((g) => [g.key, partStill(spec, g.key, structurePartElements(anatomy, g.key))])),
    [view.groups, spec, anatomy],
  );
  return (
    <>
      <TabHead
        title="HOW YOUR DIGITAL LOCATION IS ORGANIZED."
        lede={
          view.groups.find((g) => g.key === 'CLIENT_SPACE')?.present
            ? 'YOUR BUILD BRINGS TOGETHER THE PUBLIC PRESENCE PEOPLE MEET FIRST, THE ACTIONS YOU WANT THEM TO TAKE, AND THE PRIVATE SPACES USED TO MANAGE WORK BEHIND THE SCENES.'
            : 'YOUR BUILD BRINGS TOGETHER THE PUBLIC PRESENCE PEOPLE MEET FIRST AND THE ACTIONS YOU WANT THEM TO TAKE.'
        }
      />
      <ul className="bs-parts">
        {view.groups.map((g) => (
          <li key={g.key} className={`bs-part${g.present ? '' : ' is-absent'}`}>
            <BuildThumbnail composition={thumbs[g.key]} width={120} height={104} alt="" />
            <div className="bs-part__text">
              <h3 className="bs-part__title">{g.title}</h3>
              <p className="bs-part__plain">
                <BsBody>{g.present ? g.plain : g.absent}</BsBody>
              </p>
              {g.present ? (
                <Disclose title="WHAT IS HERE">
                  <p className="bs-part__includes">{g.includes.join(' · ')}</p>
                </Disclose>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      <h3 className="bs-section">AT A GLANCE</h3>
      <Glance
        items={[
          { key: 'build', icon: <CubeIcon size={22} />, value: `${build.label} BUILD`, label: 'BUILD TYPE' },
          { key: 'system', icon: <LayersIcon size={22} />, value: system ?? feel?.label ?? 'AT REVIEW', label: 'VISUAL SYSTEM' },
          { key: 'access', icon: <PeopleIcon size={22} />, value: view.access, label: 'ACCESS MODEL' },
          { key: 'pace', icon: <StandardIcon size={22} />, value: pace?.label ?? 'NOT CHOSEN', label: 'PRODUCTION PACE' },
        ]}
      />
      <h3 className="bs-section">HOW IT FLOWS</h3>
      <ol className="bs-flowsteps">
        {view.flow.map((step) => (
          <li key={step.n}>
            <span className="bs-flowsteps__n">{step.n}</span>
            <span className="bs-flowsteps__text">
              <span className="bs-flowsteps__title">{step.title}</span>
              <span className="bs-flowsteps__plain">
                <BsBody>{step.plain}</BsBody>
              </span>
            </span>
          </li>
        ))}
      </ol>
      <Disclose title={`WHY THIS IS ${/^[AEIOU]/.test(build.label) ? 'AN' : 'A'} ${build.label} BUILD`}>
        {build.reasons.length ? (
          <ul className="bs-bullets">
            {build.reasons.map((reason) => (
              <li key={reason}>
                <BsBody>{reason.toUpperCase()}</BsBody>
              </li>
            ))}
          </ul>
        ) : (
          <p className="bs-sheet__hint">EVERY CHOICE FITS A SIMPLE BUILD.</p>
        )}
      </Disclose>
      <Disclose title="DESIGN DETAILS">
        <dl className="bs-lines bs-lines--compact">
          {designDetails.map((line) => (
            <div key={line.key} className={`bs-line${line.value ? '' : ' is-open'}`}>
              <dt>{line.label}</dt>
              <dd>
                {line.value ?? (custom ? 'DEFINED WITH SITE 00 IN YOUR CUSTOM DIRECTION' : 'NOT CHOSEN YET')}
                <span className="bs-line__provenance"> · {line.provenanceLabel}</span>
              </dd>
            </div>
          ))}
        </dl>
        <ul className="bs-bullets bs-bullets--compact">
          {designDetails.map((line) => (
            <li key={`${line.key}-fit`}>
              <BsBody>
                {line.label}: {line.fitNote}
              </BsBody>
            </li>
          ))}
        </ul>
        {conflicts.length ? (
          <div className="bs-sheet__hint">
            {conflicts.map((c) => (
              <p key={c.dimension}>
                <BsBody>
                  {c.message} {c.recommendation}
                </BsBody>
              </p>
            ))}
          </div>
        ) : feel ? (
          <p className="bs-sheet__hint">
            <BsBody>RECOMMENDATIONS FOLLOW YOUR {feel.label} DIRECTION UNTIL YOU SET A DIMENSION EXPLICITLY.</BsBody>
          </p>
        ) : null}
      </Disclose>
      <ChangeLink session={session} room="place" goToRoom={goToRoom} />
    </>
  );
}

/* ─────────────────────────────── 03 PAGES ─────────────────────────────── */

function PagesTab({ session, goToRoom }: Props) {
  const { state, snapshot } = session.view;
  const spec = buildSpec(state);
  const view = useMemo(() => pagesView(snapshot.selection), [snapshot.selection]);
  const anatomy = useMemo(() => blueprintAnatomy(spec, snapshot), [spec, snapshot]);
  const thumbs = useMemo(
    () => Object.fromEntries(view.groups.map((g) => [g.key, partStill(spec, `pages-${g.key}`, pageGroupElements(anatomy, g.key))])),
    [view.groups, spec, anatomy],
  );
  if (state.placePath === 'WORLD') {
    return (
      <>
        <TabHead
          title="THE PLACES THAT SHAPE YOUR WORLD."
          lede="A WORLD IS DESIGNED AS PLACES, NOT PAGES. ITS PLACES, MOMENTS AND THINGS TO DO ARE SHAPED WITH YOU AT BLUEPRINT REVIEW."
        />
        <ChangeLink session={session} room="work" goToRoom={goToRoom} />
      </>
    );
  }
  return (
    <>
      <TabHead
        title="THE PAGES THAT SHAPE YOUR EXPERIENCE."
        lede={
          view.privatePages
            ? 'YOUR PAGES ARE GROUPED BY PURPOSE, SO YOU CAN SEE WHAT VISITORS, CLIENTS AND YOUR TEAM WILL USE.'
            : 'YOUR PAGES ARE GROUPED BY PURPOSE, SO YOU CAN SEE WHAT VISITORS WILL MEET AND USE.'
        }
      />
      <StatStrip
        items={[
          { key: 'total', icon: <DocumentIcon size={24} />, label: 'TOTAL PAGES', value: String(view.total) },
          { key: 'groups', icon: <GridIcon size={24} />, label: 'CORE GROUPS', value: String(view.coreGroups) },
          { key: 'private', icon: <LockIcon size={24} />, label: 'PRIVATE PAGES', value: String(view.privatePages) },
        ]}
      />
      <ul className="bs-pagegroups">
        {view.groups.map((group) => (
          <li key={group.key} className="bs-pagegroup">
            <div className="bs-pagegroup__head">
              <BuildThumbnail composition={thumbs[group.key]} width={120} height={96} alt="" />
              <div>
                <h3 className="bs-pagegroup__title">{group.title}</h3>
                <p className="bs-pagegroup__plain">
                  <BsBody>{group.plain}</BsBody>
                </p>
              </div>
            </div>
            <ul className="bs-pagelist">
              {group.pages.map((page) => (
                <li key={page.id}>
                  <details className="bs-pageitem">
                    <summary>
                      <span>{page.label}</span>
                      <ChevronSmallRightIcon size={9} />
                    </summary>
                    <p className="bs-pageitem__plain">
                      <BsBody>{page.plain}</BsBody>
                    </p>
                    <p className="bs-pageitem__plain">
                      <BsBody>{page.whyItMatters}</BsBody>
                    </p>
                    {page.depth ? (
                      <p className="bs-pageitem__depth">
                        <strong>{page.depth} DEPTH</strong> <BsBody>{page.depthPlain}</BsBody>
                      </p>
                    ) : null}
                    {page.featuresNote ? (
                      <p className="bs-pageitem__depth">
                        <BsBody>{page.featuresNote}</BsBody>
                      </p>
                    ) : null}
                    {page.limitation ? (
                      <p className="bs-pageitem__depth">
                        <BsBody>{page.limitation}</BsBody>
                      </p>
                    ) : null}
                  </details>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <aside className="bs-note">
        <DocumentIcon size={22} />
        <span>
          <span className="bs-note__title">PAGE NOTES</span>
          <BsBody>FINAL NAMING AND GROUPING ARE REFINED AT BLUEPRINT REVIEW. WHAT EACH PAGE IS FOR MATTERS MORE THAN ITS LABEL AT THIS STAGE.</BsBody>
        </span>
      </aside>
      <ChangeLink session={session} room="work" goToRoom={goToRoom} />
    </>
  );
}

/* ─────────────────────────────── 04 FEATURES ─────────────────────────────── */

const FLOW_ICON: Record<FlowKey, ReactNode> = {
  ATTRACT: <GlobeIcon size={22} />,
  ACT: <BagIcon size={22} />,
  DELIVER: <PersonIcon size={22} />,
  SYNC: <BarsIcon size={22} />,
};

function FeaturesTab({ session, goToRoom }: Props) {
  const { state, snapshot } = session.view;
  const estimate = snapshot.estimate;
  const view = useMemo(() => featuresView(snapshot.selection), [snapshot.selection]);
  const world = state.placePath === 'WORLD';
  return (
    <>
      <TabHead
        title="WHAT THIS BUILD WILL DO."
        lede="THE WORKING CAPABILITIES IN YOUR BUILD, AND WHAT EACH ONE DOES FOR YOUR BUSINESS."
      />
      <StatStrip
        items={[
          { key: 'count', icon: <GridIcon size={24} />, label: 'SELECTED FEATURES', value: String(view.count) },
          { key: 'access', icon: <PeopleIcon size={24} />, label: 'PUBLIC + PRIVATE', value: view.hasPrivate ? 'YES' : 'PUBLIC ONLY' },
          { key: 'payments', icon: <CardIcon size={24} />, label: 'PAYMENTS', value: view.payments ? 'INCLUDED' : 'NOT INCLUDED' },
        ]}
      />
      <ul className="bs-featcards">
        {view.items.map((item) => (
          <li key={item.id} className="bs-featcard">
            <FeatureGlyph icon={item.icon} />
            <span className="bs-featcard__text">
              <span className="bs-featcard__verb">{item.verb}</span>
              <span className="bs-featcard__plain">
                <BsBody>{item.plain}</BsBody>
              </span>
              {item.includedWith ? <span className="bs-featcard__with">{item.includedWith}</span> : null}
            </span>
          </li>
        ))}
      </ul>
      <p className="bs-also">
        <strong>IN EVERY BUILD</strong> {CORE_INCLUDED.map((c) => (world ? c.worldLabel : c.label)).join(' · ')}
      </p>
      {estimate?.platformUsage.applicable ? (
        <Disclose title={estimate.platformUsage.label}>
          <p className="bs-sheet__hint">
            <BsBody>{estimate.platformUsage.summary.toUpperCase()}</BsBody>
          </p>
          <p className="bs-sheet__hint">
            <BsBody>{estimate.platformUsage.learnHowThisWorks.body.toUpperCase()}</BsBody>
          </p>
        </Disclose>
      ) : null}
      <h3 className="bs-section">HOW FEATURES WORK TOGETHER</h3>
      <p className="bs-section__lede">
        <BsBody>YOUR FEATURES ARE NOT SEPARATE ADD-ONS. TOGETHER THEY SHAPE THE WHOLE EXPERIENCE, FROM FIRST VISIT TO PRIVATE FOLLOW-THROUGH.</BsBody>
      </p>
      <ol className="bs-flow">
        {view.flow.map((step) => (
          <li key={step.key}>
            {FLOW_ICON[step.key]}
            <span className="bs-flow__title">{step.title}</span>
            <span className="bs-flow__plain">
              <BsBody>{step.plain}</BsBody>
            </span>
            {step.features.length ? <span className="bs-flow__with">{step.features.join(' · ')}</span> : null}
          </li>
        ))}
      </ol>
      <ChangeLink session={session} room="work" goToRoom={goToRoom} />
    </>
  );
}

/* ─────────────────────────────── 05 TIMELINE ─────────────────────────────── */

const FACTOR_ICON: Record<string, ReactNode> = {
  APPROVALS: <DocumentIcon size={20} />,
  CONTENT: <ImageIcon size={20} />,
  TOOLS: <LinkIcon size={20} />,
  BRAND: <BadgeIcon size={20} />,
  SCOPE: <ArrowsIcon size={20} />,
};

function TimelineTab({ session, goToRoom }: Props) {
  const { state, snapshot } = session.view;
  const preview = session.preview;
  const estimate = snapshot.estimate;
  const pace = PACE_OPTIONS.find((p) => p.id === state.pace);
  const note = state.paceNotes.trim();
  const view = useMemo(() => (estimate ? timelineView(snapshot.selection) : null), [estimate, snapshot.selection]);
  const priority = estimate?.delivery.priority;
  const standardPace = PACE_OPTIONS.find((p) => p.id === 'STANDARD');
  const expeditedPace = PACE_OPTIONS.find((p) => p.id === 'EXPEDITED');
  return (
    <>
      <TabHead
        title="WHAT THE JOURNEY AHEAD LOOKS LIKE."
        lede="YOUR TIMELINE DEPENDS ON APPROVALS, CONTENT READINESS AND CONNECTED SYSTEMS. THIS IS THE WORKING RANGE AND THE PHASES AHEAD."
      />
      {estimate ? (
        <>
          <ul className={`bs-cadence${priority?.available ? '' : ' is-single'}`}>
            <li className={state.pace === 'STANDARD' ? 'is-chosen' : undefined}>
              <span className="bs-cadence__icon">
                <CalendarIcon size={22} />
              </span>
              <span className="bs-cadence__text">
                <span className="bs-cadence__label">
                  STANDARD{state.pace === 'STANDARD' ? <em>YOUR CHOICE</em> : null}
                </span>
                <EstimateFigure value={spacedRange(estimate.delivery.standard.window)} preview={preview} />
                <span className="bs-cadence__plain">
                  <BsBody>{standardPace?.plain.toUpperCase()}</BsBody>
                </span>
                {preview ? <span className="bs-cadence__money">{expandInvestment(estimate.delivery.standard.investment)}</span> : null}
              </span>
            </li>
            {priority?.available ? (
              <li className={state.pace === 'EXPEDITED' ? 'is-chosen' : undefined}>
                <span className="bs-cadence__icon">
                  <BoltIcon size={22} />
                </span>
                <span className="bs-cadence__text">
                  <span className="bs-cadence__label">
                    EXPEDITED{state.pace === 'EXPEDITED' ? <em>YOUR CHOICE</em> : null}
                  </span>
                  <EstimateFigure value={spacedRange(priority.window)} preview={preview} />
                  <span className="bs-cadence__plain">
                    <BsBody>{`A FASTER PATH: ${priority.sooner}.`}</BsBody>
                  </span>
                  {preview ? <span className="bs-cadence__money">{expandInvestment(priority.investment)}</span> : null}
                </span>
              </li>
            ) : null}
          </ul>
          {priority && !priority.available ? (
            <p className="bs-sheet__hint">
              <BsBody>
                {state.pace === 'EXPEDITED' ? 'EXPEDITED IS NOT OFFERED FOR THIS SCOPE. ' : ''}
                {priority.reason.toUpperCase()}
              </BsBody>
            </p>
          ) : null}
          {priority?.available ? (
            <Disclose title="WHY EXPEDITED IS NOT TWICE AS FAST">
              <p className="bs-sheet__hint">
                <BsBody>{priority.whyNotHalf.toUpperCase()}</BsBody>
              </p>
              {expeditedPace ? (
                <p className="bs-sheet__hint">
                  <BsBody>{expeditedPace.plain.toUpperCase()}</BsBody>
                </p>
              ) : null}
            </Disclose>
          ) : null}
          {state.pace === 'FLEXIBLE' ? (
            <p className="bs-sheet__hint">
              <BsBody>{pace?.plain.toUpperCase()}</BsBody>
            </p>
          ) : null}
          {view ? (
            <>
              <h3 className="bs-section">PHASES</h3>
              <ol className="bs-phases">
                {view.phases.map((phase) => (
                  <li key={phase.n}>
                    <details className="bs-phase">
                      <summary>
                        <span className="bs-phase__n">{phase.n}</span>
                        <span className="bs-phase__title">{phase.title}</span>
                        <span className="bs-phase__plain">
                          <BsBody>{phase.plain}</BsBody>
                        </span>
                        <ChevronSmallRightIcon size={9} />
                      </summary>
                      <dl className="bs-phase__body">
                        <div>
                          <dt>SITE 00</dt>
                          <dd>
                            <BsBody>{phase.siteDoes}</BsBody>
                          </dd>
                        </div>
                        <div>
                          <dt>YOU</dt>
                          <dd>
                            <BsBody>{phase.youDo}</BsBody>
                          </dd>
                        </div>
                      </dl>
                      <p className="bs-phase__tags">
                        {phase.needsYou ? <span>NEEDS YOUR INPUT</span> : <span>SITE 00 LEADS</span>}
                        {phase.runsAlongside ? <span>RUNS ALONGSIDE OTHER WORK</span> : <span>HAPPENS IN ORDER</span>}
                      </p>
                    </details>
                  </li>
                ))}
              </ol>
              <h3 className="bs-section">WHAT AFFECTS TIMING</h3>
              <ul className="bs-factors">
                {view.factors.map((factor) => (
                  <li key={factor.key}>
                    <span className="bs-factors__icon">{FACTOR_ICON[factor.key]}</span>
                    <span className="bs-factors__text">
                      <span className="bs-factors__title">{factor.title}</span>
                      <span className="bs-factors__plain">
                        <BsBody>{factor.plain}</BsBody>
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {estimate.dependencies.length ? (
            <Disclose title="WHAT HAS TO HAPPEN IN ORDER">
              <ul className="bs-bullets">
                {estimate.dependencies.map((d) => (
                  <li key={d}>
                    <BsBody>{d.toUpperCase()}</BsBody>
                  </li>
                ))}
              </ul>
            </Disclose>
          ) : null}
          <Disclose title="AFTER YOU SUBMIT">
            <ol className="bs-bullets">
              {estimate.whatHappensNext.map((step) => (
                <li key={step}>
                  <BsBody>{step.toUpperCase()}</BsBody>
                </li>
              ))}
            </ol>
          </Disclose>
          <p className="bs-fineprint">
            <BsBody>
              {estimate.timelineNote.toUpperCase()} {estimate.notAQuote.toUpperCase()} {estimate.reference.toUpperCase()}
            </BsBody>
          </p>
        </>
      ) : (
        <p className="bs-sheet__hint">YOUR TIMELINE AND INVESTMENT RANGE ARE SHARED AT BLUEPRINT REVIEW.</p>
      )}
      {note ? (
        <>
          <h3 className="bs-section">{state.placePath === 'CUSTOM' ? 'YOUR CUSTOM DIRECTION' : 'YOUR NOTE'}</h3>
          <p className="bs-sheet__hint bs-usertext">{note}</p>
        </>
      ) : null}
      <ChangeLink session={session} room="pace" goToRoom={goToRoom} />
    </>
  );
}

/* ─────────────────────────────── actions ─────────────────────────────── */

function ArrowGlyph() {
  return (
    <svg width="24" height="10" viewBox="0 0 28 12" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M1 6h25M21 1.5 26 6l-5 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** CTA wording for each stage. Never claims a state the record does not hold. */
function ctaFor(session: StudioSession): { label: string; arrow: boolean } {
  const { review, submitted, syncStatus } = session;
  if (syncStatus === 'submitting') return { label: 'SUBMITTING…', arrow: false };
  switch (review.stage) {
    case 'SUBMISSION_RECEIVED':
    case 'REVISION_SUBMITTED':
      return { label: `VERSION ${review.version ?? ''} SUBMITTED`.replace('  ', ' '), arrow: false };
    case 'UNDER_REVIEW':
      return { label: 'UNDER REVIEW', arrow: false };
    case 'ACCEPTED':
      return { label: 'ACCEPTED', arrow: false };
    case 'CLOSED':
      return { label: 'CLOSED', arrow: false };
    case 'REVISION_REQUESTED':
      return { label: `RESUBMIT AS VERSION ${(submitted?.current.version ?? 0) + 1}`, arrow: true };
    default:
      return { label: 'CONFIRM & SUBMIT FOR REVIEW', arrow: true };
  }
}

/** Why SUBMIT is unavailable right now, in the client's words. Empty when it is available. */
export function submitBlockers(session: StudioSession): { text: string; room: StudioRoomId | null }[] {
  const out: { text: string; room: StudioRoomId | null }[] = [];
  const { snapshot, state } = session;
  const open = snapshot.blueprint.lines.filter((line) => line.open).map((line) => line.label);
  for (const code of snapshot.submission_blockers) {
    if (code === 'BLUEPRINT_INCOMPLETE') {
      if (snapshot.blueprint.decisions.length) continue; // shown as a decision with its own actions
      if (state.placePath === 'CUSTOM' && open.length) {
        out.push({
          text: `A CUSTOM DIRECTION CANNOT BE SUBMITTED FROM THE STUDIO YET: ${open.join(', ')} ARE DEFINED WITH SITE 00. YOUR BLUEPRINT STAYS SAVED.`,
          room: null,
        });
        continue;
      }
    }
    out.push(blockerCopy(code));
  }
  if (!session.serverIntakeId && session.syncStatus !== 'restoring') {
    out.push({ text: 'SITE 00 IS NOT REACHABLE. NOTHING CAN BE SUBMITTED YET. YOUR CHOICES ARE SAVED ON THIS DEVICE.', room: null });
  }
  return out;
}

export function BlueprintActions({ session, goToRoom }: Props) {
  const { snapshot, state, review, locked, update } = session;
  const [sheet, setSheet] = useState<'submit' | 'save' | null>(null);
  const decisions = locked ? [] : snapshot.blueprint.decisions;
  const blockers = locked ? [] : submitBlockers(session);
  const cta = ctaFor(session);
  const canSubmit = !locked && snapshot.submission_ready && Boolean(session.serverIntakeId) && session.syncStatus !== 'submitting';

  return (
    <>
      {decisions.length ? (
        <div className="bs-decision" role="alert">
          {decisions.map((d) => (
            <p key={d.id} className="bs-decision__text">
              <BsBody>{d.message.toUpperCase()}</BsBody>
            </p>
          ))}
          <div className="bs-decision__actions">
            {state.placePath === 'SIMPLE' ? (
              <button type="button" className="bs-btn bs-btn--small bs-btn--red" onClick={() => update({ placePath: 'ADVANCED' })}>
                KEEP IT · MOVE TO ADVANCED
              </button>
            ) : null}
            <button type="button" className="bs-btn bs-btn--small bs-btn--ghost" onClick={() => goToRoom('work')}>
              CHANGE MY CHOICES
            </button>
          </div>
        </div>
      ) : null}
      {blockers.length ? (
        <ul className="bs-blockers" aria-live="polite">
          {blockers.map((b) => (
            <li key={b.text}>
              <BsBody>{b.text}</BsBody>
              {b.room ? (
                <button type="button" className="bs-link" onClick={() => goToRoom(b.room!)}>
                  GO TO {b.room.toUpperCase()}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      <button type="button" className="bs-cta" disabled={!canSubmit} onClick={() => setSheet('submit')}>
        {cta.label}
        {cta.arrow ? <ArrowGlyph /> : null}
      </button>
      {!locked ? (
        <button type="button" className="bs-cta bs-cta--outline" onClick={() => setSheet('save')}>
          SAVE FOR LATER
        </button>
      ) : null}
      <p className="bs-status" aria-live="polite">
        <BsBody>
          {review.stage === 'DRAFT' || review.stage === 'REVISION_REQUESTED'
            ? session.indicator.detail ?? ''
            : 'SITE 00 REPLIES BY EMAIL. YOUR BLUEPRINT STAYS HERE, EXACTLY AS SUBMITTED.'}
        </BsBody>
      </p>
      {sheet === 'submit' ? <SubmitSheet session={session} onClose={() => setSheet(null)} /> : null}
      {sheet === 'save' ? <SaveSheet session={session} onClose={() => setSheet(null)} /> : null}
    </>
  );
}

/* ─────────────────────────────── sheets ─────────────────────────────── */

function useDialog(onClose: () => void) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return closeRef;
}

/** A guest needs an email on the intake so SITE 00 can reply and they can come back from any device. */
function needsEmail(session: StudioSession): boolean {
  const intake = session.serverIntake;
  if (!intake) return true;
  return intake.ownerKind !== 'AUTHENTICATED' && !intake.email;
}

function Summary({ state, snapshot, preview }: { state: SpatialBuilderState; snapshot: BlueprintSessionSnapshot; preview: boolean }) {
  const rows: [string, string][] = [
    ['PLACE', state.placePath ?? '—'],
    ['LEVEL', snapshot.scope.buildLevel],
    ['FEEL', state.feelVibe ? FEEL_BY_ID[state.feelVibe].label : '—'],
    ['WORK', state.workModules.join(' · ').replace(/_/g, ' ') || '—'],
    ['PACE', state.pace ?? '—'],
  ];
  if (preview && snapshot.estimate) {
    rows.push(['INITIAL RANGE', `${expandInvestment(snapshot.estimate.investment)} · ${spacedRange(snapshot.estimate.productionWindow)}`]);
  }
  return (
    <dl className="bs-lines bs-lines--compact">
      {rows.map(([k, v]) => (
        <div key={k} className="bs-line">
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function SubmitSheet({ session, onClose }: { session: StudioSession; onClose: () => void }) {
  const closeRef = useDialog(onClose);
  const titleId = useId();
  const [phase, setPhase] = useState<'confirm' | 'submitting' | 'received' | 'failed'>('confirm');
  const [received, setReceived] = useState<{ version: number; reference: string } | null>(null);
  const nextVersion = (session.submitted?.current.version ?? 0) + 1;
  const email = needsEmail(session);

  const submit = async () => {
    if (phase === 'submitting') return;
    setPhase('submitting');
    const result = await session.submitForReview();
    const confirmed = result && normalizeIntakeStatus(result.status) === 'SUBMITTED' ? spatialSubmission(result) : null;
    if (result && confirmed) {
      setReceived({ version: confirmed.current.version, reference: result.publicReference });
      setPhase('received');
    } else {
      setPhase('failed');
    }
  };

  return (
    <div className="bs-sheet-backdrop" role="presentation" onClick={phase === 'submitting' ? undefined : onClose}>
      <div className="bs-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} type="button" className="bs-dialog__close" onClick={onClose} aria-label="CLOSE" disabled={phase === 'submitting'}>
          <CloseIcon size={18} />
        </button>
        {phase === 'received' && received ? (
          <>
            <h2 id={titleId} className="bs-dialog__title">
              SUBMISSION RECEIVED<span className="bs-dot">.</span>
            </h2>
            <p className="bs-dialog__ref">
              {received.reference} · VERSION {received.version}
            </p>
            <p className="bs-dialog__text">
              <BsBody>
                AWAITING FOUNDER REVIEW. SITE 00 REVIEWS YOUR BLUEPRINT AND REPLIES BY EMAIL. NOTHING IS CHARGED AND THE RANGE IS NOT A QUOTE.
              </BsBody>
            </p>
            <button type="button" className="bs-cta" onClick={onClose}>
              VIEW MY BLUEPRINT
            </button>
          </>
        ) : (
          <>
            <h2 id={titleId} className="bs-dialog__title">
              {nextVersion > 1 ? `RESUBMIT AS VERSION ${nextVersion}` : 'SUBMIT YOUR BLUEPRINT'}
              <span className="bs-dot">.</span>
            </h2>
            <Summary state={session.state} snapshot={session.snapshot} preview={session.preview} />
            {nextVersion > 1 ? (
              <p className="bs-dialog__text">
                <BsBody>VERSION {nextVersion - 1} STAYS ON RECORD. SITE 00 SEES WHAT CHANGED.</BsBody>
              </p>
            ) : (
              <p className="bs-dialog__text">
                <BsBody>SITE 00 RECEIVES THIS EXACT VERSION WITH ITS INITIAL RANGE. THIS IS NOT A QUOTE.</BsBody>
              </p>
            )}
            {email ? (
              <div className="bs-dialog__email">
                <IntakeGuestAccessCapture intakeType="BUILDER" onRequestAccess={session.intakeSync.requestGuestAccess} alreadyIssued={false} />
              </div>
            ) : null}
            {phase === 'failed' ? (
              <p className="bs-dialog__error" role="alert">
                <BsBody>
                  NOT SUBMITTED. {(session.intakeSync.errorMessage ?? 'SITE 00 DID NOT CONFIRM THE SUBMISSION.').toUpperCase()}{' '}
                  {session.intakeSync.saveState === 'error' ? 'YOUR LATEST CHOICES ARE ON THIS DEVICE.' : 'YOUR DRAFT IS SAVED WITH SITE 00.'}
                </BsBody>
              </p>
            ) : null}
            <button type="button" className="bs-cta" disabled={email || phase === 'submitting'} onClick={() => void submit()}>
              {phase === 'submitting' ? 'SUBMITTING…' : phase === 'failed' ? 'TRY AGAIN' : nextVersion > 1 ? `SUBMIT VERSION ${nextVersion}` : 'SUBMIT FOR REVIEW'}
              {phase === 'submitting' ? null : <ArrowGlyph />}
            </button>
            {email ? (
              <p className="bs-dialog__text bs-dialog__text--small">
                <BsBody>ADD YOUR EMAIL ABOVE SO SITE 00 CAN REPLY.</BsBody>
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function SaveSheet({ session, onClose }: { session: StudioSession; onClose: () => void }) {
  const closeRef = useDialog(onClose);
  const titleId = useId();
  const [result, setResult] = useState<'saving' | 'saved' | 'local' | null>(null);
  useEffect(() => {
    let cancelled = false;
    setResult('saving');
    void session.retrySave().then((ok) => {
      if (!cancelled) setResult(ok ? 'saved' : 'local');
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one save per opening
  }, []);
  const time = session.intakeSync.lastSavedAt ? new Date(session.intakeSync.lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  return (
    <div className="bs-sheet-backdrop" role="presentation" onClick={onClose}>
      <div className="bs-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} type="button" className="bs-dialog__close" onClick={onClose} aria-label="CLOSE">
          <CloseIcon size={18} />
        </button>
        <h2 id={titleId} className="bs-dialog__title">
          {result === 'saved' ? 'SAVED' : result === 'local' ? 'LOCAL ONLY' : 'SAVING'}
          <span className="bs-dot">.</span>
        </h2>
        <p className="bs-dialog__text" aria-live="polite">
          <BsBody>
            {result === 'saved'
              ? `YOUR BLUEPRINT IS SAVED WITH SITE 00${time ? ` AT ${time}` : ''}. ${session.serverIntake?.publicReference ?? ''}`
              : result === 'local'
                ? `SITE 00 DID NOT CONFIRM THE SAVE. YOUR CHOICES ARE ON THIS DEVICE ONLY.${session.intakeSync.errorMessage ? ` ${session.intakeSync.errorMessage.toUpperCase()}` : ''}`
                : 'SAVING YOUR BLUEPRINT WITH SITE 00…'}
          </BsBody>
        </p>
        {result === 'saved' && needsEmail(session) ? (
          <div className="bs-dialog__email">
            <IntakeGuestAccessCapture intakeType="BUILDER" onRequestAccess={session.intakeSync.requestGuestAccess} alreadyIssued={false} />
          </div>
        ) : null}
        <button type="button" className="bs-cta" onClick={onClose}>
          DONE
        </button>
      </div>
    </div>
  );
}
