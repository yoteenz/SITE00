/**
 * P0.VR.DESIGN.OPUS-PROJECT-TABS1 — REFERENCES as the project's library.
 *
 * The page workspace already owns the page's authority pair. This surface is
 * the other half: every reference the project holds, grouped into collections,
 * filterable, and readable as a contact sheet rather than a list of ids.
 *
 * Wide shell: collections rail | contact sheet | reference inspector.
 * Tall shell: the rail becomes a scroller, the inspector a detail block under
 * the sheet. Same data, same components, different assembly.
 */

import { useMemo, useState } from 'react';

import {
  buildProjectReferenceLibrary,
  type ProjectReferenceRecord,
} from '../../../../../../shared/site00-design-workspace-production/designProjectLibraries.js';
import { buildDesignProjectIntelligence } from '../../../../../../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { OverlayStatus } from '../designOverlayKit';
import {
  ProjectActionBar,
  ProjectCards,
  ProjectFacts,
  ProjectFeature,
  ProjectFilters,
  ProjectGroup,
  ProjectIdentity,
  ProjectInspector,
  ProjectPanes,
  ProjectRail,
  ProjectSearch,
  ProjectSurface,
  ProjectViewAll,
  useShellFormat,
} from '../designProjectSurfaceKit';
import { useDesignProductionNavigation } from '../useDesignProductionNavigation';
import { PsIconCompare, PsIconLink, PsIconSearch, PsIconUpload } from './projectTabIcons';

