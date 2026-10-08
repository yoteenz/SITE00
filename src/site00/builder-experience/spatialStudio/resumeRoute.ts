import { isBuilderSpatialDraftPayload } from '../../../../shared/site00-builder-spatial-intake/types';
import { SITE00_ROUTES } from '../../config/routes';

export function builderIntakeResumeHref(
  intakeType: 'BUILDER' | 'IDENTITY',
  draftPayload: Record<string, unknown> | undefined,
  intakeId: string,
  sourceRoute: string | null,
): string {
  if (intakeType === 'BUILDER' && isBuilderSpatialDraftPayload(draftPayload ?? {})) {
    return `${SITE00_ROUTES.bldrSpatialStudio}?intakeId=${encodeURIComponent(intakeId)}`;
  }
  return sourceRoute || (intakeType === 'IDENTITY' ? SITE00_ROUTES.idnty : SITE00_ROUTES.bldr);
}
