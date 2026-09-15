import type {
  FigmaStyleInterfaceTranslationPackage,
  SolDesignBenchReferenceAuthority,
} from '../../../shared/site00-sol-design-bench/contracts.js';

export const SOL_PROVIDER_MODEL_ID =
  process.env.SOL_DESIGN_BENCH_MODEL?.trim() || 'gpt-5.6-sol';

const SOL_PROVIDER_URL =
  process.env.SOL_DESIGN_BENCH_API_URL?.trim() || 'https://api.openai.com/v1/responses';

const SYSTEM_PROMPT = `You are GPT-5.6 SOL operating as a literal visual-design intelligence layer.
The uploaded screenshot is immutable design authority. Translate it; do not redesign, improve, normalize, or apply a preferred design system.
Analyze page, section, component, and perceptual levels. Use source-derived pixel measurements and preserve source aspect ratio, geometry, typography hierarchy, color concentration, asset placement, density, whitespace, and emphasis.

Return one JSON object only. It must contain exactly these top-level conceptual deliverables:
VISUAL_INTERFACE_PREVIEW, PAGE_FRAME_SPEC, SECTION_TREE, COMPONENT_TREE, LAYOUT_GEOMETRY_SPEC, TYPOGRAPHY_SYSTEM, COLOR_SYSTEM, SPACING_SYSTEM, BORDER_RADIUS_SURFACE_SYSTEM, ASSET_PLACEMENT_MAP, CONTROL_STATE_SYSTEM, VISUAL_HIERARCHY_MAP, IMPLEMENTATION_HANDOFF, DO_NOT_CHANGE_RULES.

COMPONENT_TREE must be a complete flat preorder list. Every component requires:
componentId, parentId, label, semanticRole, visualRole, siblingOrder, x, y, width, height,
normalizedBounds {x,y,width,height} in 0..1, layoutMode, alignment, padding, gap, visualPriority,
style {background,color,border,borderRadius,fontSize,fontWeight,lineHeight,textAlign}, optional text, assetId, state.
Coordinates are in screenshot pixels.

VISUAL_INTERFACE_PREVIEW: {artboardWidth,artboardHeight,background,componentIds,renderingNotes}.
PAGE_FRAME_SPEC: {frame:{width,height},contentBounds,background,outerMargins,grid,columns,gutters,verticalRhythm}.
SECTION_TREE uses PAGE > SECTION > GROUP > COMPONENT and assigns every meaningful visible area.
LAYOUT_GEOMETRY_SPEC explicitly records bounds, baselines, anchors, stacking, side-by-side relations, grids, overlaps, and repeated dimensions.
TYPOGRAPHY_SYSTEM lists each observed role with familyClassification,size,weight,lineHeight,tracking,casing,alignment,widthConstraint,lineCount,wrapping.
COLOR_SYSTEM lists reference-derived page/surface/text/border/divider/accent/state tokens with hex values.
SPACING_SYSTEM explicitly covers pageMargin,sectionSpacing,panelPadding,componentGaps,textRhythm,rowSpacing,controlSpacing.
BORDER_RADIUS_SURFACE_SYSTEM covers borders,radii,fills,shadows,separators,stateTreatments,nestedSurfaceHierarchy.
ASSET_PLACEMENT_MAP lists each visible image with assetRole,componentId,bounds,aspectRatio,cropBehavior,focalPosition,frameBackground,visualWeight and sourceReferenceRegion.
CONTROL_STATE_SYSTEM only classifies visually evidenced PRIMARY,SECONDARY,TERTIARY,SELECTED,ACTIVE,LOCKED,DISABLED,NEUTRAL states.
VISUAL_HIERARCHY_MAP separates semanticRole from visualWeight and includes dominanceRank,contrastWeight,areaWeight,typographicWeight,positionalProminence,accentContribution.
IMPLEMENTATION_HANDOFF: {handoffType:"SolComposerImplementationHandoff",executionIntent:"REFERENCE_TRANSLATION",sourceAuthoritySha256,inventionBudget:"NONE",targetFrame,orderedBuildInstructions,componentContracts,tokenContracts,assetBindings,acceptanceChecks,composerInvoked:false}.
DO_NOT_CHANGE_RULES contains only constraints genuinely visible in the reference.
Never mention or use Grok. Never invoke Composer.`;

type ResponsesApiPayload = {
  output_text?: string;
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  usage?: { input_tokens?: number; output_tokens?: number };
  cost?: { amount?: number; currency?: string };
};

function extractJson(text: string): unknown {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first < 0 || last <= first) throw new Error('SOL_PROVIDER_JSON_MISSING');
  return JSON.parse(cleaned.slice(first, last + 1));
}

export interface SolProviderResult {
  package: FigmaStyleInterfaceTranslationPackage;
  cost: { amount: number; currency: string } | null;
}

export async function executeSolDesignAnalysis(input: {
  authority: SolDesignBenchReferenceAuthority;
  dataUrl: string;
}): Promise<SolProviderResult> {
  const apiKey =
    process.env.SOL_DESIGN_BENCH_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error('SOL_PROVIDER_CREDENTIALS_MISSING');

  const response = await fetch(SOL_PROVIDER_URL, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: SOL_PROVIDER_MODEL_ID,
      instructions: SYSTEM_PROMPT,
      input: [{
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `Analyze this immutable reference. Authority SHA256: ${input.authority.sha256}. Intrinsic frame: ${input.authority.width} × ${input.authority.height}. MIME: ${input.authority.mime}.`,
          },
          { type: 'input_image', image_url: input.dataUrl, detail: 'high' },
        ],
      }],
      text: { format: { type: 'json_object' } },
      max_output_tokens: 30000,
    }),
    signal: AbortSignal.timeout(12 * 60 * 1000),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`SOL_PROVIDER_FAILED_${response.status}:${detail.slice(0, 240)}`);
  }
  const body = (await response.json()) as ResponsesApiPayload;
  const text =
    body.output_text ||
    body.output?.flatMap((row) => row.content ?? []).find((row) => row.type === 'output_text')?.text ||
    '';
  const parsed = extractJson(text) as FigmaStyleInterfaceTranslationPackage;
  return {
    package: parsed,
    cost: typeof body.cost?.amount === 'number'
      ? { amount: body.cost.amount, currency: body.cost.currency || 'USD' }
      : null,
  };
}
