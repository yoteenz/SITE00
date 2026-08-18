import { useMemo } from 'react';
import { readLocalActivityForEmail } from '../../utils/activity';
import { useSite00CurrentUser } from './useSite00CurrentUser';
import {
  CTRL_ROOM_ATTENTION_SEED,
  CTRL_ROOM_NOW_SEED,
  CTRL_ROOM_QUICK_LAUNCH_SEED,
  CTRL_ROOM_UP_NEXT_SEED,
  ECOSYSTEM_PROJECTS_SEED,
  ECOSYSTEM_SITES_SEED,
  MY_ROLES_SEED,
  PROJECT_ACTIVITY_SEED,
  SITE_ACTIVITY_SEED,
  SITE_TEAM_SEED,
  computeProjectMetrics,
  computeSiteMetrics,
  type ActiveBuild,
  type EcosystemProject,
  type EcosystemSite,
  type SignalItem,
} from '../config/seed/site00-ecosystem-seed';

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function mapActivityToSignals(email: string): SignalItem[] {
  const rows = readLocalActivityForEmail(email).slice(0, 6);
  if (rows.length === 0) return [];
  return rows.map((row) => ({
    id: row.id,
    message: row.eventType.replace(/_/g, ' '),
    timeAgo: formatRelativeTime(row.createdAt),
  }));
}

/** Unified ecosystem data — seed when no production API; real activity when available. */
export function useEcosystemData() {
  const user = useSite00CurrentUser();
  const email = (user?.email || '').trim().toLowerCase();

  const projects: EcosystemProject[] = useMemo(() => ECOSYSTEM_PROJECTS_SEED, []);
  const sites: EcosystemSite[] = useMemo(() => ECOSYSTEM_SITES_SEED, []);

  const projectMetrics = useMemo(() => computeProjectMetrics(projects), [projects]);
  const siteMetrics = useMemo(() => computeSiteMetrics(sites), [sites]);

  const activeBuilds: ActiveBuild[] = useMemo(
    () =>
      projects
        .filter((p) => p.status === 'ACTIVE' || p.status === 'IN PROGRESS')
        .slice(0, 4)
        .map((p) => ({
          id: p.id,
          name: p.name.split(' ')[0] ?? p.name,
          stage: p.stage,
          progress: p.progress,
          href: p.href,
        })),
    [projects],
  );

  const recentSignals: SignalItem[] = useMemo(() => {
    const fromActivity = email ? mapActivityToSignals(email) : [];
    if (fromActivity.length > 0) return fromActivity;
    return [
      { id: 's1', message: 'SITE 00 uploaded revised homepage', timeAgo: '5h ago' },
      { id: 's2', message: 'Identity direction approved', timeAgo: '1d ago' },
      { id: 's3', message: 'Build moved into development', timeAgo: '2d ago' },
      { id: 's4', message: 'New message from project team', timeAgo: '3d ago' },
    ];
  }, [email]);

  const hasAttention = CTRL_ROOM_ATTENTION_SEED.length > 0;
  const hasNow = CTRL_ROOM_NOW_SEED.length > 0;

  return {
    user,
    projects,
    sites,
    projectMetrics,
    siteMetrics,
    now: CTRL_ROOM_NOW_SEED,
    attention: CTRL_ROOM_ATTENTION_SEED,
    activeBuilds,
    recentSignals,
    upNext: CTRL_ROOM_UP_NEXT_SEED,
    quickLaunch: CTRL_ROOM_QUICK_LAUNCH_SEED,
    projectActivity: PROJECT_ACTIVITY_SEED,
    siteActivity: SITE_ACTIVITY_SEED,
    myRoles: MY_ROLES_SEED,
    siteTeam: SITE_TEAM_SEED,
    hasAttention,
    hasNow,
    allClear: !hasAttention && !hasNow,
  };
}
