import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Site00PublicShell } from '../../components/shell/Site00PublicShell';
import { EmptyState, FilterTabs, PageIntro, SearchField } from '../../components/pages/Site00PagePrimitives';
import { SITE00_TEMPLATE_CATEGORIES, SITE00_TEMPLATES_SEED } from '../../config/seed/site00-page-seed';
import { Site00LayersIcon } from '../../icons/Site00HubIcons';
import { SITE00_ROUTES } from '../../config/routes';

const TABS = SITE00_TEMPLATE_CATEGORIES.map((c) => ({ id: c.toLowerCase(), label: c }));

export default function BldrTemplatesPage() {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');

  const templates = useMemo(() => {
    let list = SITE00_TEMPLATES_SEED;
    if (category !== 'all') {
      list = list.filter((t) => t.category.toLowerCase() === category);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q));
    }
    return list;
  }, [category, query]);

  return (
    <Site00PublicShell mobileActiveNav="build">
      <div className="site00-page site00-page--templates">
        <Link to={SITE00_ROUTES.bldr} className="site00-back-link">
          ← BACK
        </Link>
        <header className="site00-detail-hero">
          <Site00LayersIcon size={32} />
          <PageIntro
            title={<h1 className="site00-detail-title">TEMPLATES</h1>}
            subtitle="CHOOSE FROM PRE-BUILT TEMPLATES AND BLUEPRINTS."
          />
        </header>
        <div className="site00-page-toolbar">
          <SearchField value={query} onChange={setQuery} placeholder="SEARCH TEMPLATES…" id="templates-search" />
          <FilterTabs tabs={TABS} active={category} onChange={setCategory} />
        </div>
        {templates.length === 0 ? (
          <EmptyState title="NO TEMPLATES YET" body="TEMPLATE LIBRARY WILL POPULATE AS BLUEPRINTS ARE APPROVED." />
        ) : (
          <div className="site00-templates-list">
            {templates.map((tpl) => (
              <article key={tpl.id} className="site00-template-card">
                <div className="site00-template-card__thumb" />
                <div>
                  <p className="site00-label-red">{tpl.category}</p>
                  <h2 className="site00-template-card__title">{tpl.name}</h2>
                  <p className="site00-template-card__desc">{tpl.description}</p>
                  <Link to={SITE00_ROUTES.bldrState} className="site00-link-red">
                    VIEW TEMPLATE →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
        <section className="site00-page-banner">
          <p className="site00-label-red">CAN&apos;T FIND WHAT YOU NEED?</p>
          <Link to={SITE00_ROUTES.support} className="site00-link-red">
            CONTACT SUPPORT →
          </Link>
        </section>
      </div>
    </Site00PublicShell>
  );
}
