import type { ScreenplayDocument, ScreenplayElement, ScreenplayMeta, ScreenplayScene } from './types.js';

/**
 * Exchange screenplay format: a JSON metadata block between two `---` lines, then a Fountain subset.
 * Production notes are `[[TAG: value]]` lines (SHOT, INSERT, REACTION, FREEZE, PROP, HANDOFF, WARDROBE,
 * ENTER, EXIT, CONTINUITY, MUSIC, SFX, VFX, TIME, HOLD).
 */

const HEADING = /^(INT\.\/EXT\.|EXT\.\/INT\.|INT\.|EXT\.)\s+(.+)$/;
const NOTE = /^\[\[\s*([A-Z_]+)\s*:\s*(.*?)\s*\]\]$/;
const TRANSITION = /^(?:>\s*)?([A-Z][A-Z .]*(?:TO:|OUT\.|IN:|TO BLACK\.))$/;
const CUE = /^([A-Z][A-Z0-9 .'\-]*?[A-Z0-9.])(?:\s*\((V\.O\.|O\.S\.|O\.C\.|CONT'D)\))?(\s*\^)?$/;

export class ScreenplayParseError extends Error {}

function splitHeading(rest: string): { location: string; subLocation: string | null; timeOfDay: string } {
  const parts = rest.split(/\s+[—–-]\s+/).map((p) => p.trim());
  if (parts.length < 2) throw new ScreenplayParseError(`Scene heading needs a time of day: ${rest}`);
  const timeOfDay = parts[parts.length - 1];
  return { location: parts[0], subLocation: parts.length > 2 ? parts.slice(1, -1).join(' — ') : null, timeOfDay };
}

export function parseExchangeScreenplay(source: string, sourcePath = '<memory>'): ScreenplayDocument {
  const text = source.replace(/\r\n/g, '\n');
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new ScreenplayParseError(`${sourcePath}: missing metadata block`);
  let meta: ScreenplayMeta;
  try {
    meta = JSON.parse(m[1]) as ScreenplayMeta;
  } catch (err) {
    throw new ScreenplayParseError(`${sourcePath}: metadata is not valid JSON (${(err as Error).message})`);
  }
  const releaseId = meta.identity?.releaseId ?? 'UNKNOWN';
  const scenes: ScreenplayScene[] = [];
  const blocks = m[2].split(/\n\s*\n/).map((b) => b.split('\n').map((l) => l.trimEnd()).filter((l) => l.trim() !== ''));
  let lineNo = 0;

  for (const block of blocks) {
    if (!block.length) continue;
    const first = block[0].trim();
    const heading = first.match(HEADING);
    if (heading) {
      const number = scenes.length + 1;
      scenes.push({
        sceneId: `${releaseId}-SC${String(number).padStart(2, '0')}`,
        number,
        heading: first,
        intExt: heading[1],
        ...splitHeading(heading[2]),
        elements: [],
      });
      if (block.length > 1) throw new ScreenplayParseError(`${sourcePath}: scene heading must stand alone: ${first}`);
      continue;
    }
    const scene = scenes[scenes.length - 1];
    if (!scene) {
      if (block.length === 1 && TRANSITION.test(first)) continue;
      throw new ScreenplayParseError(`${sourcePath}: content before the first scene heading: ${first}`);
    }
    if (block.every((l) => NOTE.test(l.trim()))) {
      for (const l of block) {
        const n = l.trim().match(NOTE)!;
        scene.elements.push({ kind: 'note', tag: n[1], value: n[2] });
      }
      continue;
    }
    if (block.length === 1 && TRANSITION.test(first)) {
      scene.elements.push({ kind: 'transition', text: first.replace(/^>\s*/, '') });
      continue;
    }
    const cue = first.match(CUE);
    if (cue && block.length >= 2 && first === first.toUpperCase() && !NOTE.test(block[1].trim())) {
      const character = cue[1].trim();
      const extension = cue[2] ?? null;
      const dual = Boolean(cue[3]);
      let parenthetical: string | null = null;
      let buffer: string[] = [];
      const flush = () => {
        if (!buffer.length && !parenthetical) return;
        lineNo += 1;
        const el: ScreenplayElement = {
          kind: 'dialogue',
          lineId: `${releaseId}-L${String(lineNo).padStart(3, '0')}`,
          character,
          extension,
          parenthetical,
          text: buffer.join(' ').trim(),
          dual,
        };
        scene.elements.push(el);
        buffer = [];
        parenthetical = null;
      };
      for (const raw of block.slice(1)) {
        const l = raw.trim();
        if (/^\(.*\)$/.test(l)) {
          if (buffer.length) flush();
          parenthetical = l.slice(1, -1);
        } else buffer.push(l);
      }
      flush();
      continue;
    }
    scene.elements.push({ kind: 'action', text: block.map((l) => l.trim()).join('\n') });
  }
  if (!scenes.length) throw new ScreenplayParseError(`${sourcePath}: no scenes`);
  return { meta, scenes, sourcePath };
}

export function dialogueLines(doc: ScreenplayDocument) {
  return doc.scenes.flatMap((s) =>
    s.elements.filter((e): e is Extract<ScreenplayElement, { kind: 'dialogue' }> => e.kind === 'dialogue').map((e) => ({ ...e, sceneId: s.sceneId })),
  );
}

export function notes(doc: ScreenplayDocument, tag?: string) {
  return doc.scenes.flatMap((s) =>
    s.elements
      .filter((e): e is Extract<ScreenplayElement, { kind: 'note' }> => e.kind === 'note' && (!tag || e.tag === tag))
      .map((e) => ({ ...e, sceneId: s.sceneId })),
  );
}
