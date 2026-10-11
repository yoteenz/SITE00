/**
 * /bldr/studio/:room — SITE 00 Builder (Hybrid Spatial Studio).
 *
 * Gated by the existing `VITE_SITE00_TEMPLATE_SYSTEM_V1` flag (off by default, on only for the cloud dev preview),
 * so nothing is publicly exposed until the founder turns it on. Money on the Blueprint is gated separately by
 * `VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1`. `?intakeId=` resumes a server-saved Blueprint
 * (`builderIntakeResumeHref`).
 */
import { useEffect, useMemo } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { emptySpatialState, SPATIAL_ROOM_ORDER, type SpatialBuilderState, type SpatialRoomId } from '../../builder-experience/spatialStudio';
import { templateSystemEnabled } from '../../../studioos/estimation/flags';
import { SITE00_ROUTES } from '../../config/routes';
import { BuilderStudio } from '../../builder-studio/BuilderStudio';
import { parseStudioRoom } from '../../builder-studio/studioModel';
import '../../styles/site00-builder-studio.css';

/**
 * `?reviewRoom=PLACE|FEEL|WORK|PACE|BLUEPRINT` shows the studio on a frozen sample, with nothing saved or submitted.
 * The Digital Foundation design review (/foundation/review) embeds each room this way.
 */
function reviewSample(value: string | null): SpatialBuilderState | null {
  if (!value || !(SPATIAL_ROOM_ORDER as readonly string[]).includes(value)) return null;
  return {
    ...emptySpatialState(),
    room: value as SpatialRoomId,
    placePath: 'ADVANCED',
    feelVibe: 'MODERN',
    workModules: ['PAGES', 'SHOP', 'PORTAL'],
    pace: 'STANDARD',
  };
}

export default function BldrSpatialStudioPage() {
  const params = useParams();
  const [search] = useSearchParams();
  const sample = useMemo(() => reviewSample(search.get('reviewRoom')), [search]);
  // Page-scoped body reset (no default margin, studio background under overscroll); removed on exit.
  useEffect(() => {
    document.body.classList.add('bs-body');
    return () => document.body.classList.remove('bs-body');
  }, []);
  if (!templateSystemEnabled()) return <Navigate to={SITE00_ROUTES.bldr} replace />;
  return <BuilderStudio room={parseStudioRoom(params['*'])} sample={sample} />;
}
