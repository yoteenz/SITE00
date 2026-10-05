import { useSearchParams } from 'react-router-dom';
import {
  BUILDER_CENTER_COPY,
  BUILDER_PANELS,
  BUILDER_PANEL_ORDER,
  BUILDER_PATH_CARDS,
  BUILDER_PATH_DESTINATIONS,
  EVOLVE_CENTER_COPY,
  EVOLVE_PANELS,
  EVOLVE_PATH_ORDER,
  type BuilderPanelId,
} from '../../config/public-redesign-content';
import type { EvolvePathId } from '../../config/evolve';
import { SITE00_ROUTES } from '../../config/routes';
import { resolveEvolveAssessmentDestination } from '../../config/evolve-diagnostic';
import { useBldrAssessment } from '../../hooks/useBldrAssessment';
import { useEvolveAssessment } from '../../hooks/useEvolveAssessment';
import { useSite00 } from '../../state/Site00Context';
import { BuilderTower, EvolveProperty, FrameworkGlyph, PathLattice } from './ServiceMachines';
import { PublicServiceCenter, PublicServicePathPanel } from './PublicServiceLayouts';
import { SectionHead } from './PublicOrigin';

const BUILDER_PATH_HREF = (id: BuilderPanelId) => `${SITE00_ROUTES.bldrState}?path=${id}`;
const EVOLVE_PATH_HREF = (id: EvolvePathId) => `${SITE00_ROUTES.evolveState}?path=${id}`;

/** BUILDER class id (context + assessment slug) for each authority path. */
const BUILDER_CLASS_FOR_PATH = {
  site: 'site',
  world: 'world',
  systems: 'enterprise',
  extensions: 'not-sure',
} as const;

const BUILDER_LATTICE: Record<BuilderPanelId, 'cube' | 'building' | 'terrace' | 'stack' | 'slabs'> = {
  overview: 'cube',
  site: 'building',
  world: 'terrace',
  systems: 'stack',
  extensions: 'slabs',
};

/**
 * /bldr/state — BUILDER command center (no ?path) or one of its five panels (?path=…).
 * Hierarchy kept: COMMAND CENTER → SITE → WORLD → SYSTEMS → EXTENSIONS.
 */
