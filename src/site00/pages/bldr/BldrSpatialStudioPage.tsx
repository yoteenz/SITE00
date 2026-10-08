/**
 * /bldr/studio/:room — SITE 00 Builder (Hybrid Spatial Studio).
 *
 * Gated by the existing `VITE_SITE00_TEMPLATE_SYSTEM_V1` flag (off by default, on only for the cloud dev preview),
 * so nothing is publicly exposed until the founder turns it on. Money on the Blueprint is gated separately by
 * `VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1`. `?intakeId=` resumes a server-saved Blueprint
 * (`builderIntakeResumeHref`).
 */
import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { templateSystemEnabled } from '../../../studioos/estimation/flags';
import { SITE00_ROUTES } from '../../config/routes';
import { BuilderStudio } from '../../builder-studio/BuilderStudio';
import { parseStudioRoom } from '../../builder-studio/studioModel';
import '../../styles/site00-builder-studio.css';

export default function BldrSpatialStudioPage() {
  const params = useParams();
  // Page-scoped body reset (no default margin, studio background under overscroll); removed on exit.
  useEffect(() => {
    document.body.classList.add('bs-body');
    return () => document.body.classList.remove('bs-body');
  }, []);
  if (!templateSystemEnabled()) return <Navigate to={SITE00_ROUTES.bldr} replace />;
  return <BuilderStudio room={parseStudioRoom(params['*'])} />;
}
