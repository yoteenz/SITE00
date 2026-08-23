/**
 * Select safest production revision generation mode from spec + provider capabilities.
 */

import type {
  CreativeRevisionSpec,
  RevisionGenerationMode,
  RevisionSeverity,
} from './revisionTypes.js';

export type ProviderImageCapabilities = {
  imageEdit: boolean;
  referenceConditionedRegeneration: boolean;
  promptRegeneration: boolean;
  parentImageAvailable: boolean;
};

export type RevisionModeResolution = {
  mode: RevisionGenerationMode;
  reason: string;
  parentImageRequired: boolean;
};


function notesSuggestSurgicalColorChange(spec: CreativeRevisionSpec): boolean {
  const colorNote = spec.categoryNotes.color?.toLowerCase() ?? '';
  const colorChanges = spec.requestedColorChanges.join(' ').toLowerCase();
  const combined = `${colorNote} ${colorChanges}`;
  return /highlight|accent|lime|yellow|red markup|palette|color/.test(combined);
}

function notesSuggestCompositionOverhaul(spec: CreativeRevisionSpec): boolean {
  const comp = spec.categoryNotes.composition?.toLowerCase() ?? '';
  return /replace.*environment|rebuild.*scene|entire.*background|full.*composition/.test(comp);
}

function notesSuggestFullReinterpret(spec: CreativeRevisionSpec): boolean {
  const note = spec.founderOriginalNote.toLowerCase();
  return /reinterpret|completely different|new concept|start over/.test(note);
}

export function resolveRevisionGenerationMode(params: {
  spec: CreativeRevisionSpec;
  capabilities: ProviderImageCapabilities;
}): RevisionModeResolution {
  const { spec, capabilities } = params;
  const severity = spec.severity;

  if (notesSuggestFullReinterpret(spec) || severity === 'REINTERPRET') {
    if (capabilities.promptRegeneration) {
      return {
        mode: 'PROMPT_REGENERATION',
        reason: 'REINTERPRET severity or founder language requests concept reinterpretation',
        parentImageRequired: false,
      };
    }
  }

  if (notesSuggestCompositionOverhaul(spec) && severity === 'SUBSTANTIAL') {
    if (capabilities.referenceConditionedRegeneration && capabilities.parentImageAvailable) {
      return {
        mode: 'REFERENCE_CONDITIONED_REGENERATION',
        reason: 'Substantial environment/composition change with parent reference preservation',
        parentImageRequired: true,
      };
    }
    if (capabilities.promptRegeneration) {
      return {
        mode: 'PROMPT_REGENERATION',
        reason: 'Reference-conditioned unavailable — fallback prompt regeneration',
        parentImageRequired: false,
      };
    }
  }

  if (
    (severity === 'MICRO' || severity === 'TARGETED' || notesSuggestSurgicalColorChange(spec)) &&
    capabilities.imageEdit &&
    capabilities.parentImageAvailable
  ) {
    return {
      mode: 'IMAGE_EDIT',
      reason: 'Micro/targeted delta or surgical color change — prefer image edit with parent',
      parentImageRequired: true,
    };
  }

  if (
    (severity === 'SUBSTANTIAL' || severity === 'TARGETED') &&
    capabilities.referenceConditionedRegeneration &&
    capabilities.parentImageAvailable
  ) {
    return {
      mode: 'REFERENCE_CONDITIONED_REGENERATION',
      reason: 'Targeted/substantial revision with parent reference conditioning',
      parentImageRequired: true,
    };
  }

  if (capabilities.imageEdit && capabilities.parentImageAvailable) {
    return {
      mode: 'IMAGE_EDIT',
      reason: 'Default preservation-biased edit when parent image available',
      parentImageRequired: true,
    };
  }

  if (capabilities.promptRegeneration) {
    return {
      mode: 'PROMPT_REGENERATION',
      reason: 'Parent image unavailable or edit unsupported — prompt regeneration',
      parentImageRequired: false,
    };
  }

  return {
    mode: 'PROMPT_REGENERATION',
    reason: 'No provider capability matched — prompt regeneration fallback',
    parentImageRequired: false,
  };
}

export function defaultProviderCapabilities(parentImageAvailable: boolean): ProviderImageCapabilities {
  return {
    imageEdit: true,
    referenceConditionedRegeneration: true,
    promptRegeneration: true,
    parentImageAvailable,
  };
}

export function severityDefaultMode(severity: RevisionSeverity): RevisionGenerationMode {
  if (severity === 'MICRO' || severity === 'TARGETED') return 'IMAGE_EDIT';
  if (severity === 'SUBSTANTIAL') return 'REFERENCE_CONDITIONED_REGENERATION';
  return 'PROMPT_REGENERATION';
}