export function BuilderStateExperience() {
  const [params] = useSearchParams();
  const requested = params.get('path');
  const panelId = (BUILDER_PANEL_ORDER as string[]).includes(requested ?? '') ? (requested as BuilderPanelId) : null;
  const { selectBuildClass } = useSite00();
  const { hasResume, resumeTarget, record } = useBldrAssessment();

  if (!panelId) {
    return (
      <PublicServiceCenter
        section="bldr"
        authorityId="01_BLDR_COMMAND_CENTER"
        envSlotId="ENV.BLDR.COMMAND_CENTER"
        crumb={BUILDER_CENTER_COPY.crumb}
        titleLines={BUILDER_CENTER_COPY.title}
        questionLines={BUILDER_CENTER_COPY.question}
        body={BUILDER_CENTER_COPY.body}
        sideTop={BUILDER_CENTER_COPY.sideTop}
        sideMid={BUILDER_CENTER_COPY.sideMid}
        machineSlotId="MACHINE.BLDR.TOWER"
        machine={<BuilderTower className="s00pr-svcstage__svg" />}
        chooseLabel={BUILDER_CENTER_COPY.choose}
        viewLabel={BUILDER_CENTER_COPY.viewFramework}
        viewHref={BUILDER_PATH_HREF('overview')}
        resume={
          hasResume && resumeTarget
            ? {
                href: resumeTarget,
                label: record.buildClass ? `CONTINUE BUILD — ${record.buildClass.replace(/-/g, ' ')}` : 'CONTINUE YOUR BUILD',
              }
            : null
        }
        cards={BUILDER_PATH_CARDS.map((card) => ({
          ...card,
          href: BUILDER_PATH_HREF(card.id),
          onSelect: () => selectBuildClass(BUILDER_CLASS_FOR_PATH[card.id]),
        }))}
        notSure={{
          title: BUILDER_CENTER_COPY.notSure,
          body: BUILDER_CENTER_COPY.notSureBody,
          cta: BUILDER_CENTER_COPY.assessmentCta,
          href: '/bldr/not-sure',
        }}
      />
    );
  }

  const copy = BUILDER_PANELS[panelId];
  const destination = BUILDER_PATH_DESTINATIONS[panelId];
  const isOverview = panelId === 'overview';
  const pathIndex = ['overview', 'site', 'world', 'systems', 'extensions'].indexOf(panelId);

  return (
    <PublicServicePathPanel
      section="bldr"
      authorityId={['02_BLDR_OVERVIEW', '03_BLDR_SITE', '04_BLDR_WORLD', '05_BLDR_SYSTEMS', '06_BLDR_EXTENSIONS'][pathIndex]}
      envSlotId={`ENV.BLDR.PATH.${panelId.toUpperCase()}`}
      hero={{
        eyebrow: 'SITE 00',
        title: 'BUILDER',
        sub: 'CREATE DIGITAL PLACES THAT SCALE.',
        list: ['IDEAS', 'STRUCTURE', 'SYSTEMS', 'EXPERIENCES', 'AND BEYOND.'],
      }}
      panel={{
        code: copy.code,
        title: copy.title,
        tagline: copy.tagline,
        artSlotId: `ILLUSTRATION.BLDR.PATH.PANEL.${panelId.toUpperCase()}`,
        art: <PathLattice variant={BUILDER_LATTICE[panelId]} className="s00pr-pathpanel__art-svg" />,
        index:
          panelId === 'site'
            ? undefined
            : {
                total: 4,
                active: panelId === 'overview' ? 0 : pathIndex - 1,
                label: `BUILDER PATH ${panelId === 'overview' ? 1 : pathIndex} / 4`,
                links: (['site', 'world', 'systems', 'extensions'] as const).map((id) => ({ label: id.toUpperCase(), href: BUILDER_PATH_HREF(id) })),
              },
        closeHref: panelId === 'site' ? SITE00_ROUTES.bldrState : undefined,
        sideIndex: isOverview
          ? BUILDER_PANEL_ORDER.map((id) => ({ label: BUILDER_PANELS[id].title, href: BUILDER_PATH_HREF(id), active: id === panelId }))
          : undefined,
        sideNote: isOverview ? undefined : sideNoteLines(copy.sideNote),
      }}
      backHref={SITE00_ROUTES.bldrState}
      cta={{
        label: copy.cta,
        href: destination.href,
        onClick: () => selectBuildClass(BUILDER_CLASS_FOR_PATH[panelId === 'overview' ? 'site' : panelId]),
        note: destination.waiting
          ? 'EXTENSIONS HAS NO DEDICATED ASSESSMENT YET — THIS STARTS BUILDER DISCOVERY.'
          : undefined,
      }}
    >
      <SectionHead>OVERVIEW</SectionHead>
      <p className="s00pr-opanel__text">{copy.overview}</p>

      <SectionHead>{copy.itemsHeading}</SectionHead>
      {isOverview ? (
        <ol className="s00pr-define s00pr-define--paths">
          {copy.items.map((item, index) => {
            const [tagline, lines] = item.description.split('|');
            return (
              <li key={item.title}>
                <span className="s00pr-define__body">
                  <b>
                    0{index + 1} {item.title}
                  </b>
                  <span className="s00pr-define__tag">{tagline}</span>
                  <span>{lines}</span>
                </span>
              </li>
            );
          })}
        </ol>
      ) : (
        <ul className="s00pr-define s00pr-define--items">
          {copy.items.map((item) => (
            <li key={item.title}>
              <span className="s00pr-define__plus" aria-hidden="true">
                +
              </span>
              <span className="s00pr-define__body">
                <b>{item.title}</b>
                <span>{item.description}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <SectionHead>{copy.frameworkHeading}</SectionHead>
      <ol className="s00pr-framework">
        {copy.framework.map((step, index) => (
          <li key={step.title}>
            <span className="s00pr-framework__n">0{index + 1}</span>
            <FrameworkGlyph index={index} className="s00pr-framework__glyph" />
            <span className="s00pr-framework__title">{step.title}</span>
            <span className="s00pr-framework__desc">{step.description}</span>
          </li>
        ))}
      </ol>
    </PublicServicePathPanel>
  );
}

/** Margin note as a short stacked list. */
function sideNoteLines(note: string): string[] {
  return note.replace(/\.$/, '').split(' ').reduce<string[]>((lines, word) => {
    const last = lines[lines.length - 1];
    if (last !== undefined && (last + ' ' + word).length <= 16) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
    return lines;
  }, []);
}

/* ------------------------------------------------------------------- EVOLVE */

const EVOLVE_LATTICE: Record<EvolvePathId, 'orbit' | 'layers' | 'star'> = {
  refine: 'orbit',
  install: 'layers',
  transform: 'star',
};

/**
 * /evolve/state — EVOLVE intervention center (no ?path) or one of exactly three panels.
 * PUBLIC EVOLVE is separate from IDNTY: no 00–03 states, no Build Ready. Exactly REFINE / INSTALL / TRANSFORM.
 */
export function EvolveStateExperience() {
  const [params] = useSearchParams();
  const requested = params.get('path');
  const pathId = (EVOLVE_PATH_ORDER as string[]).includes(requested ?? '') ? (requested as EvolvePathId) : null;
  const { selectEvolvePath } = useSite00();
  const { hasResume, resumeTarget, record } = useEvolveAssessment();

  if (!pathId) {
    return (
      <PublicServiceCenter
        section="evolve"
        authorityId="01_EVOLVE_INTERVENTION_CENTER"
        envSlotId="ENV.EVOLVE.INTERVENTION_CENTER"
        crumb={EVOLVE_CENTER_COPY.crumb}
        titleLines={EVOLVE_CENTER_COPY.title}
        questionLines={EVOLVE_CENTER_COPY.question}
        body={EVOLVE_CENTER_COPY.body}
        sideTop={EVOLVE_CENTER_COPY.side}
        machineSlotId="MACHINE.EVOLVE.PROPERTY_TOWER"
        machine={<EvolveProperty className="s00pr-svcstage__svg" />}
        layers={EVOLVE_CENTER_COPY.layers}
        resume={
          hasResume && resumeTarget
            ? { href: resumeTarget, label: `RESUME EVOLVE — ${record.evolvePath?.replace(/-/g, ' ') ?? ''}` }
            : null
        }
        chooseLabel={EVOLVE_CENTER_COPY.choose}
        viewLabel={EVOLVE_CENTER_COPY.viewApproach}
        viewHref={EVOLVE_CENTER_COPY.assessmentHref}
        cards={EVOLVE_CENTER_COPY.cards.map((card) => ({
          ...card,
          href: EVOLVE_PATH_HREF(card.id),
          onSelect: () => selectEvolvePath(card.id),
        }))}
        notSure={{
          title: EVOLVE_CENTER_COPY.notSure,
          body: EVOLVE_CENTER_COPY.notSureBody,
          cta: EVOLVE_CENTER_COPY.assessmentCta,
          href: EVOLVE_CENTER_COPY.assessmentHref,
        }}
      />
    );
  }

  const copy = EVOLVE_PANELS[pathId];
  const index = EVOLVE_PATH_ORDER.indexOf(pathId);

  return (
    <PublicServicePathPanel
      section="evolve"
      authorityId={['02_EVOLVE_REFINE', '03_EVOLVE_INSTALL', '04_EVOLVE_TRANSFORM'][index]}
      envSlotId={`ENV.EVOLVE.PATH.${pathId.toUpperCase()}`}
      hero={{
        eyebrow: 'SITE 00',
        title: 'EVOLVE',
        sub: 'ENHANCE. INTEGRATE. TRANSFORM WHAT EXISTS.',
        list: copy.sideLeft,
        sideRight: copy.sideRight,
      }}
      panel={{
        code: copy.code,
        title: copy.title,
        tagline: copy.tagline,
        artSlotId: `ILLUSTRATION.EVOLVE.PATH.PANEL.${pathId.toUpperCase()}`,
        art: <PathLattice variant={EVOLVE_LATTICE[pathId]} className="s00pr-pathpanel__art-svg" />,
        index: {
          total: 3,
          active: index,
          label: `EVOLVE PATH ${index + 1} / 3`,
          links: EVOLVE_PATH_ORDER.map((id) => ({ label: id.toUpperCase(), href: EVOLVE_PATH_HREF(id) })),
        },
      }}
      backHref={SITE00_ROUTES.evolveState}
      cta={{
        label: copy.cta,
        href: resolveEvolveAssessmentDestination(pathId, false),
        onClick: () => selectEvolvePath(pathId),
      }}
    >
      <SectionHead>OVERVIEW</SectionHead>
      <p className="s00pr-opanel__text">{copy.overview}</p>

      <div className="s00pr-triple">
        <section>
          <h3 className="s00pr-triple__head">INCLUDES</h3>
          <ul>
            {copy.includes.map((item) => (
              <li key={item}>
                <span className="s00pr-triple__plus" aria-hidden="true">
                  +
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="s00pr-triple__head">IDEAL FOR</h3>
          <ul>
            {copy.idealFor.map((item) => (
              <li key={item}>
                <span className="s00pr-triple__ring" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="s00pr-triple__head">DELIVERABLES</h3>
          <ul>
            {copy.deliverables.map((item) => (
              <li key={item}>
                <span className="s00pr-triple__plus" aria-hidden="true">
                  +
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="s00pr-facts">
        <div className="s00pr-facts__cell">
          <h3 className="s00pr-facts__head">TIMELINE</h3>
          <div className="s00pr-facts__row">
            <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="#e8192c" strokeWidth="1.4" aria-hidden="true">
              <circle cx="16" cy="16" r="12" />
              <path d="M16 8v8l-5 3" />
            </svg>
            <div>
              <p className="s00pr-facts__value">{copy.timeline}</p>
              <p className="s00pr-facts__sub">TYPICAL ENGAGEMENT</p>
            </div>
          </div>
        </div>
        <span className="s00pr-facts__vr" aria-hidden="true" />
        <div className="s00pr-facts__cell">
          <h3 className="s00pr-facts__head">INVESTMENT</h3>
          <div className="s00pr-facts__row">
            <svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="#e8192c" strokeWidth="1.4" aria-hidden="true">
              <path d="m16 5 12 6-12 6-12-6zM4 16l12 6 12-6M4 21l12 6 12-6" />
            </svg>
            <div>
              <p className="s00pr-facts__value">{copy.investment}</p>
              <p className="s00pr-facts__sub">PROJECT DEPENDENT</p>
            </div>
          </div>
        </div>
      </div>
    </PublicServicePathPanel>
  );
}
