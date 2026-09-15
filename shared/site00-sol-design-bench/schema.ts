import type {
  FigmaStyleInterfaceTranslationPackage,
  SolDesignBenchReferenceAuthority,
} from './contracts.js';

export const SOL_DESIGN_BENCH_SCHEMA_VERSION = 'figma-interface-translation-v1' as const;

export const SOL_TRANSLATION_PACKAGE_KEYS = [
  'VISUAL_INTERFACE_PREVIEW',
  'PAGE_FRAME_SPEC',
  'SECTION_TREE',
  'COMPONENT_TREE',
  'LAYOUT_GEOMETRY_SPEC',
  'TYPOGRAPHY_SYSTEM',
  'COLOR_SYSTEM',
  'SPACING_SYSTEM',
  'BORDER_RADIUS_SURFACE_SYSTEM',
  'ASSET_PLACEMENT_MAP',
  'CONTROL_STATE_SYSTEM',
  'VISUAL_HIERARCHY_MAP',
  'IMPLEMENTATION_HANDOFF',
  'DO_NOT_CHANGE_RULES',
] as const;

const boundsSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['x', 'y', 'width', 'height'],
  properties: {
    x: { type: 'number' },
    y: { type: 'number' },
    width: { type: 'number' },
    height: { type: 'number' },
  },
} as const;

const stringArray = (maxItems: number) => ({
  type: 'array',
  maxItems,
  items: { type: 'string' },
});

const tokenArray = {
  type: 'array',
  maxItems: 80,
  items: {
    type: 'object',
    additionalProperties: false,
    required: ['role', 'value', 'usage'],
    properties: {
      role: { type: 'string' },
      value: { type: 'string' },
      usage: { type: 'string' },
    },
  },
} as const;

/**
 * OpenAI Responses strict-schema contract. Every object is closed and every
 * property is required; nullable fields represent visually unsupported data.
 */
