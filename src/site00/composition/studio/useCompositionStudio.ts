import { useCallback, useMemo, useReducer, useRef } from 'react';
import type { CompositionZone, NormalizedRect } from '../types';
import {
  canRedo,
  canUndo,
  createHistoryState,
  pushHistory,
  redoHistory,
  undoHistory,
  type HistoryState,
} from './history';
import { clampNormalizedRect } from './coordinates';
import { saveCompositionDocument, loadCompositionDocument } from './storage';
import type {
  CompositionEditorMode,
  CompositionStudioDocument,
  CompositionStudioObject,
  CompositionValidationOverride,
  CompositionWorkflowStatus,
  RecompositionRequest,
  StudioViewportPreset,
} from './types';
import { hasBlockingErrors, validateCompositionDocument } from './validation';
import { newZoneId } from './types';

type StudioAction =
  | { type: 'REPLACE'; doc: CompositionStudioDocument }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SELECT'; id: string | null }
  | { type: 'SET_MODE'; mode: CompositionEditorMode }
  | { type: 'SET_VIEWPORT'; viewport: StudioViewportPreset }
  | { type: 'UPDATE_OBJECT'; id: string; patch: Partial<CompositionStudioObject> }
  | { type: 'UPDATE_OBJECT_RECT'; id: string; rect: NormalizedRect; commit?: boolean }
  | { type: 'UPDATE_ZONE'; id: string; patch: Partial<CompositionZone> }
  | { type: 'ADD_ZONE'; zone: CompositionZone }
  | { type: 'DELETE_ZONE'; id: string }
  | { type: 'SET_FOCAL'; index: number; x: number; y: number }
  | { type: 'SET_CROP_ANCHOR'; x: number; y: number }
  | { type: 'TOGGLE_VISIBILITY'; id: string }
  | { type: 'TOGGLE_LOCK'; id: string }
  | { type: 'REORDER'; id: string; direction: 'up' | 'down' }
  | { type: 'DUPLICATE'; id: string }
  | { type: 'DELETE_OBJECT'; id: string }
  | { type: 'REQUEST_RECOMPOSE'; id: string; targetBounds: NormalizedRect }
  | { type: 'OVERRIDE_FINDING'; findingId: string; note?: string }
  | { type: 'SET_STATUS'; status: CompositionWorkflowStatus; versionLabel?: CompositionStudioDocument['versionLabel'] };

type StudioState = {
  history: HistoryState;
  selectedId: string | null;
  mode: CompositionEditorMode;
  viewport: StudioViewportPreset;
  dirty: boolean;
};

function withTimestamp(doc: CompositionStudioDocument): CompositionStudioDocument {
  return { ...doc, updatedAt: new Date().toISOString() };
}

