import { SITE00_BLDR_ENTRY_COPY } from '../../config/bldr-entry';

/** Screen 02 page intro — WHAT ARE WE BUILDING? + CHOOSE A DIRECTION */
export function BldrEntryIntro() {
  const { headlineLine1, headlineLine2, subtitle } = SITE00_BLDR_ENTRY_COPY;

  return (
    <header className="site00-bldr-entry-intro">
      <h1 className="site00-bldr-entry-intro__title">
        {headlineLine1}
        <br />
        {headlineLine2}
      </h1>
      <span className="site00-bldr-entry-intro__accent" aria-hidden="true" />
      <p className="site00-bldr-entry-intro__subtitle">{subtitle}</p>
    </header>
  );
}
