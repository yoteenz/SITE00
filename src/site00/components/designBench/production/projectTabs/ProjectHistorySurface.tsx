/**
 * P0.VR.DESIGN.OPUS-PROJECT-TABS1 — HISTORY as the project's design timeline.
 *
 * The old tab read one page's authority log and called it project history.
 * This one walks the whole registry, merges authority and asset records into
 * a single sequence, groups it by day and lets the founder filter by what
 * kind of thing happened.
 *
 * It still refuses to invent events. When nothing has happened the surface
 * says so and explains what will land here, because a plausible-looking
 * fabricated timeline is the one thing that would make this tab dangerous.
 */

import { useMemo, useState } from 'react';

import {
  buildProjectHistory,
  type ProjectHistoryEvent,
} from '../../../../../../shared/site00-design-workspace-production/designProjectLibraries.js';
import { buildDesignProjectIntelligence } from '../../../../../../shared/site00-design-workspace-production/designProjectBinding/index.js';
import {
  ProjectActionBar,
  ProjectActivity,
  ProjectFilters,
  ProjectGroup,
  ProjectIdentity,
  ProjectInspector,
  ProjectPanes,
  ProjectSearch,
  ProjectStats,
  ProjectSurface,
  ProjectTimeline,
  useShellFormat,
} from '../designProjectSurfaceKit';
import { useDesignProductionNavigation } from '../useDesignProductionNavigation';
import { PsIconArchive, PsIconCompare, PsIconFilter, PsIconSearch } from './projectTabIcons';

const KIND_FILTERS = ['ALL', 'CONCEPT', 'AUTHORITY', 'PROMOTION', 'REVIEW', 'ASSET', 'BUILD'] as const;

