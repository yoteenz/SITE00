import { SITE00_DIRECTORY_SECTIONS, SITE00_ENTER_COPY } from '../../config/directory';
import { Site00SummaryStripText } from '../shell/Site00SummaryStripText';
import { ArchitecturalPanel } from '../panels/ArchitecturalPanel';
import { SectionRule } from '../panels/SectionRule';
import { DirectoryRow } from '../workflow/WorkflowCards';

export function DirectoryPanel() {
  return (
    <div className="site00-enter-layout">
      <div className="site00-enter-welcome">
        <span className="site00-label-red">{SITE00_ENTER_COPY.welcomeNumber}</span>
        <h1 className="site00-heading-lg site00-enter-welcome__title">{SITE00_ENTER_COPY.welcomeTitle}</h1>
        <div className="site00-enter-welcome__rule">
          <SectionRule />
        </div>
        <p className="site00-tagline site00-enter-welcome__subtitle">{SITE00_ENTER_COPY.welcomeSubtitle}</p>
        <p className="site00-body site00-enter-welcome__body">{SITE00_ENTER_COPY.welcomeBody}</p>
      </div>

      <ArchitecturalPanel className="site00-enter-menu">
        <div className="site00-enter-menu__scroll">
          {SITE00_DIRECTORY_SECTIONS.map((section, idx) => (
            <div key={section.id} className={idx === 0 ? 'site00-enter-menu__section' : undefined}>
              <p className="site00-label-red site00-enter-menu__heading">{section.heading}</p>
              <nav aria-label={section.heading}>
                {section.rows.map((row) => (
                  <DirectoryRow
                    key={row.id}
                    number={row.number}
                    title={row.title}
                    description={row.description}
                    href={row.href}
                    enabled={row.enabled}
                    enterIcon={row.enterIcon}
                  />
                ))}
              </nav>
              {idx === 0 ? (
                <div className="site00-enter-menu__divider">
                  <SectionRule />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </ArchitecturalPanel>
    </div>
  );
}

export function EnterStatusStrip() {
  return (
    <footer className="site00-summary-strip-panel site00-enter-status-strip">
      <Site00SummaryStripText text={SITE00_ENTER_COPY.statusStrip} />
    </footer>
  );
}
