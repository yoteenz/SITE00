/**
 * P0.CB.1A — NDX notebook grammar adapter (P0.5C.7 / V2.3 authority bridge).
 * Adapter-driven — not hard-coded into generic replacement engine.
 */

import type { SlideReference, SlideReconstructionSpec } from '../types.js';
import {
  MEET_NDX_SEQUENCE_ID,
  PERSONAL_BRAND_SEQUENCE_ID,
  SAVED_THIS_WEEK_SEQUENCE_ID,
} from './ndxLaunchRow01Pilot.js';

export type NotebookGrammarRecompilation = {
  physicalPageObject: string;
  pageMaterial: string;
  bindingEdge: string;
  constructionHistory: string;
  editorialPhotography: string;
  uppercaseAuthorship: string;
  handMarks: string;
  limeInterruption: string;
  evidence: string;
  negativeTemplateConstraints: string;
  grammarAuthority: 'V2.3+P0.5C.7';
  legacyPromptSnapshotReused: false;
};

const SEQUENCE_GRAMMAR_PROFILE: Record<
  string,
  { pageObject: string; material: string; binding: string; construction: string }
> = {
  [MEET_NDX_SEQUENCE_ID]: {
    pageObject: 'OPEN_NOTEBOOK spread — character/world introduction',
    material: 'NOTEBOOK_PAPER + cream handled sheets',
    binding: 'SPIRAL · BOUND_EDGE with punched holes',
    construction: 'desk portrait integrated as printed page layer → NDX margin notes → lime interruption',
  },
  [PERSONAL_BRAND_SEQUENCE_ID]: {
    pageObject: 'Torn notebook pages + black paper inserts',
    material: 'NOTEBOOK_PAPER · black sheet · cream paper as physical pages',
    binding: 'TORN_EDGE · punched holes · layered inserts',
    construction: 'POV thesis pages → editorial photo mounted on page → handwritten corrections',
  },
  [SAVED_THIS_WEEK_SEQUENCE_ID]: {
    pageObject: 'Archive notebook + receipt/clipping evidence stack',
    material: 'ARCHIVAL_PAPER · thermal receipt · clipped fragments',
    binding: 'ROUGH_CUT · tape attachments · irregular edges',
    construction: 'saved artifact entry → receipt/clipping layers → archive index marks',
  },
};

const SOURCE_TEXT_MARKERS = [/screenshot/i, /group chat/i, /receipt/i, /source:/i, /authentic source/i];

export function ndxNotebookGrammarAvailable(): boolean {
  return true;
}

export function isAuthenticSourceText(text: string): boolean {
  return SOURCE_TEXT_MARKERS.some((pattern) => pattern.test(text));
}

export function classifyNdxAuthoredCopy(text: string): { text: string; isNdxAuthored: boolean; legacyCaseMismatch: boolean } {
  if (isAuthenticSourceText(text)) {
    return { text, isNdxAuthored: false, legacyCaseMismatch: false };
  }
  const upper = text.toUpperCase();
  const legacyCaseMismatch = text !== upper && text.length > 2;
  return { text: upper, isNdxAuthored: true, legacyCaseMismatch };
}