export const FigmaStyleInterfaceTranslationPackageSchema = {
  type: 'object',
  additionalProperties: false,
  required: [...SOL_TRANSLATION_PACKAGE_KEYS],
  properties: {
    VISUAL_INTERFACE_PREVIEW: {
      type: 'object',
      additionalProperties: false,
      required: ['artboardWidth', 'artboardHeight', 'background', 'componentIds', 'renderingNotes', 'visualPreviewRef'],
      properties: {
        artboardWidth: { type: 'number', minimum: 1 },
        artboardHeight: { type: 'number', minimum: 1 },
        background: { type: 'string' },
        componentIds: stringArray(250),
        renderingNotes: stringArray(30),
        visualPreviewRef: { type: 'string' },
      },
    },
    PAGE_FRAME_SPEC: {
      type: 'object',
      additionalProperties: false,
      required: ['frame', 'contentBounds', 'background', 'outerMargins', 'grid', 'columns', 'gutters', 'verticalRhythm'],
      properties: {
        frame: {
          type: 'object',
          additionalProperties: false,
          required: ['width', 'height'],
          properties: { width: { type: 'number' }, height: { type: 'number' } },
        },
        contentBounds: boundsSchema,
        background: { type: 'string' },
        outerMargins: boundsSchema,
        grid: { type: 'string' },
        columns: { type: 'number', minimum: 1, maximum: 64 },
        gutters: { type: 'number', minimum: 0 },
        verticalRhythm: { type: 'number', minimum: 0 },
      },
    },
    SECTION_TREE: {
      type: 'array',
      maxItems: 120,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'parentId', 'label', 'level', 'order', 'bounds'],
        properties: {
          id: { type: 'string' },
          parentId: { type: ['string', 'null'] },
          label: { type: 'string' },
          level: { type: 'string', enum: ['PAGE', 'SECTION', 'GROUP', 'COMPONENT'] },
          order: { type: 'integer', minimum: 0 },
          bounds: boundsSchema,
        },
      },
    },
    COMPONENT_TREE: {
      type: 'array',
      minItems: 1,
      maxItems: 250,
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'componentId', 'parentId', 'label', 'semanticRole', 'visualRole', 'siblingOrder',
          'x', 'y', 'width', 'height', 'normalizedBounds', 'layoutMode', 'alignment',
          'padding', 'gap', 'visualPriority', 'style', 'text', 'assetId', 'state',
        ],
        properties: {
          componentId: { type: 'string' },
          parentId: { type: ['string', 'null'] },
          label: { type: 'string' },
          semanticRole: { type: 'string' },
          visualRole: { type: 'string' },
          siblingOrder: { type: 'integer', minimum: 0 },
          x: { type: 'number' },
          y: { type: 'number' },
          width: { type: 'number', minimum: 0 },
          height: { type: 'number', minimum: 0 },
          normalizedBounds: boundsSchema,
          layoutMode: { type: 'string' },
          alignment: { type: 'string' },
          padding: { type: ['number', 'string'] },
          gap: { type: ['number', 'string'] },
          visualPriority: { type: 'string', enum: ['DOMINANT', 'SECONDARY', 'TERTIARY'] },
          style: {
            type: 'object',
            additionalProperties: false,
            required: ['background', 'color', 'border', 'borderRadius', 'fontSize', 'fontWeight', 'lineHeight', 'textAlign'],
            properties: {
              background: { type: ['string', 'null'] },
              color: { type: ['string', 'null'] },
              border: { type: ['string', 'null'] },
              borderRadius: { type: ['number', 'null'] },
              fontSize: { type: ['number', 'null'] },
              fontWeight: { type: ['number', 'null'] },
              lineHeight: { type: ['number', 'null'] },
              textAlign: { type: ['string', 'null'] },
            },
          },
          text: { type: ['string', 'null'] },
          assetId: { type: ['string', 'null'] },
          state: { type: ['string', 'null'] },
        },
      },
    },
    LAYOUT_GEOMETRY_SPEC: {
      type: 'object',
      additionalProperties: false,
      required: ['relations', 'baselines', 'anchors', 'stacking', 'overlaps', 'repeatedDimensions'],
      properties: {
        relations: stringArray(100),
        baselines: stringArray(50),
        anchors: stringArray(50),
        stacking: stringArray(50),
        overlaps: stringArray(30),
        repeatedDimensions: stringArray(50),
      },
    },
    TYPOGRAPHY_SYSTEM: {
      type: 'array',
      maxItems: 50,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['role', 'familyClassification', 'size', 'weight', 'lineHeight', 'tracking', 'casing', 'alignment', 'widthConstraint', 'lineCount', 'wrapping'],
        properties: {
          role: { type: 'string' },
          familyClassification: { type: 'string' },
          size: { type: 'number' },
          weight: { type: 'number' },
          lineHeight: { type: 'number' },
          tracking: { type: 'number' },
          casing: { type: 'string' },
          alignment: { type: 'string' },
          widthConstraint: { type: ['number', 'null'] },
          lineCount: { type: 'integer', minimum: 1 },
          wrapping: { type: 'string' },
        },
      },
    },
    COLOR_SYSTEM: tokenArray,
    SPACING_SYSTEM: {
      type: 'object',
      additionalProperties: false,
      required: ['pageMargin', 'sectionSpacing', 'panelPadding', 'componentGaps', 'textRhythm', 'rowSpacing', 'controlSpacing'],
      properties: {
        pageMargin: { type: 'number' },
        sectionSpacing: stringArray(30),
        panelPadding: stringArray(30),
        componentGaps: stringArray(50),
        textRhythm: stringArray(30),
        rowSpacing: stringArray(30),
        controlSpacing: stringArray(30),
      },
    },
    BORDER_RADIUS_SURFACE_SYSTEM: {
      type: 'object',
      additionalProperties: false,
      required: ['borders', 'radii', 'fills', 'shadows', 'separators', 'stateTreatments', 'nestedSurfaceHierarchy'],
      properties: {
        borders: tokenArray,
        radii: tokenArray,
        fills: tokenArray,
        shadows: tokenArray,
        separators: tokenArray,
        stateTreatments: tokenArray,
        nestedSurfaceHierarchy: stringArray(40),
      },
    },
    ASSET_PLACEMENT_MAP: {
      type: 'array',
      maxItems: 100,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['assetRole', 'componentId', 'bounds', 'aspectRatio', 'cropBehavior', 'focalPosition', 'frameBackground', 'visualWeight', 'sourceReferenceRegion'],
        properties: {
          assetRole: { type: 'string' },
          componentId: { type: 'string' },
          bounds: boundsSchema,
          aspectRatio: { type: 'number', minimum: 0 },
          cropBehavior: { type: 'string' },
          focalPosition: { type: 'string' },
          frameBackground: { type: 'string' },
          visualWeight: { type: 'string', enum: ['DOMINANT', 'SECONDARY', 'TERTIARY'] },
          sourceReferenceRegion: { type: 'string' },
        },
      },
    },
    CONTROL_STATE_SYSTEM: {
      type: 'array',
      maxItems: 100,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['componentId', 'state', 'evidence'],
        properties: {
          componentId: { type: 'string' },
          state: { type: 'string', enum: ['PRIMARY', 'SECONDARY', 'TERTIARY', 'SELECTED', 'ACTIVE', 'LOCKED', 'DISABLED', 'NEUTRAL'] },
          evidence: { type: 'string' },
        },
      },
    },
    VISUAL_HIERARCHY_MAP: {
      type: 'array',
      maxItems: 150,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['componentId', 'semanticRole', 'visualWeight', 'dominanceRank', 'contrastWeight', 'areaWeight', 'typographicWeight', 'positionalProminence', 'accentContribution'],
        properties: {
          componentId: { type: 'string' },
          semanticRole: { type: 'string' },
          visualWeight: { type: 'string', enum: ['DOMINANT', 'SECONDARY', 'TERTIARY'] },
          dominanceRank: { type: 'integer', minimum: 1 },
          contrastWeight: { type: 'number', minimum: 0, maximum: 1 },
          areaWeight: { type: 'number', minimum: 0, maximum: 1 },
          typographicWeight: { type: 'number', minimum: 0, maximum: 1 },
          positionalProminence: { type: 'number', minimum: 0, maximum: 1 },
          accentContribution: { type: 'number', minimum: 0, maximum: 1 },
        },
      },
    },
    IMPLEMENTATION_HANDOFF: {
      type: 'object',
      additionalProperties: false,
      required: ['handoffType', 'executionIntent', 'sourceAuthoritySha256', 'inventionBudget', 'targetFrame', 'orderedBuildInstructions', 'componentContracts', 'tokenContracts', 'assetBindings', 'acceptanceChecks', 'composerInvoked'],
      properties: {
        handoffType: { type: 'string', enum: ['SolComposerImplementationHandoff'] },
        executionIntent: { type: 'string', enum: ['REFERENCE_TRANSLATION'] },
        sourceAuthoritySha256: { type: 'string', pattern: '^[a-f0-9]{64}$' },
        inventionBudget: { type: 'string', enum: ['NONE'] },
        targetFrame: {
          type: 'object',
          additionalProperties: false,
          required: ['width', 'height'],
          properties: { width: { type: 'number' }, height: { type: 'number' } },
        },
        orderedBuildInstructions: stringArray(100),
        componentContracts: stringArray(250),
        tokenContracts: stringArray(120),
        assetBindings: stringArray(100),
        acceptanceChecks: stringArray(100),
        composerInvoked: { type: 'boolean', enum: [false] },
      },
    },
    DO_NOT_CHANGE_RULES: stringArray(100),
  },
} as const;

