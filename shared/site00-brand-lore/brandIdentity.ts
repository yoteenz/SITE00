/**
 * Canonical brand identity — display name, casing policy, prompt normalization.
 * Brand-agnostic architecture; NDXBOOK resolves to UPPERCASE one-word display.
 */

export type CreativeDisplayCase = 'UPPERCASE' | 'TITLE_CASE' | 'SENTENCE_CASE' | 'LOWERCASE' | 'MIXED' | 'INHERIT';

export type CreativeTypographyPolicy = {
  displayCase: CreativeDisplayCase;
  headlineCase: CreativeDisplayCase;
  labelCase: CreativeDisplayCase;
  metadataCase: CreativeDisplayCase;
  annotationCase: CreativeDisplayCase;
  preserveSourceCase: boolean;
};

export type CanonicalBrandIdentity = {
  brandSlug: string;
  displayName: string;
  displayNameToken: string;
  displayCase: CreativeDisplayCase;
  typographyPolicy: CreativeTypographyPolicy;
};

const FORBIDDEN_DISPLAY_VARIANTS = [
  /^NDX\s+BOOK$/i,
  /^NDX\s+book$/i,
  /^Ndxbook$/,
  /^Ndx\s+Book$/,
  /^NDX-BOOK$/i,
  /^NDX_BOOK$/i,
];

const BRAND_IDENTITY_REGISTRY: Record<string, CanonicalBrandIdentity> = {
  ndxbook: {
    brandSlug: 'ndxbook',
    displayName: 'NDXBOOK',
    displayNameToken: 'NDXBOOK',
    displayCase: 'UPPERCASE',
    typographyPolicy: {
      displayCase: 'UPPERCASE',
      headlineCase: 'UPPERCASE',
      labelCase: 'UPPERCASE',
      metadataCase: 'UPPERCASE',
      annotationCase: 'UPPERCASE',
      preserveSourceCase: true,
    },
  },
};

export function canonicalBrandDisplayName(brandSlug: string): string {
  const key = brandSlug.toLowerCase();
  return BRAND_IDENTITY_REGISTRY[key]?.displayName ?? brandSlug.replace(/-/g, ' ').toUpperCase();
}

export function resolveCanonicalBrandIdentity(brandSlug: string): CanonicalBrandIdentity {
  const key = brandSlug.toLowerCase();
  return (
    BRAND_IDENTITY_REGISTRY[key] ?? {
      brandSlug: key,
      displayName: canonicalBrandDisplayName(key),
      displayNameToken: canonicalBrandDisplayName(key),
      displayCase: 'INHERIT',
      typographyPolicy: {
        displayCase: 'INHERIT',
        headlineCase: 'INHERIT',
        labelCase: 'INHERIT',
        metadataCase: 'INHERIT',
        annotationCase: 'INHERIT',
        preserveSourceCase: true,
      },
    }
  );
}

export function applyCreativeDisplayCase(text: string, displayCase: CreativeDisplayCase): string {
  if (!text || displayCase === 'INHERIT') return text;
  if (displayCase === 'UPPERCASE') return text.toUpperCase();
  if (displayCase === 'LOWERCASE') return text.toLowerCase();
  return text;
}

export function isForbiddenBrandDisplayVariant(text: string): boolean {
  const t = text.trim();
  return FORBIDDEN_DISPLAY_VARIANTS.some((re) => re.test(t));
}

export function assertCreativeDisplayCase(text: string, policy: CreativeTypographyPolicy): boolean {
  if (policy.displayCase !== 'UPPERCASE') return true;
  return text === text.toUpperCase();
}

export type BrandPromptContext = {
  brandSlug: string;
  displayName: string;
  typographyPolicy: CreativeTypographyPolicy;
  visibleCopyUppercase: boolean;
  suppressVisibleBrandNameInImage: boolean;
};

export function normalizeBrandPromptContext(brandSlug: string): BrandPromptContext {
  const identity = resolveCanonicalBrandIdentity(brandSlug);
  return {
    brandSlug: identity.brandSlug,
    displayName: identity.displayName,
    typographyPolicy: identity.typographyPolicy,
    visibleCopyUppercase: identity.typographyPolicy.displayCase === 'UPPERCASE',
    suppressVisibleBrandNameInImage: identity.brandSlug === 'ndxbook',
  };
}

/** Replace forbidden two-word variants in prompt prose with canonical token. */
export function normalizeBrandNameInPromptText(text: string, brandSlug: string): string {
  const identity = resolveCanonicalBrandIdentity(brandSlug);
  return text
    .replace(/\bNDX\s+BOOK\b/gi, identity.displayName)
    .replace(/\bNdxbook\b/g, identity.displayName)
    .replace(/\bndxbook\b/g, identity.displayNameToken);
}

export function brandPromptTypographyBlock(brandSlug: string): string {
  const ctx = normalizeBrandPromptContext(brandSlug);
  const lines = [
    `BRAND DISPLAY NAME (exact): ${ctx.displayName}`,
    `BRAND NAME IS ONE WORD: ${ctx.displayName}`,
  ];
  if (ctx.visibleCopyUppercase) {
    lines.push('ALL NDXBOOK-BRANDED VISIBLE DISPLAY TYPOGRAPHY MUST READ AS UPPERCASE.');
    lines.push('MARTIAN MONO SYSTEM/METADATA VOICE: UPPERCASE.');
  }
  if (ctx.suppressVisibleBrandNameInImage) {
    lines.push('IF BRAND NAME NOT REQUIRED IN RAW IMAGE: NO BRAND NAME / NO LOGO — code-native layer owns wordmark.');
  } else {
    lines.push(`IF BRAND NAME VISIBLE IN IMAGE: EXACTLY "${ctx.displayName}".`);
  }
  return lines.join('\n');
}
