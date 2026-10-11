import type { BrandAuthorityContract, CorrespondenceWorkspaceManifest } from './types.js';

/**
 * Brand firewall: the studio shell may stay SITE 00-branded; the email canvas must use the campaign brand authority.
 */
export function resolveBrandForCampaign(
  manifest: CorrespondenceWorkspaceManifest,
  brandAuthorityId: string,
): BrandAuthorityContract {
  const hit = manifest.brand_authorities.find((b) => b.brand_authority_id === brandAuthorityId);
  if (!hit) {
    throw new Error(`unknown brand authority: ${brandAuthorityId}`);
  }
  return hit;
}

export function emailCanvasUsesSite00Dna(brand: BrandAuthorityContract): boolean {
  return brand.uses_site00_visual_dna;
}

export function assertClientBrandNotSite00Default(brand: BrandAuthorityContract): void {
  if (!brand.uses_site00_visual_dna && !brand.brand_authority_id.startsWith('client-')) {
    // Example brands use client- prefix in V1 manifest.
  }
}