export interface SolSchemaValidationResult {
  valid: boolean;
  missingFields: string[];
  invalidFields: string[];
  recoveredSections: Partial<FigmaStyleInterfaceTranslationPackage>;
}

function matchesType(value: unknown, type: string): boolean {
  if (type === 'null') return value === null;
  if (type === 'array') return Array.isArray(value);
  if (type === 'object') return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  if (type === 'integer') return Number.isInteger(value);
  return typeof value === type;
}

function validateSchemaNode(
  value: unknown,
  schema: Record<string, unknown>,
  path: string,
  invalidFields: string[],
): void {
  const types = Array.isArray(schema.type) ? schema.type as string[] : [schema.type as string];
  if (!types.some((type) => matchesType(value, type))) {
    invalidFields.push(`${path}:type`);
    return;
  }
  if (Array.isArray(schema.enum) && !schema.enum.some((entry) => Object.is(entry, value))) {
    invalidFields.push(`${path}:enum`);
  }
  if (typeof value === 'number') {
    if (typeof schema.minimum === 'number' && value < schema.minimum) invalidFields.push(`${path}:minimum`);
    if (typeof schema.maximum === 'number' && value > schema.maximum) invalidFields.push(`${path}:maximum`);
  }
  if (typeof value === 'string' && typeof schema.pattern === 'string' && !new RegExp(schema.pattern).test(value)) {
    invalidFields.push(`${path}:pattern`);
  }
  if (Array.isArray(value)) {
    if (typeof schema.minItems === 'number' && value.length < schema.minItems) invalidFields.push(`${path}:minItems`);
    if (typeof schema.maxItems === 'number' && value.length > schema.maxItems) invalidFields.push(`${path}:maxItems`);
    if (schema.items && typeof schema.items === 'object') {
      value.forEach((entry, index) =>
        validateSchemaNode(entry, schema.items as Record<string, unknown>, `${path}[${index}]`, invalidFields));
    }
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const row = value as Record<string, unknown>;
    const properties = (schema.properties ?? {}) as Record<string, Record<string, unknown>>;
    const required = (schema.required ?? []) as string[];
    for (const key of required) {
      if (!(key in row)) invalidFields.push(`${path}.${key}:required`);
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(row)) {
        if (!(key in properties)) invalidFields.push(`${path}.${key}:additional`);
      }
    }
    for (const [key, childSchema] of Object.entries(properties)) {
      if (key in row) validateSchemaNode(row[key], childSchema, `${path}.${key}`, invalidFields);
    }
  }
}

