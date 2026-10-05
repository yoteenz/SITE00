import { describe, expect, it } from 'vitest';
import { resolveMobileTwinBlueprintDisplayUri } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/resolveMobileTwinBlueprintDisplayUri.js';
import { NDXBOOK_MOBILE_LIGHT_TECHNICAL_BLUEPRINT_MOUNT } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/mobileTwinPipeline/ndxbookLightBlueprintMount.js';

describe('resolveMobileTwinBlueprintDisplayUri', () => {
  it('always returns founder canonical JPG for NDXBOOK review (mobile Design slot)', () => {
    const uri = resolveMobileTwinBlueprintDisplayUri('ndxbook', {
      id: 'bp-1',
      implementationRenderId: 'r1',
      compositionStateId: 'c1',
      compositionHash: 'h',
      twinImageUri: 'https://fal.media/dark-navy-blueprint.png',
      twinImageHash: 'x',
      provider: 'FAL',
      providerJobRef: 'job',
      createdAt: new Date().toISOString(),
    });
    expect(uri).toBe(NDXBOOK_MOBILE_LIGHT_TECHNICAL_BLUEPRINT_MOUNT);
  });
});
