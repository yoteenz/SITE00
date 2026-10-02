import { useMemo, useState } from 'react';
import { HubEmpty, HubSearch, HubTabs, HubTile, HubTileGrid, PublicHubPage } from '../components/public-redesign/PublicHubLayouts';
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
    <PublicHubPage
      section="idnty"
      page="journal"
      crumb="LOCATION / JOURNAL"
      title="JOURNAL"
      subtitle="SITE 00 TRANSMISSIONS — BUILD LOGS, FIELD NOTES, AND SYSTEM UPDATES."
      width="wide"
    >
      <div className="s00pr-hubtoolbar">
        <HubTabs tabs={TABS} active={category} onChange={setCategory} label="FILTER TRANSMISSIONS" />
        <HubSearch value={query} onChange={setQuery} placeholder="SEARCH TRANSMISSIONS…" id="journal-search" />
      </div>
      {articles.length === 0 ? (
        <HubEmpty title="NO TRANSMISSIONS YET" body="JOURNAL ENTRIES WILL APPEAR HERE WHEN PUBLISHED." />
      ) : (
        <HubTileGrid columns={3}>
          {articles.map((article) => (
            <HubTile key={article.id} code={article.date} title={article.title} description={article.excerpt} cta="READ MORE →" to={`/journal/${article.id}`} />
          ))}
        </HubTileGrid>
      )}
    </PublicHubPage>
  );
}