export function ProjectHistorySurface() {
  const { projectSlug } = useDesignProductionNavigation();
  const format = useShellFormat();
  const history = useMemo(() => buildProjectHistory(projectSlug), [projectSlug]);
  const intelligence = useMemo(() => buildDesignProjectIntelligence(projectSlug), [projectSlug]);

  const [kind, setKind] = useState<string>('ALL');
  const [query, setQuery] = useState('');

  const scoped = useMemo(() => {
    const base = kind === 'ALL' ? history.events : history.events.filter((event) => event.kind === kind);
    const needle = query.trim().toLowerCase();
    if (!needle) return base;
    return base.filter((event) =>
      `${event.title} ${event.detail} ${event.pageName} ${event.actor}`.toLowerCase().includes(needle),
    );
  }, [history.events, kind, query]);

  const groups = useMemo(() => groupByDay(scoped), [scoped]);
  const activity = useMemo(() => activityDays(history.events), [history.events]);

  const inspector = (
    <ProjectInspector title="HISTORY OVERVIEW">
      <ProjectStats
        columns={3}
        entries={[
          { label: 'TOTAL EVENTS', value: history.total },
          { label: 'PAGES AFFECTED', value: history.pagesAffected },
          { label: 'CONCEPTS', value: history.byKind.CONCEPT ?? 0 },
          { label: 'AUTHORITY', value: history.byKind.AUTHORITY ?? 0 },
          { label: 'PROMOTIONS', value: history.byKind.PROMOTION ?? 0 },
          { label: 'ASSETS', value: history.byKind.ASSET ?? 0 },
        ]}
      />
      {history.latest ? (
        <>
          <span style={{ fontSize: 8, letterSpacing: '0.12em', color: '#6a6a70' }}>LATEST MILESTONE</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <strong style={{ fontSize: 11 }}>{history.latest.title}</strong>
            <em style={{ fontStyle: 'normal', fontSize: 9, color: '#6a6a70' }}>
              {history.latest.pageName} · {history.latest.at.slice(0, 16).replace('T', ' ')}
            </em>
          </div>
        </>
      ) : null}
    </ProjectInspector>
  );

  return (
    <ProjectSurface id="history">
      <ProjectIdentity
        name={intelligence?.displayName ?? projectSlug.toUpperCase()}
        subtitle="PROJECT DESIGN HISTORY"
        stats={[
          { label: 'EVENTS', value: history.total },
          { label: 'PAGES', value: history.pagesAffected },
          { label: 'PROMOTIONS', value: history.byKind.PROMOTION ?? 0 },
          { label: 'ASSETS', value: history.byKind.ASSET ?? 0 },
        ]}
        authority={{
          label: 'LAST EVENT',
          state: history.latest ? history.latest.at.slice(0, 10) : 'NONE',
          locked: false,
        }}
      />

      {format === 'tall' && history.total > 0 ? (
        <ProjectActivity
          days={activity}
          legend={[
            { label: 'CHANGES', count: history.byKind.CONCEPT ?? 0, tone: 'change' },
            { label: 'APPROVALS', count: history.byKind.PROMOTION ?? 0, tone: 'approval' },
            { label: 'REVIEWS', count: history.byKind.REVIEW ?? 0, tone: 'review' },
            { label: 'OTHER', count: history.byKind.EVENT ?? 0, tone: 'other' },
          ]}
        />
      ) : null}

      <ProjectPanes inspector={format === 'wide' ? inspector : undefined}>
        <ProjectSearch
          placeholder="Search history… (e.g. concept, authority, page)"
          value={query}
          onChange={setQuery}
          trailing={<span className="tod-ps-chip">{scoped.length} EVENTS</span>}
        />
        <ProjectFilters
          chips={KIND_FILTERS.map((id) => ({
            id,
            label: id,
            count: id === 'ALL' ? history.total : history.byKind[id] ?? 0,
          }))}
          activeId={kind}
          onPick={setKind}
        />

        <ProjectTimeline
          groups={groups}
          emptyLabel={history.total === 0 ? 'NO PROJECT HISTORY YET' : 'NO EVENTS MATCH THIS FILTER'}
          emptyHint={
            history.total === 0
              ? 'Authority updates, concept promotions, reviews and asset approvals across every page in this project are recorded here as they happen.'
              : undefined
          }
        />

        {format === 'tall' && history.total > 0 ? (
          <ProjectGroup title="HISTORY OVERVIEW" meta={`${history.total} EVENTS`}>
            <ProjectStats
              columns={3}
              entries={[
                { label: 'TOTAL', value: history.total },
                { label: 'PAGES', value: history.pagesAffected },
                { label: 'CONCEPTS', value: history.byKind.CONCEPT ?? 0 },
                { label: 'AUTHORITY', value: history.byKind.AUTHORITY ?? 0 },
                { label: 'PROMOTIONS', value: history.byKind.PROMOTION ?? 0 },
                { label: 'ASSETS', value: history.byKind.ASSET ?? 0 },
              ]}
            />
          </ProjectGroup>
        ) : null}
      </ProjectPanes>

      <ProjectActionBar
        actions={[
          { id: 'filter', label: 'FILTER EVENTS', icon: <PsIconFilter />, onClick: () => setKind('ALL') },
          { id: 'audit', label: 'OPEN AUDIT', icon: <PsIconSearch />, disabled: history.total === 0 },
          { id: 'compare', label: 'COMPARE VERSIONS', icon: <PsIconCompare />, disabled: history.total < 2 },
          { id: 'export', label: 'EXPORT LOG', icon: <PsIconArchive />, disabled: history.total === 0 },
        ]}
      />
    </ProjectSurface>
  );
}

function groupByDay(events: ProjectHistoryEvent[]) {
  const today = new Date().toISOString().slice(0, 10);
  const buckets = new Map<string, ProjectHistoryEvent[]>();

  for (const event of events) {
    const day = event.at.slice(0, 10);
    const bucket = buckets.get(day);
    if (bucket) bucket.push(event);
    else buckets.set(day, [event]);
  }

  return [...buckets.entries()].map(([day, list]) => ({
    id: day,
    label: day === today ? `TODAY · ${day}` : day,
    count: list.length,
    entries: list.map((event) => ({
      id: event.id,
      when: day,
      time: event.at.slice(11, 16),
      kind: event.kind,
      title: event.title,
      detail: event.detail,
      actor: event.actor,
      tags: [event.pageName.toUpperCase()],
    })),
  }));
}

/** 30 cells, oldest first, bucketed into four levels by events that day. */
function activityDays(events: ProjectHistoryEvent[]) {
  const counts = new Map<string, number>();
  for (const event of events) {
    const day = event.at.slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  const days: Array<{ id: string; level: 0 | 1 | 2 | 3 }> = [];
  const now = Date.now();
  for (let index = 29; index >= 0; index -= 1) {
    const day = new Date(now - index * 86_400_000).toISOString().slice(0, 10);
    const count = counts.get(day) ?? 0;
    days.push({ id: day, level: count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : 3 });
  }
  return days;
}
