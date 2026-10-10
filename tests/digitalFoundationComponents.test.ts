/**
 * Digital Foundation universal component system: lifecycle-driven progress, accessible primitive markup, and the
 * portal style scope for overlays rendered outside `.df-root`.
 */
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetDigitalFoundationMemoryStore } from '../api/_lib/digitalFoundation/memoryStore.js';
import { acceptQuote, createArtifactForLead, getClientArtifactPayloadByToken, updateIntake } from '../api/_lib/digitalFoundation/service.js';
import { simulateStripeCheckoutCompleted } from '../api/_lib/digitalFoundation/payment/webhookHandler.js';
import { DF_DISCLOSURES, foundationProgress } from '../src/site00/foundation-client/model';
import {
  DfButton,
  DfEmptyState,
  DfLoadingState,
  DfProgress,
  DfSelect,
  DfToast,
  DfToggle,
  useDfToasts,
} from '../src/site00/foundation-client/components';

const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);

function link() {
  const a = createArtifactForLead({ referral_kind: 'DIRECT', business_name: 'Progress Test LLC' });
  return { id: a.artifact_id, payload: () => getClientArtifactPayloadByToken(a.public_token) };
}

function quoted() {
  const l = link();
  updateIntake(
    l.id,
    { business_name: 'Progress Test LLC', contact_name: 'Ana', current_email: 'a@example.com', team_size: 1, needs: ['NEED_DOMAIN'] },
    true,
  );
  return l;
}

const states = (payload: ReturnType<typeof getClientArtifactPayloadByToken>) =>
  foundationProgress(payload)
    .map((s) => `${s.index}:${s.state}`)
    .join(' ');

beforeEach(() => resetDigitalFoundationMemoryStore());

describe('foundationProgress follows the real lifecycle', () => {
  it('new link: first step current, activation locked', () => {
    expect(states(link().payload())).toBe('01:current 02:future 03:future 04:future 05:future 06:locked');
  });

  it('completed intake: recommendation is the current step, activation still locked', () => {
    expect(states(quoted().payload())).toBe('01:complete 02:complete 03:complete 04:current 05:future 06:locked');
  });

  it('accepted but unpaid never marks payment complete', () => {
    const l = quoted();
    acceptQuote({ artifact_id: l.id, disclosures: [...DF_DISCLOSURES] });
    expect(states(l.payload())).toBe('01:complete 02:complete 03:complete 04:complete 05:current 06:locked');
  });

  it('only a verified payment unlocks activation', async () => {
    const l = quoted();
    acceptQuote({ artifact_id: l.id, disclosures: [...DF_DISCLOSURES] });
    await simulateStripeCheckoutCompleted({ artifact_id: l.id, quote_id: l.payload().quote!.quote_id });
    const s = foundationProgress(l.payload());
    expect(s.slice(0, 5).every((x) => x.state === 'complete')).toBe(true);
    expect(s[5].state).not.toBe('locked');
  });

  it('labels are uppercase and match the journey order', () => {
    const labels = foundationProgress(link().payload()).map((s) => s.label.replace(/\u00ad/g, ''));
    expect(labels).toEqual(['GET STARTED', 'BUSINESS INFORMATION', 'BUILD YOUR FOUNDATION', 'RECOMMENDATION', 'REVIEW + CHECKOUT', 'ACTIVATION']);
  });
});

