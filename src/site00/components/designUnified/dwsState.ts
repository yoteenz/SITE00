/**
 * DESIGN UNIFIED WORKSPACE — expression state.
 * Drawers, inspectors, modals, compare, library, review and export are STATES of one workspace (never pages).
 * The underlying mode + selection survive every overlay open/close.
 */
import {
  DWS_EXPRESSION,
  DWS_MODES,
  type DwsDrawerId,
  type DwsExportFormat,
  type DwsInspectorId,
  type DwsMode,
  type DwsModalId,
  type DwsStatus,
} from './dwsModel';

export type DwsDecision = { status: DwsStatus; comments: string[]; annotations: number; note?: string };

export type DwsState = {
  mode: DwsMode;
  drawer: DwsDrawerId | null;
  inspector: DwsInspectorId | null;
  modal: DwsModalId | null;
  /** Selected artifact per mode (survives mode switches). */
  selected: Partial<Record<DwsMode, string>>;
  /** Board brought forward on the stage. */
  forward: string | null;
  compare: string[];
  filter: Record<string, string>;
  search: Record<string, string>;
  inspectorTab: Record<string, string>;
  decisions: Record<string, DwsDecision>;
  pipelineStage: Partial<Record<DwsMode, number>>;
  tableSelected: string | null;
  exportFormat: DwsExportFormat;
  exportOpts: { transparent: boolean; variants: boolean; optimize: boolean; resolution: string };
  synth: { family: string; inputs: string[]; generated: boolean };
  library: string[];
  deleted: string[];
  duplicates: string[];
  activity: { id: string; text: string; when: string }[];
  toast: string | null;
  pathStep: number;
  /** Mobile: which open layer is shown (null = top-most). Layers never stack on phones, but every layer stays reachable. */
  layer: 'drawer' | 'inspector' | 'modal' | null;
};

export const DWS_INITIAL: DwsState = {
  mode: 'brand',
  drawer: null,
  inspector: null,
  modal: null,
  selected: {},
  forward: null,
  compare: ['desktop'],
  filter: {},
  search: {},
  inspectorTab: {},
  decisions: {},
  pipelineStage: {},
  tableSelected: null,
  exportFormat: 'png',
  exportOpts: { transparent: true, variants: true, optimize: false, resolution: '4X (4096 × 4096)' },
  synth: { family: 'interaction', inputs: ['in-1'], generated: false },
  library: [],
  deleted: [],
  duplicates: [],
  activity: [],
  toast: null,
  pathStep: 2,
  layer: null,
};

export type DwsAction =
  | { type: 'MODE_SWITCH'; mode: DwsMode }
  | { type: 'OPEN_DRAWER'; drawer: DwsDrawerId }
  | { type: 'CLOSE_DRAWER' }
  | { type: 'OPEN_INSPECTOR'; inspector: DwsInspectorId }
  | { type: 'CLOSE_INSPECTOR' }
  | { type: 'OPEN_MODAL'; modal: DwsModalId }
  | { type: 'CLOSE_MODAL' }
  | { type: 'OPEN_EXPRESSION' }
  | { type: 'SELECT_ARTIFACT'; id: string; openInspector?: boolean }
  | { type: 'BRING_FORWARD'; id: string | null }
  | { type: 'COMPARE'; id: string }
  | { type: 'OPEN_LIBRARY' }
  | { type: 'FILTER'; scope: string; value: string }
  | { type: 'SEARCH'; scope: string; value: string }
  | { type: 'INSPECTOR_TAB'; scope: string; value: string }
  | { type: 'ANNOTATE'; id: string }
  | { type: 'COMMENT'; id: string; text: string }
  | { type: 'APPROVE'; id: string }
  | { type: 'REQUEST_CHANGES'; id: string }
  | { type: 'REJECT'; id: string }
  | { type: 'CHOOSE'; id: string }
  | { type: 'ADD_TO_LIBRARY'; id: string }
  | { type: 'EXPORT'; id: string }
  | { type: 'SET_EXPORT_FORMAT'; format: DwsExportFormat }
  | { type: 'SET_EXPORT_OPT'; key: 'transparent' | 'variants' | 'optimize' | 'resolution'; value: boolean | string }
  | { type: 'DUPLICATE'; id: string }
  | { type: 'DELETE'; id: string }
  | { type: 'SYNTH_FAMILY'; family: string }
  | { type: 'SYNTH_INPUT'; input: string }
  | { type: 'GENERATE' }
  | { type: 'SEND_FOR_REVIEW'; id: string; note: string }
  | { type: 'PATH_STEP'; step: number }
  | { type: 'RETURN_TO_OVERVIEW' }
  | { type: 'PIPELINE_STAGE_SELECT'; index: number }
  | { type: 'ON_YOUR_TABLE_SELECT'; id: string; modal: DwsModalId }
  | { type: 'DISMISS_TOAST' }
  | { type: 'SET_LAYER'; layer: 'drawer' | 'inspector' | 'modal' }
  | { type: 'HYDRATE'; value: Partial<DwsState> };

