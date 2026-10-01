import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AssetSlot } from './AssetSlot';
import { PublicCornerBrackets, PublicDiamond } from './IdentityDiagnosticChrome';
import { PublicRedesignShell, type PublicRedesignSection } from './PublicRedesignShell';
import { SpatialEnvironmentFrame } from './SpatialEnvironmentFrame';

function Arrow({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 20 12" width={size} height={size * 0.6} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 6h17M13 1l5 5-5 5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ center */

export type ServiceCard = {
  id: string;
  code: string;
  title: string;
  tagline: string;
  lines: readonly string[];
  cta: string;
  slotId: string;
  href: string;
  onSelect?: () => void;
};

type PublicServiceCenterProps = {
  section: Extract<PublicRedesignSection, 'bldr' | 'evolve'>;
  authorityId: string;
  envSlotId: string;
  crumb: string;
  titleLines: readonly string[];
  questionLines: readonly string[];
  body: string;
  sideTop: string;
  sideMid?: string;
  machineSlotId: string;
  machine: ReactNode;
  /** EVOLVE: labelled layers alongside the machine. */
  layers?: readonly { code: string; label: string }[];
  chooseLabel: string;
  viewLabel: string;
  viewHref: string;
  cards: ServiceCard[];
  notSure: { title: string; body: string; cta: string; href: string };
  resume?: { label: string; href: string } | null;
};

/** Parent "command / intervention center": hero + machine + the paths + an assessment fallback. */
export function PublicServiceCenter(props: PublicServiceCenterProps) {
  const { section } = props;
  return (
    <PublicRedesignShell
      section={section}
      authorityId={props.authorityId}
      className={`s00pr-shell--${section}`}
      environment={<SpatialEnvironmentFrame slotId={props.envSlotId} />}
    >
      <div className={`s00pr-svc s00pr-svc--${section}`} data-service-page={`${section}-center`}>
        <section className="s00pr-svchero" aria-label={props.titleLines.join(' ')}>
          <p className="s00pr-idhero__crumb">{props.crumb}</p>
          <h1 className="s00pr-svchero__title">
            {props.titleLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <span className="s00pr-idhero__rule" aria-hidden="true" />
          <p className="s00pr-idhero__question">
            {props.questionLines.map((line) => (
              <span key={line} className="s00pr-svchero__qline">
                {line}
              </span>
            ))}
          </p>
          <p className="s00pr-idhero__body">{props.body}</p>
          <aside className="s00pr-sidenote s00pr-sidenote--top" aria-hidden="true">
            <p>{props.sideTop}</p>
            <PublicDiamond />
          </aside>
          {props.sideMid ? (
            <aside className="s00pr-sidenote s00pr-sidenote--mid s00pr-sidenote--svc" aria-hidden="true">
              <p>{props.sideMid}</p>
              <PublicDiamond />
            </aside>
          ) : null}
        </section>

        <div className="s00pr-svcstage" data-machine={section}>
          <AssetSlot slotId={props.machineSlotId} className="s00pr-svcstage__slot" />
          <div className="s00pr-svcstage__machine">{props.machine}</div>
          {props.layers ? (
            <ol className="s00pr-svclayers" aria-hidden="true">
              {props.layers.map((layer) => (
                <li key={layer.code}>
                  <b>{layer.code}</b>
                  <span>{layer.label}</span>
                </li>
              ))}
            </ol>
          ) : null}
        </div>

        {props.resume ? (
          <div className="s00pr-resume">
            <p>{props.resume.label}</p>
            <Link to={props.resume.href}>CONTINUE →</Link>
          </div>
        ) : null}

        <div className="s00pr-svcchoose">
          <h2 className="s00pr-svcchoose__title">{props.chooseLabel}</h2>
          <span className="s00pr-svcchoose__rule" aria-hidden="true" />
          <Link to={props.viewHref} className="s00pr-svcchoose__link">
            <PublicDiamond />
            {props.viewLabel}
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <ul className={`s00pr-svccards s00pr-svccards--${props.cards.length}`}>
          {props.cards.map((card) => (
            <li key={card.id}>
              <Link to={card.href} className="s00pr-svccard" onClick={card.onSelect} aria-label={`${card.title} — ${card.tagline}`}>
                <span className="s00pr-svccard__code">{card.code}</span>
                <PublicCornerBrackets className="s00pr-svccard__corners" />
                <AssetSlot slotId={card.slotId} className="s00pr-svccard__slot" />
                <span className="s00pr-svccard__title">{card.title}</span>
                <span className="s00pr-svccard__tagline">{card.tagline}</span>
                <span className="s00pr-svccard__lines">
                  {card.lines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </span>
                <span className="s00pr-svccard__cta">
                  <span>{card.cta}</span>
                  <span className="s00pr-svccard__go" aria-hidden="true">
                    <Arrow size={14} />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <aside className="s00pr-svcnotsure" aria-label={props.notSure.title}>
          <svg className="s00pr-svcnotsure__glyph" viewBox="0 0 80 80" aria-hidden="true">
            <g fill="none" stroke="#1a1a1a" strokeOpacity="0.5" strokeWidth="0.8">
              <circle cx="40" cy="40" r="30" />
              <circle cx="40" cy="40" r="20" />
              <path d="M10 40h60M40 10v60" stroke="#e8192c" />
            </g>
            <circle cx="40" cy="40" r="9" fill="#e8192c" />
          </svg>
          <div className="s00pr-svcnotsure__copy">
            <p className="s00pr-svcnotsure__title">{props.notSure.title}</p>
            <p className="s00pr-svcnotsure__body">{props.notSure.body}</p>
          </div>
          <Link to={props.notSure.href} className="s00pr-svcnotsure__cta">
            <span>{props.notSure.cta}</span>
            <span className="s00pr-svcnotsure__go" aria-hidden="true">
              <Arrow size={14} />
            </span>
          </Link>
        </aside>
      </div>
    </PublicRedesignShell>
  );
}

/* ------------------------------------------------------------------- panel */

type PathIndex = { total: number; active: number; label: string; links: { label: string; href: string }[] };

type PublicServicePathPanelProps = {
  section: Extract<PublicRedesignSection, 'bldr' | 'evolve'>;
  authorityId: string;
  envSlotId: string;
  hero: { eyebrow: string; title: string; sub: string; list: readonly string[]; sideRight?: readonly string[] };
  panel: {
    code: string;
    title: string;
    tagline: string;
    artSlotId: string;
    art: ReactNode;
    /** Path index (dots + label). Omitted for the SITE panel, which shows CLOSE instead. */
    index?: PathIndex;
    closeHref?: string;
    sideIndex?: { label: string; href: string; active: boolean }[];
    sideNote?: readonly string[];
  };
  children: ReactNode;
  backHref: string;
  cta: { label: string; href: string; onClick?: () => void; note?: string };
};

/** The glass panel family shared by BLDR (OVERVIEW/SITE/WORLD/SYSTEMS/EXTENSIONS) and EVOLVE (REFINE/INSTALL/TRANSFORM). */
export function PublicServicePathPanel({ section, authorityId, envSlotId, hero, panel, children, backHref, cta }: PublicServicePathPanelProps) {
  return (
    <PublicRedesignShell
      section={section}
      headerVariant="wordmark"
      hideBottomNav
      authorityId={authorityId}
      className={`s00pr-shell--${section}-path`}
      environment={<SpatialEnvironmentFrame slotId={envSlotId} tone="daylight" extent="upper" />}
    >
      <div className={`s00pr-svc s00pr-svc--${section}-path`} data-service-page={`${section}-path`}>
        <section className="s00pr-pathhero" aria-label={`${hero.eyebrow} ${hero.title}`}>
          <p className="s00pr-pathhero__eyebrow">{hero.eyebrow}</p>
          <h1 className="s00pr-pathhero__title">{hero.title}</h1>
          <p className="s00pr-pathhero__sub">{hero.sub}</p>
          <ul className="s00pr-pathhero__list" aria-hidden="true">
            {hero.list.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {hero.sideRight && hero.sideRight.length > 0 ? (
            <ul className="s00pr-pathhero__right" aria-hidden="true">
              {hero.sideRight.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="s00pr-pathpanel" aria-label={`${panel.title} PANEL`}>
          <header className="s00pr-pathpanel__head">
            <div className="s00pr-pathpanel__titles">
              <p className="s00pr-pathpanel__code">{panel.code}</p>
              <span className="s00pr-opanel__tick" aria-hidden="true" />
              <h2 className="s00pr-pathpanel__title">{panel.title}</h2>
              <p className="s00pr-pathpanel__tagline">{panel.tagline}</p>
            </div>
            <AssetSlot slotId={panel.artSlotId} className="s00pr-pathpanel__art">
              {panel.art}
            </AssetSlot>
            {panel.sideIndex ? (
              <nav className="s00pr-pathpanel__index" aria-label="SECTIONS">
                {panel.sideIndex.map((item) => (
                  <Link key={item.label} to={item.href} aria-current={item.active ? 'page' : undefined} className={item.active ? 's00pr-pathpanel__index-on' : ''}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            ) : panel.sideNote ? (
              <ul className="s00pr-pathpanel__note" aria-hidden="true">
                {panel.sideNote.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : null}
            {panel.index ? (
              <div className="s00pr-pathpanel__pager">
                <span>{panel.index.label}</span>
                <span className="s00pr-pathpanel__dots">
                  {Array.from({ length: panel.index.total }, (_, i) => {
                    const link = panel.index!.links[i];
                    const on = i === panel.index!.active;
                    return link ? (
                      <Link key={i} to={link.href} aria-label={link.label} aria-current={on ? 'page' : undefined} className={`s00pr-pathpanel__dot ${on ? 's00pr-pathpanel__dot--on' : ''}`.trim()} />
                    ) : (
                      <span key={i} className={`s00pr-pathpanel__dot ${on ? 's00pr-pathpanel__dot--on' : ''}`.trim()} />
                    );
                  })}
                </span>
              </div>
            ) : null}
            {panel.closeHref ? (
              <Link to={panel.closeHref} className="s00pr-opanel__close s00pr-pathpanel__close" aria-label="CLOSE PANEL">
                <span>CLOSE</span>
                <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="m3 3 14 14M17 3 3 17" />
                </svg>
              </Link>
            ) : (
              <PublicCornerBrackets className="s00pr-pathpanel__corners" />
            )}
          </header>
          <div className="s00pr-pathpanel__body">{children}</div>
          <footer className="s00pr-opanel__foot">
            <Link to={backHref} className="s00pr-circlebtn" aria-label="BACK">
              <svg viewBox="0 0 20 12" width="20" height="12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 6H2M7 1 2 6l5 5" />
              </svg>
            </Link>
            <span className="s00pr-opanel__footlabel">BACK</span>
            <span className="s00pr-opanel__footvr" aria-hidden="true" />
            <Link to={cta.href} className="s00pr-opanel__cta s00pr-opanel__cta--link" onClick={cta.onClick}>
              <span>{cta.label}</span>
              <span className="s00pr-opanel__cta-go" aria-hidden="true">
                <Arrow size={18} />
              </span>
            </Link>
          </footer>
          {cta.note ? <p className="s00pr-pathpanel__waiting">{cta.note}</p> : null}
        </section>
      </div>
    </PublicRedesignShell>
  );
}
