import { createHash } from 'node:crypto';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import type {
  FigmaStyleInterfaceTranslationPackage,
  SolDesignBenchReferenceAuthority,
} from '../../../shared/site00-sol-design-bench/contracts.js';
import {
  FigmaStyleInterfaceTranslationPackageZodSchema,
  SOL_DESIGN_BENCH_SCHEMA_VERSION,
  validateSolTranslationPackage,
} from '../../../shared/site00-sol-design-bench/schema.js';
import {
  SolDesignBenchModelContract,
  type SolBenchmarkInputReceipt,
  type SolOutputCompletenessReceipt,
  type SolBenchmarkProviderDispatchReceipt,
  type SolStructuredOutputRuntimeReceipt,
  type SolStructuredOutputValidationReceipt,
} from '../../../shared/site00-sol-design-bench/modelContract.js';

export const SOL_PROVIDER_MODEL_ID = SolDesignBenchModelContract.modelId;
export const SOL_PROMPT_VERSION = 'sol-design-bench-test-b-v5-sdk-parsed-schema';
export const SOL_SCHEMA_NAME = 'figma_style_interface_translation_package' as const;
export const SOL_USER_JSON_INSTRUCTION =
  'Return the final FigmaStyleInterfaceTranslationPackage as compact valid JSON matching the supplied strict JSON Schema. Do not duplicate prose or embed image/base64 data.';