export function recompileNotebookGrammarForSlide(params: {
  slide: SlideReference;
  sequenceId: string;
}): NotebookGrammarRecompilation {
  const profile = SEQUENCE_GRAMMAR_PROFILE[params.sequenceId] ?? SEQUENCE_GRAMMAR_PROFILE[MEET_NDX_SEQUENCE_ID]!;
  const notes = params.slide.compositionNotes.join('; ').toLowerCase();
  const notebookSignals = [
    notes.includes('notebook') || notes.includes('spiral') ? 'punched notebook holes / spiral binding' : null,
    notes.includes('torn') ? 'torn spiral edges / ripped inserts' : null,
    notes.includes('gutter') ? 'notebook gutters preserved' : null,
    notes.includes('tape') || notes.includes('clip') ? 'tape / clips as attachment evidence' : null,
    notes.includes('handwritten') ? 'handwritten corrections on page' : null,
    notes.includes('black') ? 'black page material as physical sheet' : null,
    notes.includes('cream') || notes.includes('paper') ? 'cream / lined / graph paper surfaces' : null,
    notes.includes('receipt') || notes.includes('clipping') ? 'receipt / clipping archive evidence' : null,
    notes.includes('coffee') ? 'coffee ring / handling evidence' : null,
    params.slide.hasPhotography ? 'editorial photography integrated as physical page layer' : null,
  ]
    .filter(Boolean)
    .join('; ');

  return {
    physicalPageObject: profile.pageObject,
    pageMaterial: profile.material,
    bindingEdge: profile.binding,
    constructionHistory: profile.construction,
    editorialPhotography: params.slide.hasPhotography
      ? 'Photography is part of page construction — not floating poster layer'
      : 'Typography / evidence dominant — no flattened poster',
    uppercaseAuthorship: 'ALL NDX-AUTHORED TEXT UPPERCASE — source artifacts preserve authentic case',
    handMarks: params.slide.hasAnnotations ? 'Hand marks + founder annotations as physical layer' : 'Minimal hand marks',
    limeInterruption: 'Lime restraint — interruption not decoration',
    evidence: notebookSignals || 'Physical evidence grammar from reference decomposition',
    negativeTemplateConstraints:
      'ANTI-TEMPLATE: no generic carousel poster; no background+text+photo flattening; preserve irregular edges',
    grammarAuthority: 'V2.3+P0.5C.7',
    legacyPromptSnapshotReused: false,
  };
}

export function applyNotebookGrammarToSpec(
  spec: SlideReconstructionSpec,
  _slide: SlideReference,
  grammar: NotebookGrammarRecompilation,
): SlideReconstructionSpec {
  const normalizedCopy = spec.copy.exactText.map((line) => classifyNdxAuthoredCopy(line));
  const legacyCaseMismatch = normalizedCopy.some((entry) => entry.legacyCaseMismatch);

  const grammarBlock = [
    `PHYSICAL PAGE: ${grammar.physicalPageObject}`,
    `MATERIAL: ${grammar.pageMaterial}`,
    `BINDING/EDGE: ${grammar.bindingEdge}`,
    `CONSTRUCTION: ${grammar.constructionHistory}`,
    `PHOTO: ${grammar.editorialPhotography}`,
    `UPPERCASE: ${grammar.uppercaseAuthorship}`,
    `HAND MARKS: ${grammar.handMarks}`,
    `LIME: ${grammar.limeInterruption}`,
    `EVIDENCE: ${grammar.evidence}`,
    `NEGATIVE: ${grammar.negativeTemplateConstraints}`,
  ].join('\n');

  return {
    ...spec,
    copy: {
      ...spec.copy,
      exactText: normalizedCopy.map((entry) => entry.text),
      hierarchy: normalizedCopy.map((entry) => entry.text),
    },
    surface: {
      background: grammar.pageMaterial,
      paper: grammar.physicalPageObject,
      texture: 'tactile page depth — not digital flat fill',
      material: grammar.evidence,
    },
    composition: {
      ...spec.composition,
      layoutGrammar: `${grammar.physicalPageObject} — notebook-native construction`,
      layering: grammar.editorialPhotography,
      geometry: grammar.bindingEdge,
    },
    brandSignals: [
      'NDX lime restraint',
      'P0.5C.7 notebook grammar',
      'physical page object authority',
      ...(legacyCaseMismatch ? ['LEGACY_CASE_MISMATCH'] : []),
    ],
    reconstructionPrompt: `${spec.reconstructionPrompt}\n\n--- CURRENT NOTEBOOK GRAMMAR (V2.3+P0.5C.7) ---\n${grammarBlock}`,
    founderOverrides: {
      ...spec.founderOverrides,
      notebookGrammar: grammar,
      legacyCaseMismatch,
      grammarAuthority: grammar.grammarAuthority,
    },
  };
}

export function ndxUppercaseAuthorshipPasses(spec: SlideReconstructionSpec): boolean {
  return spec.copy.exactText
    .filter((line) => !isAuthenticSourceText(line))
    .every((line) => line === line.toUpperCase());
}