export function ProjectReferencesSurface() {
  const { projectSlug } = useDesignProductionNavigation();
  const format = useShellFormat();
  const library = useMemo(() => buildProjectReferenceLibrary(projectSlug), [projectSlug]);
  const intelligence = useMemo(() => buildDesignProjectIntelligence(projectSlug), [projectSlug]);

  const [collectionId, setCollectionId] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(library.featured?.referenceId ?? null);

  const scoped = useMemo(() => {
    const base =
      collectionId === 'all'
        ? library.all
        : library.all.filter((ref) => ref.collection === collectionId);
    const needle = query.trim().toLowerCase();
    if (!needle) return base;
    return base.filter((ref) =>
      `${ref.label} ${ref.route} ${ref.scope} ${ref.status}`.toLowerCase().includes(needle),
    );
  }, [collectionId, library.all, query]);

  const selected = library.all.find((ref) => ref.referenceId === selectedId) ?? scoped[0] ?? null;

  const railItems = [
    { id: 'all', label: 'ALL REFERENCES', count: library.total, src: library.featured?.src ?? null },
    ...library.collections.map((collection) => ({
      id: collection.id,
      label: collection.label,
      count: collection.references.length,
      src: collection.references[0]?.src ?? null,
    })),
  ];

  const sheet = (
    <>
      <ProjectSearch
        placeholder="Search references, keywords, or visual content…"
        value={query}
        onChange={setQuery}
        trailing={
          <span className="tod-ps-chip" data-active="false">
            {scoped.length} RESULTS
          </span>
        }
      />
      {format === 'tall' ? (
        <ProjectFilters
          chips={[
            { id: 'all', label: 'ALL', count: library.total },
            ...library.collections.map((collection) => ({
              id: collection.id,
              label: collection.label.split(' / ')[0],
              count: collection.references.length,
            })),
          ]}
          activeId={collectionId}
          onPick={setCollectionId}
        />
      ) : null}

      {library.featured && collectionId === 'all' && !query ? (
        <ProjectFeature
          eyebrow="FEATURED REFERENCE"
          src={library.featured.src}
          title={library.featured.label}
          source={`${library.featured.scope} · ${library.featured.viewport} · v${library.featured.version}`}
          body={library.featured.notes ?? `Bound to ${library.featured.route}.`}
          tags={[library.featured.scope, library.featured.viewport]}
          status={library.featured.status}
          footer={
            <span className="tod-ps-card__footer">
              {library.featured.usedOnPages} PAGES
            </span>
          }
          onOpen={() => setSelectedId(library.featured?.referenceId ?? null)}
        />
      ) : null}

      {collectionId === 'all' && !query ? (
        library.collections.map((collection) => (
          <ProjectGroup
            key={collection.id}
            title={collection.label}
            meta={`${collection.references.length}`}
            action={<ProjectViewAll onClick={() => setCollectionId(collection.id)} />}
            collapsible={format === 'tall' && collection.references.length > 4}
            defaultOpen={collection.references.length <= 4 || format === 'wide'}
          >
            <ProjectCards
              items={collection.references.slice(0, format === 'wide' ? 8 : 4).map(toCard)}
              activeId={selected?.referenceId ?? null}
              onPick={setSelectedId}
              columns={4}
            />
          </ProjectGroup>
        ))
      ) : (
        <ProjectGroup title={collectionLabel(collectionId, library.collections)} meta={`${scoped.length}`}>
          <ProjectCards
            items={scoped.map(toCard)}
            activeId={selected?.referenceId ?? null}
            onPick={setSelectedId}
            columns={4}
            emptyLabel="NO MATCHING REFERENCES"
            emptyHint="Adjust the collection or clear the search."
          />
        </ProjectGroup>
      )}
    </>
  );

  const inspector = selected ? (
    <ProjectInspector
      title="REFERENCE INSPECTOR"
      counter={`${library.all.findIndex((ref) => ref.referenceId === selected.referenceId) + 1} / ${library.total}`}
    >
      <div className="tod-ps-card__shot" style={{ aspectRatio: '16 / 11' }}>
        {selected.src ? <img src={selected.src} alt={selected.label} loading="lazy" /> : null}
      </div>
      <strong style={{ fontSize: 12, letterSpacing: '0.04em' }}>{selected.label}</strong>
      <div className="tod-ps-tags">
        <span>{selected.scope}</span>
        <span>{selected.viewport}</span>
        <span>V{selected.version}</span>
      </div>
      <ProjectFacts
        entries={[
          { k: 'ROUTE', v: selected.route },
          { k: 'SOURCE', v: selected.createdBy },
          { k: 'ADDED', v: selected.createdAt.slice(0, 10) },
          { k: 'USAGE', v: `${selected.usedOnPages} pages` },
          { k: 'COLLECTION', v: collectionLabel(selected.collection, library.collections) },
          { k: 'STATUS', v: <OverlayStatus label={selected.status} /> },
        ]}
      />
      {selected.notes ? <p style={{ margin: 0, fontSize: 10 }}>{selected.notes}</p> : null}
    </ProjectInspector>
  ) : null;

  return (
    <ProjectSurface id="references">
      <ProjectIdentity
        name={intelligence?.displayName ?? projectSlug.toUpperCase()}
        subtitle={`${intelligence?.projectType.replace(/_/g, ' ') ?? 'PROJECT'} · PROJECT REFERENCES`}
        stream={intelligence ? intelligence.primaryCreativeStream.split('_') : undefined}
        stats={[
          { label: 'REFERENCES', value: library.total },
          { label: 'APPROVED', value: library.approved },
          { label: 'ARCHIVED', value: library.archived },
          { label: 'COLLECTIONS', value: library.collections.length },
        ]}
        authority={{ label: 'AUTHORITY PAIR', state: 'UNLOCKED', locked: false }}
      />

      <ProjectPanes
        rail={
          format === 'wide' ? (
            <ProjectRail
              title="REFERENCE COLLECTIONS"
              items={railItems}
              activeId={collectionId}
              onPick={setCollectionId}
            />
          ) : undefined
        }
        inspector={inspector ?? undefined}
      >
        {sheet}
      </ProjectPanes>

      <ProjectActionBar
        actions={[
          { id: 'upload', label: 'UPLOAD REFERENCE', icon: <PsIconUpload />, disabled: true },
          { id: 'assign', label: 'ASSIGN TO PAGES', icon: <PsIconLink />, disabled: !selected },
          { id: 'compare', label: 'COMPARE', icon: <PsIconCompare />, disabled: library.total < 2 },
          { id: 'inspect', label: 'INSPECT LIBRARY', icon: <PsIconSearch />, disabled: !selected },
        ]}
      />
    </ProjectSurface>
  );
}

function toCard(ref: ProjectReferenceRecord) {
  return {
    id: ref.referenceId,
    src: ref.src,
    title: ref.label,
    sub: `${ref.viewport} · v${ref.version}`,
    badge: ref.status,
    tags: [ref.scope],
    footer: `${ref.usedOnPages} PAGES`,
  };
}

function collectionLabel(
  id: string,
  collections: Array<{ id: string; label: string }>,
): string {
  if (id === 'all') return 'ALL REFERENCES';
  return collections.find((collection) => collection.id === id)?.label ?? id.toUpperCase();
}