function reducer(state: StudioState, action: StudioAction): StudioState {
  const commit = (doc: CompositionStudioDocument) => ({
    ...state,
    history: pushHistory(state.history, withTimestamp(doc)),
    dirty: true,
  });

  const present = state.history.present;

  switch (action.type) {
    case 'REPLACE':
      return {
        ...state,
        history: createHistoryState(action.doc),
        dirty: false,
        selectedId: null,
      };
    case 'UNDO':
      return { ...state, history: undoHistory(state.history), dirty: true };
    case 'REDO':
      return { ...state, history: redoHistory(state.history), dirty: true };
    case 'SELECT':
      return { ...state, selectedId: action.id };
    case 'SET_MODE':
      return { ...state, mode: action.mode };
    case 'SET_VIEWPORT':
      return { ...state, viewport: action.viewport };
    case 'UPDATE_OBJECT': {
      const objects = present.objects.map((o) =>
        o.id === action.id ? { ...o, ...action.patch } : o,
      );
      return commit({ ...present, objects, status: present.status === 'ORIGINAL_ANALYSIS' ? 'DRAFT' : present.status, versionLabel: 'EDITED_DRAFT' });
    }
    case 'UPDATE_OBJECT_RECT': {
      const objects = present.objects.map((o) =>
        o.id === action.id ? { ...o, rect: clampNormalizedRect(action.rect) } : o,
      );
      const next = { ...present, objects, status: present.status === 'ORIGINAL_ANALYSIS' ? 'DRAFT' : present.status, versionLabel: 'EDITED_DRAFT' as const };
      if (action.commit === false) {
        return { ...state, history: { ...state.history, present: withTimestamp(next) } };
      }
      return commit(next);
    }
    case 'UPDATE_ZONE': {
      const zones = present.zones.map((z) => (z.id === action.id ? { ...z, ...action.patch } : z));
      return commit({ ...present, zones, status: 'DRAFT', versionLabel: 'EDITED_DRAFT' });
    }
    case 'ADD_ZONE':
      return commit({ ...present, zones: [...present.zones, action.zone], status: 'DRAFT', versionLabel: 'EDITED_DRAFT' });
    case 'DELETE_ZONE':
      return commit({
        ...present,
        zones: present.zones.filter((z) => z.id !== action.id),
        status: 'DRAFT',
        versionLabel: 'EDITED_DRAFT',
      });
    case 'SET_FOCAL': {
      const focalPoints = present.focalPoints.map((fp, i) =>
        i === action.index ? { ...fp, x: action.x, y: action.y } : fp,
      );
      return commit({ ...present, focalPoints, status: 'DRAFT', versionLabel: 'EDITED_DRAFT' });
    }
    case 'SET_CROP_ANCHOR':
      return commit({
        ...present,
        cropAnchor: { ...present.cropAnchor, x: action.x, y: action.y },
        status: 'DRAFT',
        versionLabel: 'EDITED_DRAFT',
      });
    case 'TOGGLE_VISIBILITY': {
      const objects = present.objects.map((o) =>
        o.id === action.id ? { ...o, visible: !o.visible } : o,
      );
      return commit({ ...present, objects, status: 'DRAFT', versionLabel: 'EDITED_DRAFT' });
    }
    case 'TOGGLE_LOCK': {
      const objects = present.objects.map((o) =>
        o.id === action.id ? { ...o, positionLocked: !o.positionLocked } : o,
      );
      return commit({ ...present, objects });
    }
    case 'REORDER': {
      const sorted = [...present.objects].sort((a, b) => a.zIndex - b.zIndex);
      const idx = sorted.findIndex((o) => o.id === action.id);
      if (idx < 0) return state;
      const swap = action.direction === 'up' ? idx + 1 : idx - 1;
      if (swap < 0 || swap >= sorted.length) return state;
      const a = sorted[idx]!;
      const b = sorted[swap]!;
      const objects = present.objects.map((o) => {
        if (o.id === a.id) return { ...o, zIndex: b.zIndex };
        if (o.id === b.id) return { ...o, zIndex: a.zIndex };
        return o;
      });
      return commit({ ...present, objects, status: 'DRAFT', versionLabel: 'EDITED_DRAFT' });
    }
    case 'DUPLICATE': {
      const src = present.objects.find((o) => o.id === action.id);
      if (!src || src.sourceType === 'environment-baked') return state;
      const copy: CompositionStudioObject = {
        ...structuredClone(src),
        id: `${src.id}-copy-${Date.now().toString(36)}`,
        label: `${src.label} (copy)`,
        rect: clampNormalizedRect({ ...src.rect, x: src.rect.x + 0.02, y: src.rect.y + 0.02 }),
        zIndex: src.zIndex + 1,
      };
      return commit({ ...present, objects: [...present.objects, copy], status: 'DRAFT', versionLabel: 'EDITED_DRAFT' });
    }
    case 'DELETE_OBJECT': {
      const target = present.objects.find((o) => o.id === action.id);
      if (!target || target.sourceType === 'environment-baked') return state;
      return commit({
        ...present,
        objects: present.objects.filter((o) => o.id !== action.id),
        status: 'DRAFT',
        versionLabel: 'EDITED_DRAFT',
      });
    }
    case 'REQUEST_RECOMPOSE': {
      const objects = present.objects.map((o) => {
        if (o.id !== action.id || o.sourceType !== 'environment-baked') return o;
        const req: RecompositionRequest = {
          environmentId: present.environmentId,
          objectLabel: o.label,
          sourceBounds: o.rect,
          targetBounds: clampNormalizedRect(action.targetBounds),
          preserve: ['architecture', 'camera', 'lighting', 'materials'],
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        return { ...o, recompositionRequest: req };
      });
      return commit({ ...present, objects, status: 'DRAFT', versionLabel: 'EDITED_DRAFT' });
    }
    case 'OVERRIDE_FINDING': {
      const override: CompositionValidationOverride = {
        findingId: action.findingId,
        approvedAt: new Date().toISOString(),
        note: action.note,
      };
      return commit({
        ...present,
        validationOverrides: [...present.validationOverrides.filter((o) => o.findingId !== action.findingId), override],
      });
    }
    case 'SET_STATUS':
      return commit({
        ...present,
        status: action.status,
        versionLabel: action.versionLabel ?? present.versionLabel,
      });
    default:
      return state;
  }
}

export type UseCompositionStudioOptions = {
  initialDocument: CompositionStudioDocument;
  containerWidth: number;
  containerHeight: number;
};

export function useCompositionStudio({
  initialDocument,
  containerWidth,
  containerHeight,
}: UseCompositionStudioOptions) {
  const persisted = loadCompositionDocument(initialDocument.environmentId);
  const seedDoc = persisted ?? initialDocument;

  const [state, dispatch] = useReducer(reducer, {
    history: createHistoryState(seedDoc),
    selectedId: null,
    mode: 'edit' as CompositionEditorMode,
    viewport: 'mobile' as StudioViewportPreset,
    dirty: false,
  });

  const dragSessionRef = useRef<{ id: string; startRect: NormalizedRect } | null>(null);

  const doc = state.history.present;
  const selected = doc.objects.find((o) => o.id === state.selectedId) ?? null;

  const findings = useMemo(
    () => validateCompositionDocument(doc, containerWidth, containerHeight),
    [doc, containerWidth, containerHeight],
  );

  const saveDraft = useCallback(() => {
    const draft = withTimestamp({ ...doc, status: 'DRAFT', versionLabel: 'EDITED_DRAFT' });
    saveCompositionDocument(draft);
    dispatch({ type: 'REPLACE', doc: draft });
  }, [doc]);

  const sendForApproval = useCallback(() => {
    if (hasBlockingErrors(findings)) return false;
    const next = withTimestamp({ ...doc, status: 'COMPOSITION_REVIEW', versionLabel: 'EDITED_DRAFT' });
    saveCompositionDocument(next);
    dispatch({ type: 'REPLACE', doc: next });
    dispatch({ type: 'SET_MODE', mode: 'review' });
    return true;
  }, [doc, findings]);

  const approveComposition = useCallback(() => {
    const next = withTimestamp({ ...doc, status: 'APPROVED', versionLabel: 'APPROVED_COMPOSITION' });
    saveCompositionDocument(next);
    dispatch({ type: 'REPLACE', doc: next });
  }, [doc]);

  const lockComposition = useCallback(() => {
    const next = withTimestamp({ ...doc, status: 'COMPOSITION_LOCKED', versionLabel: 'LOCKED_COMPOSITION' });
    saveCompositionDocument(next);
    dispatch({ type: 'REPLACE', doc: next });
  }, [doc]);

  const createRevision = useCallback(() => {
    const next = withTimestamp({
      ...structuredClone(doc),
      id: `comp-${doc.environmentId}-${Date.now()}`,
      status: 'DRAFT',
      versionLabel: 'EDITED_DRAFT',
      parentDocumentId: doc.id,
      validationOverrides: [],
    });
    saveCompositionDocument(next);
    dispatch({ type: 'REPLACE', doc: next });
    dispatch({ type: 'SET_MODE', mode: 'edit' });
  }, [doc]);

  const addZone = useCallback(() => {
    dispatch({
      type: 'ADD_ZONE',
      zone: {
        id: newZoneId(),
        type: 'preferred',
        role: 'custom',
        label: 'New Zone',
        rect: { x: 0.1, y: 0.4, width: 0.3, height: 0.15 },
      },
    });
  }, []);

  return {
    doc,
    selected,
    selectedId: state.selectedId,
    mode: state.mode,
    viewport: state.viewport,
    dirty: state.dirty,
    findings,
    canUndo: canUndo(state.history),
    canRedo: canRedo(state.history),
    dispatch,
    dragSessionRef,
    saveDraft,
    sendForApproval,
    approveComposition,
    lockComposition,
    createRevision,
    addZone,
  };
}

export type CompositionStudioController = ReturnType<typeof useCompositionStudio>;