const stamp = () => 'JUST NOW';
const decide = (s: DwsState, id: string, status: DwsStatus, text: string): DwsState => {
  const prev = s.decisions[id] ?? { status: 'PENDING REVIEW' as DwsStatus, comments: [], annotations: 0 };
  return {
    ...s,
    decisions: { ...s.decisions, [id]: { ...prev, status } },
    activity: [{ id: `${id}.${s.activity.length}`, text, when: stamp() }, ...s.activity].slice(0, 30),
    toast: text,
  };
};

export function dwsReducer(s: DwsState, a: DwsAction): DwsState {
  switch (a.type) {
    case 'HYDRATE':
      return { ...s, ...a.value, drawer: null, inspector: null, modal: null, layer: null, toast: null };
    case 'MODE_SWITCH':
      if (!DWS_MODES.includes(a.mode)) return s;
      // Overlays belong to the mode they were opened in; the host + selection stay stable.
      return { ...s, mode: a.mode, drawer: null, inspector: null, modal: null, forward: null, layer: null };
    case 'OPEN_DRAWER':
      return { ...s, drawer: a.drawer, layer: 'drawer' };
    case 'CLOSE_DRAWER':
      return { ...s, drawer: null, layer: s.layer === 'drawer' ? null : s.layer };
    case 'OPEN_INSPECTOR':
      return { ...s, inspector: a.inspector, layer: 'inspector' };
    case 'CLOSE_INSPECTOR':
      return { ...s, inspector: null, layer: s.layer === 'inspector' ? null : s.layer };
    case 'OPEN_MODAL':
      return { ...s, modal: a.modal, layer: 'modal' };
    case 'CLOSE_MODAL':
      return { ...s, modal: null, layer: s.layer === 'modal' ? null : s.layer };
    case 'SET_LAYER':
      return { ...s, layer: a.layer };
    case 'OPEN_EXPRESSION': {
      const e = DWS_EXPRESSION[s.mode];
      return { ...s, drawer: e.drawer, inspector: e.inspector, modal: e.modal, layer: 'modal' };
    }
    case 'OPEN_LIBRARY':
      return { ...s, drawer: DWS_EXPRESSION[s.mode].drawer };
    case 'SELECT_ARTIFACT':
      return {
        ...s,
        selected: { ...s.selected, [s.mode]: a.id },
        inspector: a.openInspector === false ? s.inspector : DWS_EXPRESSION[s.mode].inspector,
        layer: a.openInspector === false ? s.layer : 'inspector',
      };
    case 'BRING_FORWARD':
      return { ...s, forward: a.id };
    case 'COMPARE': {
      const has = s.compare.includes(a.id);
      const next = has ? s.compare.filter((x) => x !== a.id) : [...s.compare, a.id];
      return { ...s, compare: next.length ? next : s.compare };
    }
    case 'FILTER':
      return { ...s, filter: { ...s.filter, [a.scope]: a.value } };
    case 'SEARCH':
      return { ...s, search: { ...s.search, [a.scope]: a.value } };
    case 'INSPECTOR_TAB':
      return { ...s, inspectorTab: { ...s.inspectorTab, [a.scope]: a.value } };
    case 'ANNOTATE': {
      const prev = s.decisions[a.id] ?? { status: 'PENDING REVIEW' as DwsStatus, comments: [], annotations: 0 };
      return { ...s, decisions: { ...s.decisions, [a.id]: { ...prev, annotations: prev.annotations + 1 } }, toast: 'ANNOTATION ADDED' };
    }
    case 'COMMENT': {
      const text = a.text.trim();
      if (!text) return s;
      const prev = s.decisions[a.id] ?? { status: 'PENDING REVIEW' as DwsStatus, comments: [], annotations: 0 };
      return { ...s, decisions: { ...s.decisions, [a.id]: { ...prev, comments: [...prev.comments, text.toUpperCase()] } }, toast: 'COMMENT ADDED' };
    }
    case 'APPROVE':
      return { ...decide(s, a.id, 'APPROVED', 'APPROVED'), modal: null, layer: s.layer === 'modal' ? null : s.layer };
    case 'REQUEST_CHANGES':
      return { ...decide(s, a.id, 'CHANGES REQUESTED', 'CHANGES REQUESTED'), modal: null, layer: s.layer === 'modal' ? null : s.layer };
    case 'REJECT':
      return { ...decide(s, a.id, 'REJECTED', 'REJECTED'), modal: null, layer: s.layer === 'modal' ? null : s.layer };
    case 'CHOOSE':
      return { ...decide(s, a.id, 'APPROVED', 'OPTION CHOSEN'), modal: null, layer: s.layer === 'modal' ? null : s.layer };
    case 'ADD_TO_LIBRARY':
      return s.library.includes(a.id) ? s : { ...s, library: [...s.library, a.id], toast: 'ADDED TO LIBRARY' };
    case 'SET_EXPORT_FORMAT':
      return { ...s, exportFormat: a.format };
    case 'SET_EXPORT_OPT':
      return { ...s, exportOpts: { ...s.exportOpts, [a.key]: a.value } };
    case 'EXPORT':
      return {
        ...s,
        modal: null,
        layer: s.layer === 'modal' ? null : s.layer,
        activity: [{ id: `exp.${s.activity.length}`, text: `EXPORT QUEUED · ${s.exportFormat.toUpperCase()}`, when: stamp() }, ...s.activity].slice(0, 30),
        toast: `EXPORT QUEUED · ${s.exportFormat.toUpperCase()}`,
      };
    case 'DUPLICATE':
      return { ...s, duplicates: [...s.duplicates, a.id], toast: 'ASSET DUPLICATED' };
    case 'DELETE':
      return {
        ...s,
        deleted: s.deleted.includes(a.id) ? s.deleted : [...s.deleted, a.id],
        selected: { ...s.selected, [s.mode]: undefined },
        inspector: null,
        modal: null,
        layer: null,
        toast: 'ASSET DELETED',
      };
    case 'SYNTH_FAMILY':
      return { ...s, synth: { ...s.synth, family: a.family, generated: false } };
    case 'SYNTH_INPUT': {
      const has = s.synth.inputs.includes(a.input);
      const inputs = has ? s.synth.inputs.filter((x) => x !== a.input) : [...s.synth.inputs, a.input];
      return { ...s, synth: { ...s.synth, inputs: inputs.length ? inputs : s.synth.inputs, generated: false } };
    }
    case 'GENERATE':
      return { ...s, synth: { ...s.synth, generated: true }, inspector: 'project-intelligence', layer: 'inspector', toast: 'EXPRESSION GENERATED' };
    case 'SEND_FOR_REVIEW': {
      const next = decide(s, a.id, 'IN REVIEW', 'SENT FOR REVIEW');
      const prev = next.decisions[a.id]!;
      return { ...next, modal: null, layer: next.layer === 'modal' ? null : next.layer, decisions: { ...next.decisions, [a.id]: { ...prev, note: a.note.toUpperCase() } } };
    }
    case 'PATH_STEP':
      return { ...s, pathStep: Math.max(0, a.step) };
    case 'RETURN_TO_OVERVIEW':
      return { ...s, drawer: null, inspector: null, modal: null, forward: null, layer: null };
    case 'PIPELINE_STAGE_SELECT':
      return { ...s, pipelineStage: { ...s.pipelineStage, [s.mode]: a.index } };
    case 'ON_YOUR_TABLE_SELECT':
      return { ...s, tableSelected: a.id, modal: a.modal, layer: 'modal' };
    case 'DISMISS_TOAST':
      return { ...s, toast: null };
    default:
      return s;
  }
}

/* ---- persistence (device-local; no backend contract is touched) ---- */

const KEY = (slug: string) => `site00.dws.v1.${slug}`;
const PERSISTED = ['mode', 'selected', 'decisions', 'library', 'deleted', 'duplicates', 'activity', 'pipelineStage'] as const;

export function loadDws(slug: string): Partial<DwsState> {
  try {
    const raw = window.localStorage.getItem(KEY(slug));
    return raw ? (JSON.parse(raw) as Partial<DwsState>) : {};
  } catch {
    return {};
  }
}

export function saveDws(slug: string, s: DwsState): void {
  try {
    const out: Record<string, unknown> = {};
    for (const k of PERSISTED) out[k] = s[k];
    window.localStorage.setItem(KEY(slug), JSON.stringify(out));
  } catch {
    /* storage unavailable — workspace still works for the session */
  }
}