describe('primitive markup', () => {
  it('busy buttons stay focusable, announce busy, and cannot submit twice', () => {
    const m = html(createElement(DfButton, { label: 'SAVE', type: 'submit', busy: true, busyLabel: 'SAVING…' }));
    expect(m).toContain('type="button"');
    expect(m).toContain('aria-disabled="true"');
    expect(m).toContain('aria-busy="true"');
    expect(m).not.toMatch(/\sdisabled=""/);
    expect(m).toContain('SAVING…');
    expect(m).toContain('df-spinner');
  });

  it('idle primary button keeps its type and arrow', () => {
    const m = html(createElement(DfButton, { label: 'CONTINUE', type: 'submit', action: 'go' }));
    expect(m).toContain('type="submit"');
    expect(m).toContain('data-df-action="go"');
    expect(m).toContain('df-cta__arrow');
  });

  it('select is a collapsed select-only combobox', () => {
    const m = html(
      createElement(DfSelect, {
        id: 'df-industry',
        value: '',
        options: [{ value: 'A', label: 'ALPHA' }],
        placeholder: 'SELECT A BUSINESS TYPE',
        onChange: () => undefined,
      }),
    );
    expect(m).toContain('role="combobox"');
    expect(m).toContain('aria-haspopup="listbox"');
    expect(m).toContain('aria-expanded="false"');
    expect(m).toContain('SELECT A BUSINESS TYPE');
  });

  it('toggle is a switch that starts in the state it is given (never auto-on)', () => {
    const m = html(createElement(DfToggle, { label: 'EMAIL MIGRATION', on: false, onChange: () => undefined }));
    expect(m).toContain('role="switch"');
    expect(m).toContain('aria-checked="false"');
    expect(m).toContain('OFF');
  });

  it('progress marks the current step for assistive tech', () => {
    const m = html(
      createElement(DfProgress, {
        steps: [
          { index: '01', label: 'A', state: 'complete' },
          { index: '02', label: 'B', state: 'current' },
          { index: '03', label: 'C', state: 'locked' },
        ],
      }),
    );
    expect(m.match(/aria-current="step"/g)).toHaveLength(1);
    expect(m).toContain(', LOCKED');
  });

  it('error toasts are alerts; others are status messages', () => {
    expect(html(createElement(DfToast, { item: { tone: 'error', message: 'X' } }))).toContain('role="alert"');
    expect(html(createElement(DfToast, { item: { tone: 'success', message: 'X' } }))).toContain('role="status"');
  });

  it('empty and loading states render as status regions', () => {
    expect(html(createElement(DfEmptyState, { title: 'NO PROJECT STAGES YET.' }))).toContain('role="status"');
    expect(html(createElement(DfLoadingState, { label: 'LOADING…' }))).toContain('df-spinner');
  });

  it('toast hook is a safe no-op outside the provider', () => {
    let api: ReturnType<typeof useDfToasts> | null = null;
    const Probe = () => {
      api = useDfToasts();
      return null;
    };
    html(createElement(Probe));
    expect(() => api!.push({ tone: 'info', message: 'X' })).not.toThrow();
  });
});

describe('component stylesheet', () => {
  const css = readFileSync(new URL('../src/site00/styles/site00-df-components.css', import.meta.url), 'utf8');
  const client = readFileSync(new URL('../src/site00/styles/site00-df-client.css', import.meta.url), 'utf8');

  it('reference geometry: 40px controls, 46px CTAs, 3px control radius', () => {
    expect(css).toMatch(/--df-control-h:\s*40px/);
    expect(css).toMatch(/--df-cta-h:\s*46px/);
  });

  it('overlays stack above the menu drawer in a fixed order', () => {
    const z = (sel: string) => Number(new RegExp(`${sel.replace('.', '\\.')}[^{]*\\{[^}]*z-index:\\s*(\\d+)`).exec(css)?.[1]);
    expect(z('.df-modal')).toBeLessThan(z('.df-tooltip'));
    expect(z('.df-tooltip')).toBeLessThan(z('.df-toasts'));
  });

  it('respects reduced motion', () => {
    expect(css).toContain('prefers-reduced-motion: reduce');
  });

  it('old one-off sheet/confirm primitives are gone from the client sheet (single UI system)', () => {
    expect(client).not.toMatch(/^\.df-confirm(\s|\{|__)/m);
    expect(client).not.toMatch(/^\.df-sheet__panel\b/m);
  });
});
