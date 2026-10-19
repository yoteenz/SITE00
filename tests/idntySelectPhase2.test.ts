/**
 * IDNTY Phase 2 — IdntySelect sheet/listbox, Business Type parity, presentation rules.
 */
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BUSINESS_TYPES,
  intakeFromDraft,
  type IntakeDraft,
} from '../src/site00/foundation-client/model';
import { IdntySelect, businessTypeSelectOptions, dfCustomIndustrySelectEnabled } from '../src/site00/foundation-client/idntySelect';
import { P02Intake } from '../src/site00/foundation-client/parents/EntryIntake';

const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);

function mockMatchMedia(coarseNarrow: boolean) {
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        media: query,
        matches: coarseNarrow && query.includes('pointer: coarse') && query.includes('max-width: 600px'),
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }) as MediaQueryList,
  );
}

const blankDraft: IntakeDraft = {
  business_name: '',
  industry: '',
  contact_name: '',
  current_email: '',
  phone: '',
  existing_domain: '',
  existing_registrar: '',
  existing_email_provider: '',
  team_size: 1,
  domainPath: null,
  needs: [],
};

describe('businessTypeSelectOptions', () => {
  it('lists every BUSINESS_TYPES value unchanged', () => {
    const opts = businessTypeSelectOptions('');
    expect(opts.map((o) => o.value)).toEqual([...BUSINESS_TYPES]);
  });

  it('preserves legacy stored values with an on-file row', () => {
    const legacy = 'CUSTOM LEGACY CO';
    const opts = businessTypeSelectOptions(legacy);
    expect(opts[0].value).toBe(legacy);
    expect(opts[0].label).toContain('ON FILE');
    expect(opts.slice(1).map((o) => o.value)).toEqual([...BUSINESS_TYPES]);
  });
});

describe('IdntySelect markup', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('renders DfSelect listbox on fine pointer layouts', () => {
    mockMatchMedia(false);
    const m = html(
      createElement(IdntySelect, {
        id: 'df-industry',
        value: '',
        options: businessTypeSelectOptions(''),
        placeholder: 'SELECT A BUSINESS TYPE',
        onChange: () => undefined,
        sheetTitle: 'SELECT BUSINESS TYPE',
      }),
    );
    expect(m).toContain('role="combobox"');
    expect(m).toContain('role="listbox"');
    expect(m).not.toContain('idnty-sel-sheet');
  });

  it('renders sheet trigger on coarse narrow layouts', () => {
    mockMatchMedia(true);
    const m = html(
      createElement(IdntySelect, {
        id: 'df-industry',
        value: 'OTHER',
        options: businessTypeSelectOptions('OTHER'),
        placeholder: 'SELECT A BUSINESS TYPE',
        onChange: () => undefined,
        sheetTitle: 'SELECT BUSINESS TYPE',
        presentation: 'sheet',
      }),
    );
    expect(m).toContain('aria-haspopup="dialog"');
    expect(m).toContain('OTHER');
    expect(m).not.toContain('<select');
  });

  it('shows saved value in closed trigger', () => {
    mockMatchMedia(false);
    const m = html(
      createElement(IdntySelect, {
        id: 'df-x',
        value: 'RETAIL + E-COMMERCE',
        options: businessTypeSelectOptions(''),
        placeholder: 'SELECT A BUSINESS TYPE',
        onChange: () => undefined,
      }),
    );
    expect(m).toContain('RETAIL + E-COMMERCE');
  });
});

describe('intakeFromDraft industry parity', () => {
  it('round-trips each BUSINESS_TYPES string', () => {
    for (const t of BUSINESS_TYPES) {
      const draft = { ...blankDraft, industry: t };
      const payload = intakeFromDraft(draft);
      expect(payload.industry).toBe(t);
    }
  });

  it('round-trips legacy industry text', () => {
    const legacy = 'MY OLD TYPE';
    const payload = intakeFromDraft({ ...blankDraft, industry: legacy });
    expect(payload.industry).toBe(legacy);
  });
});

describe('P02 Business Type integration', () => {
  it('uses IdntySelect when custom flag enabled in dev', () => {
    if (!dfCustomIndustrySelectEnabled()) return;
    const m = html(
      createElement(P02Intake, {
        draft: blankDraft,
        update: () => undefined,
        editable: true,
        onContinue: () => undefined,
        save: null,
      }),
    );
    expect(m).not.toContain('<select');
    expect(m).toContain('id="df-industry"');
    for (const t of BUSINESS_TYPES) {
      expect(m).toContain(t);
    }
  });
});

describe('industry persistence regression (memory store)', () => {
  it('updateIntake stores OTHER and reloads from payload', async () => {
    const { resetDigitalFoundationMemoryStore } = await import('../api/_lib/digitalFoundation/memoryStore.js');
    const { createArtifactForLead, getClientArtifactPayloadByToken, updateIntake } = await import(
      '../api/_lib/digitalFoundation/service.js'
    );
    resetDigitalFoundationMemoryStore();
    const a = createArtifactForLead({ referral_kind: 'DIRECT', business_name: 'Selector Co' });
    updateIntake(
      a.artifact_id,
      {
        business_name: 'Selector Co',
        contact_name: 'Pat',
        current_email: 'p@example.com',
        industry: 'OTHER',
        team_size: 1,
        needs: [],
      },
      true,
    );
    const payload = getClientArtifactPayloadByToken(a.public_token);
    expect(payload.artifact?.intake?.industry).toBe('OTHER');
    expect(
      (await import('../src/site00/foundation-client/model.js')).draftFromPayload(payload).industry,
    ).toBe('OTHER');
  });
});

describe('Phase 2 stylesheet guards', () => {
  const css = readFileSync(new URL('../src/site00/styles/site00-df-components.css', import.meta.url), 'utf8');

  it('includes editorial sheet with 2px red threshold', () => {
    expect(css).toMatch(/\.idnty-sel-sheet__panel[\s\S]*border-top:\s*2px solid var\(--df-red\)/);
    expect(css).toMatch(/\.idnty-sel-sheet__cancel/);
  });
});
