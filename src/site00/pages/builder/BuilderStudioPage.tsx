/**
 * /bldr/builder/:room — SITE 00 Builder (Hybrid Spatial Studio).
 * Gated by the existing `VITE_SITE00_TEMPLATE_SYSTEM_V1` flag (off by default), so nothing is publicly exposed
 * until the founder turns it on. Money on the Blueprint is gated separately by
 * `VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1`.
 */
import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { templateSystemEnabled } from '../../../studioos/estimation/flags';
import { SITE00_ROUTES } from '../../config/routes';
import { BuilderStudio } from '../../builder-studio/BuilderStudio';
import { STUDIO_ROOMS, type StudioRoomId } from '../../builder-studio/studioModel';
import '../../styles/site00-builder-studio.css';

const ROOM_IDS = new Set<string>(STUDIO_ROOMS.map((room) => room.id));

export default function BuilderStudioPage() {
  const params = useParams();
  // Page-scoped body reset (no default margin, studio background under overscroll); removed on exit.
  useEffect(() => {
    document.body.classList.add('bs-body');
    return () => document.body.classList.remove('bs-body');
  }, []);
  if (!templateSystemEnabled()) return <Navigate to={SITE00_ROUTES.bldr} replace />;
  const segment = (params['*'] ?? '').split('/')[0] ?? '';
  const room = ROOM_IDS.has(segment) ? (segment as StudioRoomId) : null;
  return <BuilderStudio room={room} />;
}