export const SOL_SYSTEM_PROMPT = `You are GPT-5.6 SOL operating as a literal visual-design intelligence layer.
The uploaded screenshot is immutable design authority. Translate it; do not redesign, improve, normalize, or apply a preferred design system.
Analyze page, section, component, and perceptual levels. Use source-derived pixel measurements and preserve source aspect ratio, geometry, typography hierarchy, color concentration, asset placement, density, whitespace, and emphasis.

Return one compact JSON object only. It must contain exactly these top-level conceptual deliverables:
VISUAL_INTERFACE_PREVIEW, PAGE_FRAME_SPEC, SECTION_TREE, COMPONENT_TREE, LAYOUT_GEOMETRY_SPEC, TYPOGRAPHY_SYSTEM, COLOR_SYSTEM, SPACING_SYSTEM, BORDER_RADIUS_SURFACE_SYSTEM, ASSET_PLACEMENT_MAP, CONTROL_STATE_SYSTEM, VISUAL_HIERARCHY_MAP, IMPLEMENTATION_HANDOFF, DO_NOT_CHANGE_RULES.

COMPONENT_TREE must be a complete flat preorder list. Every component requires:
componentId, parentId, label, semanticRole, visualRole, siblingOrder, x, y, width, height,
normalizedBounds {x,y,width,height} in 0..1, layoutMode, alignment, padding, gap, visualPriority,
style {background,color,border,borderRadius,fontSize,fontWeight,lineHeight,textAlign}, optional text, assetId, state.
Coordinates are in screenshot pixels.

VISUAL_INTERFACE_PREVIEW: {artboardWidth,artboardHeight,background,componentIds,renderingNotes,visualPreviewRef}. Set visualPreviewRef to "sol-preview://RUN_ID"; never embed base64, SVG, HTML, or another large visual representation.
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

export interface SolProviderResult {
  package: FigmaStyleInterfaceTranslationPackage;
  cost: { amount: number; currency: string } | null;
  dispatchReceipt: SolBenchmarkProviderDispatchReceipt;
  inputReceipt: SolBenchmarkInputReceipt;
  runtimeReceipt: SolStructuredOutputRuntimeReceipt;
  validationReceipt: SolStructuredOutputValidationReceipt;
  completenessReceipt: SolOutputCompletenessReceipt;
  rawProviderResponse: string;
}

export const SOL_PROMPT_HASH = createHash('sha256')
  .update(`${SOL_SYSTEM_PROMPT}\n${SOL_USER_JSON_INSTRUCTION}`)
  .digest('hex');

export function buildSolOpenAiRequestBody(input: {
  authority: SolDesignBenchReferenceAuthority;
  dataUrl: string;
  proofMode?: 'TINY_LIVE_SCHEMA_SMOKE' | 'LARGE_OUTPUT_STRESS';
}) {
  const proofInstruction = input.proofMode === 'LARGE_OUTPUT_STRESS'
    ? ' Runtime proof: produce a comprehensive schema-valid package of at least 50000 JSON characters by fully populating components, tokens, hierarchy, assets, and handoff arrays without duplicate prose.'
    : input.proofMode === 'TINY_LIVE_SCHEMA_SMOKE'
      ? ' Runtime proof: return the smallest schema-valid package supported by the image.'
      : '';
  return {
    model: SolDesignBenchModelContract.modelId,
    reasoning: { effort: SolDesignBenchModelContract.reasoningEffort },
    instructions: SOL_SYSTEM_PROMPT,
    input: [{
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: `${SOL_USER_JSON_INSTRUCTION}${proofInstruction} Analyze this immutable reference. Authority SHA256: ${input.authority.sha256}. Intrinsic frame: ${input.authority.width} × ${input.authority.height}. MIME: ${input.authority.mime}.`,
        },
        { type: 'input_image', image_url: input.dataUrl, detail: 'high' },
      ],
    }],
    tools: [],
    tool_choice: 'none',
    text: {
      format: {
        ...zodTextFormat(
          FigmaStyleInterfaceTranslationPackageZodSchema,
          SOL_SCHEMA_NAME,
        ),
      },
    },
    max_output_tokens: 16000,
  } as const;
}

type SolOpenAiRequestBody = ReturnType<typeof buildSolOpenAiRequestBody>;

export function assertSolStructuredOutputRequest(body: SolOpenAiRequestBody): void {
  const userText = body.input
    .flatMap((message) => message.content)
    .filter((part) => part.type === 'input_text')
    .map((part) => part.text)
    .join(' ');
  if (
    body.text.format.type !== 'json_schema' ||
    body.text.format.strict !== true ||
    body.text.format.name !== SOL_SCHEMA_NAME ||
    !/\bjson\b/i.test(userText)
  ) {
    throw new Error('SOL_STRUCTURED_OUTPUT_REQUEST_INVALID:JSON_INSTRUCTION_MISSING');
  }
}

export class SolProviderRequestError extends Error {
  constructor(
    message: string,
    public readonly dispatchReceipt: SolBenchmarkProviderDispatchReceipt,
    public readonly inputReceipt: SolBenchmarkInputReceipt,
    public readonly validationReceipt: SolStructuredOutputValidationReceipt | null = null,
    public readonly completenessReceipt: SolOutputCompletenessReceipt | null = null,
    public readonly rawProviderResponse: string | null = null,
    public readonly recoveredSections: Partial<FigmaStyleInterfaceTranslationPackage> | null = null,
  ) {
    super(message);
  }
}

/** Prevents a text parser from ever becoming the strict-schema success path again. */
export class SolLegacyParserSuccessPathFirewall {
  static assert(receipt: SolStructuredOutputRuntimeReceipt): void {
    if (
      receipt.structuredOutputMode !== 'json_schema' ||
      receipt.strict !== true ||
      receipt.providerResponseType !== 'openai.responses.parse.output_parsed' ||
      receipt.structuredResultDirect !== true ||
      receipt.manualJsonParseUsed !== false ||
      receipt.outputTextUsedAsPrimaryResult !== false
    ) {
      throw new Error('SOL_LEGACY_JSON_PARSE_PATH_ACTIVE');
    }
  }
}

export function assertSolLegacyParserSuccessPathFirewall(
  receipt: SolStructuredOutputRuntimeReceipt,
): void {
  SolLegacyParserSuccessPathFirewall.assert(receipt);
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

/** DIAGNOSTIC_ONLY: retained for private raw-response persistence, never success selection. */
function readDiagnosticRawOutputText(response: {
  output: Array<{
    type: string;
    content?: Array<{ type: string; text?: string }>;
  }>;
}): string {
  return response.output
    .filter((item) => item.type === 'message')
    .flatMap((item) => item.content ?? [])
    .find((content) => content.type === 'output_text')
    ?.text ?? '';
}

export async function executeSolDesignAnalysis(input: {
  runId: string;
  authority: SolDesignBenchReferenceAuthority;
  dataUrl: string;
  proofMode?: 'TINY_LIVE_SCHEMA_SMOKE' | 'LARGE_OUTPUT_STRESS';
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
    structuredOutputMode: 'json_schema',
    schemaName: SOL_SCHEMA_NAME,
    strict: true,
    schemaVersion: SOL_DESIGN_BENCH_SCHEMA_VERSION,
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

  const client = new OpenAI({
    apiKey,
    timeout: 12 * 60 * 1000,
    maxRetries: 0,
  });
  let body: Awaited<ReturnType<typeof client.responses.parse>>;
  try {
    body = await client.responses.parse(requestBody);
  } catch (error) {
    const status = error instanceof OpenAI.APIError ? error.status : undefined;
    const detail = error instanceof Error ? error.message : String(error);
    const classification =
      status === 400 && /\b(model|reasoning)\b/i.test(detail)
        ? 'GPT_5_6_SOL_PROVIDER_BINDING_FAILED'
        : status === 400
          ? 'OPENAI_RESPONSES_REQUEST_INVALID'
          : error instanceof OpenAI.APIError
            ? 'SOL_RUN_FAILED'
            : 'SOL_OUTPUT_VALIDATION_FAILED';
    throw new SolProviderRequestError(
      `${classification}:OPENAI_${status ?? 'PARSED_RESPONSE'}:${detail.slice(0, 240)}`,
      dispatchReceipt,
      inputReceipt,
    );
  }
  const completedDispatchReceipt: SolBenchmarkProviderDispatchReceipt = {
    ...dispatchReceipt,
    actualDispatchedModelId: SolDesignBenchModelContract.modelId,
    providerResponseId: body.id,
  };
  if (body.model !== SolDesignBenchModelContract.modelId) {
    throw new SolProviderRequestError(
      `GPT_5_6_SOL_PROVIDER_BINDING_FAILED:DISPATCHED_MODEL_${body.model || 'UNREPORTED'}`,
      completedDispatchReceipt,
      inputReceipt,
    );
  }
  const diagnosticRawText = readDiagnosticRawOutputText(body);
  const finishReason = body.incomplete_details?.reason ||
    body.output.find((row) => 'status' in row && row.status && row.status !== 'completed')?.status ||
    body.status ||
    'unreported';
  const truncated =
    body.status === 'incomplete' ||
    /(?:max_output_tokens|length|truncat|incomplete)/i.test(finishReason);
  const completenessReceipt: SolOutputCompletenessReceipt = {
    receiptType: 'SolOutputCompletenessReceipt',
    runId: input.runId,
    finishReason,
    outputCharacters: diagnosticRawText.length,
    outputTokens: typeof body.usage?.output_tokens === 'number' ? body.usage.output_tokens : null,
    truncated,
    complete: !truncated && body.status !== 'failed' && body.output_parsed != null,
  };
  if (truncated) {
    throw new SolProviderRequestError(
      `SOL_OUTPUT_TRUNCATED:${finishReason}`,
      completedDispatchReceipt,
      inputReceipt,
      null,
      completenessReceipt,
      diagnosticRawText,
    );
  }

  const parsed = body.output_parsed;
  const validation = validateSolTranslationPackage(parsed, input.authority);
  const runtimeReceipt: SolStructuredOutputRuntimeReceipt = {
    receiptType: 'SolStructuredOutputRuntimeReceipt',
    runId: input.runId,
    liveApiBuild:
      process.env.RAILWAY_GIT_COMMIT_SHA?.trim() ||
      process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
      process.env.SITE00_BUILD_ID?.trim() ||
      'unknown',
    provider: SolDesignBenchModelContract.provider,
    model: SolDesignBenchModelContract.modelId,
    reasoning: SolDesignBenchModelContract.reasoningEffort,
    structuredOutputMode: 'json_schema',
    schemaName: SOL_SCHEMA_NAME,
    strict: true,
    imageInputAttached: true,
    providerResponseType: 'openai.responses.parse.output_parsed',
    providerResponseSuccess: true,
    structuredResultDirect: true,
    manualJsonParseUsed: false,
    outputTextUsedAsPrimaryResult: false,
    schemaValidationPass: validation.valid,
  };
  assertSolLegacyParserSuccessPathFirewall(runtimeReceipt);
  const validationReceipt: SolStructuredOutputValidationReceipt = {
    receiptType: 'SolStructuredOutputValidationReceipt',
    runId: input.runId,
    model: SolDesignBenchModelContract.modelId,
    schemaVersion: SOL_DESIGN_BENCH_SCHEMA_VERSION,
    responseReceived: body.output_parsed != null,
    jsonParsePass: body.output_parsed != null,
    schemaValidationPass: validation.valid,
    missingFields: validation.missingFields,
    invalidFields: validation.invalidFields,
    rawResponsePersistedSafely: false,
    recoverable: !validation.valid && Object.keys(validation.recoveredSections).length > 0,
    repairAttempted: false,
    repairSucceeded: false,
  };
  if (!validation.valid) {
    throw new SolProviderRequestError(
      `SOL_OUTPUT_VALIDATION_FAILED:${[...validation.missingFields, ...validation.invalidFields].join(',')}`,
      completedDispatchReceipt,
      inputReceipt,
      validationReceipt,
      completenessReceipt,
      diagnosticRawText,
      validation.recoveredSections,
    );
  }
  return {
    package: parsed as FigmaStyleInterfaceTranslationPackage,
    cost: null,
    dispatchReceipt: completedDispatchReceipt,
    inputReceipt,
    runtimeReceipt,
    validationReceipt,
    completenessReceipt,
    rawProviderResponse: diagnosticRawText,
  };
}
