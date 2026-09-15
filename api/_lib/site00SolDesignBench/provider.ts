import { createHash } from 'node:crypto';
import type {
  FigmaStyleInterfaceTranslationPackage,
  SolDesignBenchReferenceAuthority,
} from '../../../shared/site00-sol-design-bench/contracts.js';
import {
  SolDesignBenchModelContract,
  type SolBenchmarkInputReceipt,
  type SolBenchmarkProviderDispatchReceipt,
} from '../../../shared/site00-sol-design-bench/modelContract.js';

export const SOL_PROVIDER_MODEL_ID = SolDesignBenchModelContract.modelId;
export const SOL_PROMPT_VERSION = 'sol-design-bench-test-b-v3-json-instruction';
export const SOL_USER_JSON_INSTRUCTION =
  'Return the final FigmaStyleInterfaceTranslationPackage as valid JSON matching the required schema.';

export const SOL_SYSTEM_PROMPT = `You are GPT-5.6 SOL operating as a literal visual-design intelligence layer.
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
  id?: string;
  model?: string;
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
  dispatchReceipt: SolBenchmarkProviderDispatchReceipt;
  inputReceipt: SolBenchmarkInputReceipt;
}

export const SOL_PROMPT_HASH = createHash('sha256')
  .update(`${SOL_SYSTEM_PROMPT}\n${SOL_USER_JSON_INSTRUCTION}`)
  .digest('hex');

export function buildSolOpenAiRequestBody(input: {
  authority: SolDesignBenchReferenceAuthority;
  dataUrl: string;
}) {
  return {
    model: SolDesignBenchModelContract.modelId,
    reasoning: { effort: SolDesignBenchModelContract.reasoningEffort },
    instructions: SOL_SYSTEM_PROMPT,
    input: [{
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: `${SOL_USER_JSON_INSTRUCTION} Analyze this immutable reference. Authority SHA256: ${input.authority.sha256}. Intrinsic frame: ${input.authority.width} × ${input.authority.height}. MIME: ${input.authority.mime}.`,
        },
        { type: 'input_image', image_url: input.dataUrl, detail: 'high' },
      ],
    }],
    tools: [],
    tool_choice: 'none',
    text: { format: { type: 'json_object' } },
    max_output_tokens: 30000,
  } as const;
}

type SolOpenAiRequestBody = ReturnType<typeof buildSolOpenAiRequestBody>;

export function assertSolStructuredOutputRequest(body: SolOpenAiRequestBody): void {
  const userText = body.input
    .flatMap((message) => message.content)
    .filter((part) => part.type === 'input_text')
    .map((part) => part.text)
    .join(' ');
  if (body.text.format.type !== 'json_object' || !/\bjson\b/i.test(userText)) {
    throw new Error('SOL_STRUCTURED_OUTPUT_REQUEST_INVALID:JSON_INSTRUCTION_MISSING');
  }
}

export class SolProviderRequestError extends Error {
  constructor(
    message: string,
    public readonly dispatchReceipt: SolBenchmarkProviderDispatchReceipt,
    public readonly inputReceipt: SolBenchmarkInputReceipt,
  ) {
    super(message);
  }
}

export function buildSolBenchmarkInputReceipt(input: {
  runId: string;
  authority: SolDesignBenchReferenceAuthority;
}): SolBenchmarkInputReceipt {
  return {
    receiptType: 'SolBenchmarkInputReceipt',
    runId: input.runId,
    referenceSha256: input.authority.sha256,
    referenceWidth: input.authority.width,
    referenceHeight: input.authority.height,
    imageInputAttached: true,
    provider: SolDesignBenchModelContract.provider,
    modelId: SolDesignBenchModelContract.modelId,
    requestedReasoningEffort: SolDesignBenchModelContract.reasoningEffort,
    promptVersion: SOL_PROMPT_VERSION,
  };
}

export async function executeSolDesignAnalysis(input: {
  runId: string;
  authority: SolDesignBenchReferenceAuthority;
  dataUrl: string;
}): Promise<SolProviderResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error('GPT_5_6_SOL_PROVIDER_BINDING_FAILED:OPENAI_CREDENTIAL_MISSING');

  const requestBody = buildSolOpenAiRequestBody(input);
  assertSolStructuredOutputRequest(requestBody);
  const imageInput = requestBody.input[0].content.find((row) => row.type === 'input_image');
  if (!imageInput?.image_url.startsWith(`data:${input.authority.mime};base64,`)) {
    throw new Error('GPT_5_6_SOL_PROVIDER_BINDING_FAILED:VISION_INPUT_NOT_ATTACHED');
  }

  const inputReceipt = buildSolBenchmarkInputReceipt(input);
  const dispatchReceipt: SolBenchmarkProviderDispatchReceipt = {
    receiptType: 'SolBenchmarkProviderDispatchReceipt',
    runId: input.runId,
    provider: SolDesignBenchModelContract.provider,
    modelId: SolDesignBenchModelContract.modelId,
    reasoningEffort: SolDesignBenchModelContract.reasoningEffort,
    imageInputAttached: true,
    structuredOutputRequested: true,
    structuredOutputMode: 'json_object',
    jsonInstructionPresent: true,
    requestedModelId: SolDesignBenchModelContract.modelId,
    actualDispatchedModelId: null,
    requestedReasoningEffort: SolDesignBenchModelContract.reasoningEffort,
    fallbackAllowed: SolDesignBenchModelContract.fallbackAllowed,
    webSearchEnabled: SolDesignBenchModelContract.webSearchAllowed,
    endpoint: SolDesignBenchModelContract.responsesEndpoint,
    providerResponseId: null,
    dispatchedAt: new Date().toISOString(),
  };

  const response = await fetch(SolDesignBenchModelContract.responsesEndpoint, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(12 * 60 * 1000),
  });

  if (!response.ok) {
    const detail = await response.text();
    const classification =
      response.status === 400 && /\b(model|reasoning)\b/i.test(detail)
        ? 'GPT_5_6_SOL_PROVIDER_BINDING_FAILED'
        : response.status === 400
          ? 'OPENAI_RESPONSES_REQUEST_INVALID'
          : 'SOL_RUN_FAILED';
    throw new SolProviderRequestError(
      `${classification}:OPENAI_${response.status}:${detail.slice(0, 240)}`,
      dispatchReceipt,
      inputReceipt,
    );
  }
  const body = (await response.json()) as ResponsesApiPayload;
  if (body.model !== SolDesignBenchModelContract.modelId) {
    throw new SolProviderRequestError(
      `GPT_5_6_SOL_PROVIDER_BINDING_FAILED:DISPATCHED_MODEL_${body.model || 'UNREPORTED'}`,
      dispatchReceipt,
      inputReceipt,
    );
  }
  const text =
    body.output_text ||
    body.output?.flatMap((row) => row.content ?? []).find((row) => row.type === 'output_text')?.text ||
    '';
  let parsed: FigmaStyleInterfaceTranslationPackage;
  try {
    parsed = extractJson(text) as FigmaStyleInterfaceTranslationPackage;
  } catch (error) {
    throw new SolProviderRequestError(
      `SOL_STRUCTURED_OUTPUT_PARSE_FAILED:${error instanceof Error ? error.message : String(error)}`,
      { ...dispatchReceipt, actualDispatchedModelId: SolDesignBenchModelContract.modelId, providerResponseId: body.id || null },
      inputReceipt,
    );
  }
  return {
    package: parsed,
    cost: typeof body.cost?.amount === 'number'
      ? { amount: body.cost.amount, currency: body.cost.currency || 'USD' }
      : null,
    dispatchReceipt: {
      ...dispatchReceipt,
      actualDispatchedModelId: SolDesignBenchModelContract.modelId,
      providerResponseId: body.id || null,
    },
    inputReceipt,
  };
}