export function validateSolTranslationPackage(
  value: unknown,
  authority: SolDesignBenchReferenceAuthority,
): SolSchemaValidationResult {
  const missingFields: string[] = [];
  const invalidFields: string[] = [];
  const row = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
  if (!row) {
    return { valid: false, missingFields: [...SOL_TRANSLATION_PACKAGE_KEYS], invalidFields: ['$'], recoveredSections: {} };
  }
  for (const key of SOL_TRANSLATION_PACKAGE_KEYS) {
    if (!(key in row)) missingFields.push(key);
  }
  validateSchemaNode(
    row,
    FigmaStyleInterfaceTranslationPackageSchema as unknown as Record<string, unknown>,
    '$',
    invalidFields,
  );
  const preview = row.VISUAL_INTERFACE_PREVIEW as Record<string, unknown> | undefined;
  if (JSON.stringify(row.VISUAL_INTERFACE_PREVIEW ?? {}).includes('data:image')) {
    invalidFields.push('VISUAL_INTERFACE_PREVIEW.embeddedDataUrl');
  }
  const handoff = row.IMPLEMENTATION_HANDOFF as Record<string, unknown> | undefined;
  if (handoff?.sourceAuthoritySha256 !== authority.sha256) {
    invalidFields.push('IMPLEMENTATION_HANDOFF.sourceAuthoritySha256');
  }
  const recoveredSections = Object.fromEntries(
    SOL_TRANSLATION_PACKAGE_KEYS
      .filter((key) => key in row)
      .map((key) => [key, row[key]]),
  ) as Partial<FigmaStyleInterfaceTranslationPackage>;
  return {
    valid: missingFields.length === 0 && invalidFields.length === 0,
    missingFields,
    invalidFields,
    recoveredSections,
  };
}
