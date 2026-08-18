import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Site00PublicShell } from '../components/shell/Site00PublicShell';
import { BracketHeading, EmptyState, FilterTabs, PageIntro, SearchField } from '../components/pages/Site00PagePrimitives';
import { SITE00_JOURNAL_CATEGORIES, SITE00_JOURNAL_SEED } from '../config/seed/site00-page-seed';

const TABS = SITE00_JOURNAL_CATEGORIES.map((c) => ({ id: c.toLowerCase(), label: c }));

export default function JournalPage() {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');

  const articles = useMemo(() => {
    let list = SITE00_JOURNAL_SEED;
    if (category !== 'all') {
      list = list.filter((a) => a.category.toLowerCase() === category);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q));
    }
    return list;
  }, [category, query]);

  return (
    <Site00PublicShell>
      <div className="site00-page site00-page--journal">
        <PageIntro
          title={<BracketHeading>JOURNAL</BracketHeading>}
          subtitle="SITE 00 TRANSMISSIONS — BUILD LOGS, FIELD NOTES, AND SYSTEM UPDATES."
        />
        <div className="site00-page-toolbar">
          <FilterTabs tabs={TABS} active={category} onChange={setCategory} />
          <SearchField value={query} onChange={setQuery} placeholder="SEARCH TRANSMISSIONS…" id="journal-search" />
        </div>
        {articles.length === 0 ? (
          <EmptyState title="NO TRANSMISSIONS YET" body="JOURNAL ENTRIES WILL APPEAR HERE WHEN PUBLISHED." />
        ) : (
          <div className="site00-journal-grid">
            {articles.map((article) => (
              <article key={article.id} className="site00-journal-card">
                <div className="site00-journal-card__image" aria-hidden="true" />
                <div className="site00-journal-card__body">
                  <p className="site00-journal-card__date">{article.date}</p>
                  <h2 className="site00-journal-card__title">{article.title}</h2>
                  <p className="site00-journal-card__excerpt">{article.excerpt}</p>
                  <Link to={`/journal/${article.id}`} className="site00-link-red">
                    READ MORE →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Site00PublicShell>
  );
}
