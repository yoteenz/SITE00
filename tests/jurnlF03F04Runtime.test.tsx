/**
 * F03 TODAY and F04 ACTIVITY live families.
 * Screen authorities are reference files. They are not the runtime plate.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { evaluateFamilyGate } from '../shared/site00-product-families/familyGate';
import { JURNL_F03_CONTRACT } from '../src/projects/jurnl/data/f03/contract';
import { JURNL_F03_COVERAGE } from '../src/projects/jurnl/data/f03/coverage';
import { JURNL_F04_CONTRACT } from '../src/projects/jurnl/data/f04/contract';
import { JURNL_F04_COVERAGE } from '../src/projects/jurnl/data/f04/coverage';
import { currencyByCode, formatAmountInput, formatMoney, resetCurrency } from '../src/projects/jurnl/data/home/currency';
import { safeToSpend } from '../src/projects/jurnl/data/home/money';
import JurnlRuntimeRoot from '../src/projects/jurnl/runtime/JurnlRuntimeRoot';
import { resolveJurnlRoute } from '../src/projects/jurnl/runtime/state/store';
import { projectFamilies } from '../src/projects/families';

const BASE = '/production/jurnl/runtime';

function renderRuntime(route: string, query = '') {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [`${BASE}/${route}${query ? `?${query}` : ''}`] },
      createElement(Routes, null, createElement(Route, { path: '/production/:projectSlug/runtime/*', element: createElement(JurnlRuntimeRoot, { basePath: BASE, mode: 'design-preview' }) })),
    ),
  );
}

const visibleText = (html: string) => html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');

describe('F03 and F04 live routes', () => {
  it('formats money with the active currency symbol', () => {
    resetCurrency();
    expect(formatMoney(86)).toBe('$86');
    expect(formatMoney(1800)).toBe('$1,800');
    expect(formatMoney(6500)).toBe('$6,500');
    expect(formatMoney(3200, true)).toBe('+$3,200');
    expect(formatMoney(-86)).toBe('-$86');
    expect(formatMoney(1800, false, currencyByCode('EUR'))).toBe('€1.800');
    expect(formatMoney(86, false, currencyByCode('GBP'))).toBe('£86');
    expect(formatAmountInput('58885')).toBe('58,885');
    expect(formatAmountInput('12.5')).toBe('12.5');
  });

  it('keeps F01 and F02 ahead of the new families', () => {
    const families = projectFamilies('jurnl');
    expect(families.map((f) => f.contract.familyId)).toEqual(['F01', 'F02', 'F03', 'F04']);
    expect(families[2]!.contract.familyName).toBe('TODAY');
    expect(families[3]!.contract.familyName).toBe('ACTIVITY');
    expect(families[2]!.contract.founderApproval.approved).toBe(false);
    expect(families[3]!.contract.founderApproval.approved).toBe(false);
  });

  it('resolves the family boundary and does not invent later product routes', () => {
    expect(resolveJurnlRoute('F03')).toBe('today');
    expect(resolveJurnlRoute('F04')).toBe('activity');
    expect(resolveJurnlRoute('F05')).toBe('money');
    expect(resolveJurnlRoute('F02.08')).toBe('setup/ready');
  });

  it('renders today on the day plate with a derived signal', () => {
    const html = renderRuntime('today');
    const signal = safeToSpend();
    expect(html).toContain('data-jrn-screen="F03.00"');
    expect(html).toContain('data-asset-id="TODAY.ENVIRONMENT.DAY.001"');
    expect(html).toContain('SAFE TO SPEND');
    expect(html).toContain('A COMPUTED SIGNAL');
    expect(html).toContain('PREVIEW');
    expect(html).toContain(formatMoney(signal.value));
    expect(html).toContain('data-jrn-zone="intro"');
    expect(html).toContain('data-jrn-zone="content-rail"');
    expect(html).toContain('data-jrn-zone="bottom-nav"');
    expect(html).not.toContain('F03.00_TODAY_PARENT');
    expect(html).not.toContain('AUTHORITIES');
    expect(visibleText(html).match(/[a-z]/g)).toBeNull();
  });

  it('supports empty, partial, error, and see why', () => {
    expect(renderRuntime('today', 'state=empty')).toContain('NO ACCOUNTS YET');
    expect(renderRuntime('today', 'state=partial')).toContain('STILL LEARNING');
    expect(renderRuntime('today', 'state=error')).toContain('COULD NOT READ TODAY');
    expect(renderRuntime('today', 'state=loading')).toContain('READING TODAY');
    expect(renderRuntime('today', 'state=caught_up')).toContain('ALL CAUGHT UP');
    const why = renderRuntime('today', 'overlay=see-why');
    expect(why).toContain('data-jrn-overlay="see-why"');
    expect(why).toContain('data-jrn-expression="analysis"');
    expect(why).toContain('CASH POSITION');
    expect(why).toContain('DERIVED');
    expect(visibleText(why).match(/[a-z]/g)).toBeNull();
  });

  it('opens activity from the shared ledger and keeps search and filter on the page', () => {
    const html = renderRuntime('activity');
    expect(html).toContain('data-jrn-screen="F04.00"');
    expect(html).toContain('data-asset-id="ACTIVITY.ENVIRONMENT.LEDGER.001"');
    expect(html).toContain('data-jrn-tx="tx-atelier"');
    expect(html).toContain('data-jrn-tx="tx-rent"');
    expect(html).toContain('PENDING');
    expect(html).toContain('data-jrn-trigger="activity-search"');
    expect(html).toContain('data-jrn-trigger="activity-filter"');
    expect(html).not.toContain('F04.00_ACTIVITY_PARENT');
    expect(visibleText(html).match(/[a-z]/g)).toBeNull();
    expect(renderRuntime('activity', 'state=empty')).toContain('NO MOVEMENT YET');
    expect(html).not.toContain('ALL ACCOUNTS');
    expect(renderRuntime('activity', 'state=no_results')).toContain('NO MATCHES');
    expect(renderRuntime('activity', 'state=no_results')).toContain('NOTHING IN THIS LEDGER FITS');
    expect(renderRuntime('activity', 'state=error')).toContain('COULD NOT READ ACTIVITY');
    const filter = renderRuntime('activity', 'overlay=filter');
    expect(filter).toContain('data-jrn-overlay="activity-filter-sheet"');
    expect(filter).toContain('data-jrn-expression="filter"');
    expect(renderRuntime('activity')).toContain('data-jrn-panel="ledger"');
    expect(renderRuntime('today', 'overlay=quick-add')).toContain('data-jrn-expression="form"');
    expect(filter).toContain('DIRECTION');
  });

  it('keeps money, plan, and credit as boundaries', () => {
    expect(renderRuntime('money')).toContain('data-jrn-screen="F05.BOUNDARY"');
    expect(renderRuntime('money')).toContain('NOT OPEN YET');
    expect(renderRuntime('plan')).toContain('data-jrn-screen="F08.BOUNDARY"');
    expect(renderRuntime('credit')).toContain('data-jrn-screen="F12.BOUNDARY"');
  });

  it('makes quick add selection real and shows the currency mark', () => {
    resetCurrency();
    const html = renderRuntime('today', 'overlay=quick-add');
    expect(html).toContain('data-jrn-trigger="quick-add-expense"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('jrn-field__prefix');
    expect(html).toContain('disabled');
  });

  it('offers display currency from the global ask sheet without exchange', () => {
    const html = renderRuntime('activity', 'overlay=ask');
    expect(html).toContain('DISPLAY CURRENCY');
    expect(html).toContain('NO EXCHANGE');
    expect(html).toContain('data-jrn-trigger="currency-usd"');
    expect(html).toContain('data-jrn-trigger="currency-eur"');
  });

  it('does not mount a screen authority from the live screens', () => {
    const root = readFileSync(path.resolve('src/projects/jurnl/runtime/screens/HomeScreens.tsx'), 'utf8');
    expect(root).not.toContain('AUTHORITIES');
    expect(root).not.toContain('TODAY_PARENT');
    expect(root).not.toContain('ACTIVITY_PARENT');
  });

  it('gates both families while founder approval stays open', () => {
    const f03 = evaluateFamilyGate(JURNL_F03_CONTRACT, JURNL_F03_COVERAGE);
    const f04 = evaluateFamilyGate(JURNL_F04_CONTRACT, JURNL_F04_COVERAGE);
    expect(f03.gate.SCREENS_READY).toBe('PASS');
    expect(f03.gate.STATES_READY).toBe('PASS');
    expect(f03.gate.INTERACTIONS_READY).toBe('PASS');
    expect(f03.familyComplete).toBe(false);
    expect(f04.gate.QA_READY).toBe('PASS');
    expect(f04.familyComplete).toBe(false);
    expect(JURNL_F03_CONTRACT.generationBudget!.creditsBefore).toBe(35063);
    expect(JURNL_F04_CONTRACT.generationBudget!.creditsAfter).toBe(32501);
  });

  it('inherits reference-binding policy on F03/F04 ledgers', () => {
    const f03 = JSON.parse(readFileSync(path.resolve('src/projects/jurnl/families/F03_TODAY/MANIFEST/F03_GENERATION_LEDGER.json'), 'utf8'));
    const f04 = JSON.parse(readFileSync(path.resolve('src/projects/jurnl/families/F04_ACTIVITY/MANIFEST/F04_GENERATION_LEDGER.json'), 'utf8'));
    expect(f03.reference_binding_policy).toBe('REQUIRED_WHEN_AVAILABLE');
    expect(f04.ledger_schema_version).toBe('2.0.0');
    const postmortem = f03.generations.find((g: { dispatch_status?: string }) => g.dispatch_status === 'INVALID_GENERATION_POSTMORTEM');
    expect(postmortem?.failure_class).toBe('REFERENCE_BINDING_FAILURE');
  });
});
