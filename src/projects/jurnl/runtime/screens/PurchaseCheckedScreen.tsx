/** F10 purchase-check results. Three states over the Safe to Spend plate. */

import { useSearchParams } from 'react-router-dom';
import { classifyPurchaseCheck, type PurchaseCheckTone } from '../../data/f10/purchaseCheck';
import { createPurchase } from '../../data/f10/purchasesStore';
import { formatMoney, useCurrency } from '../../data/home/money';
import terracePlate from '../../families/F09_SAFE/ENVIRONMENTS/F09_ENVIRONMENT_AUTHORITY_TERRACE.png';
import fashionThumb from '../../families/F10_PURCHASES/THUMBS/fashion.jpg';
import diningThumb from '../../families/F10_PURCHASES/THUMBS/dining.jpg';
import travelThumb from '../../families/F10_PURCHASES/THUMBS/travel.jpg';
import { JurnlProductNav } from '../components/ProductNav';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { useJurnl } from '../state/store';
import { JurnlScreen } from './JurnlScreen';

const THROUGH = 'AVAILABLE THROUGH OCT 18';

/** Terrace without the parent folder. The folder is baked into the Safe to Spend plate. */
const PLATE = {
  family: 'F09',
  scene: 'ENV.TERRACE',
  src: terracePlate,
  assetId: 'SAFE.ENVIRONMENT.AUTHORITY_TERRACE.001',
  width: 2016,
  height: 3584,
};

const COPY: Record<PurchaseCheckTone, { title: string; sub: string; notice: string; primary: string; secondary: string }> = {
  FIT: {
    title: 'YOU’RE GOOD TO GO',
    sub: 'THIS PURCHASE FITS WITH YOUR PLAN.',
    notice: 'IMPACT ON YOUR PLAN',
    primary: 'DONE',
    secondary: 'ADD ANOTHER PURCHASE',
  },
  CHECK_IN: {
    title: 'A QUICK CHECK-IN',
    sub: 'THIS PURCHASE IS A BIT HIGHER THAN USUAL FOR THIS CATEGORY.',
    notice: 'HERE’S WHAT WE NOTICED',
    primary: 'CONTINUE ANYWAY',
    secondary: 'EDIT PURCHASE',
  },
  OVER: {
    title: 'THIS DOESN’T FIT YOUR PLAN',
    sub: 'THIS PURCHASE WOULD PUT YOU OVER YOUR SAFE TO SPEND AMOUNT.',
    notice: 'IMPACT ON YOUR PLAN',
    primary: 'ADJUST PLAN',
    secondary: 'EDIT PURCHASE',
  },
};

function thumbFor(category: string): string {
  if (category === 'DINING' || category === 'GROCERIES' || category === 'WELLNESS') return diningThumb;
  if (category === 'TRAVEL' || category === 'TRANSPORT' || category === 'EVENTS') return travelThumb;
  return fashionThumb;
}

function Sprig() {
  return (
    <svg className="jrn-f10c__sprig" viewBox="0 0 72 28" aria-hidden>
      <path d="M6 22c10-1 16-8 20-16" fill="none" stroke="#3e4b36" strokeWidth="1.2" />
      <ellipse cx="22" cy="12" rx="9" ry="3.4" transform="rotate(-28 22 12)" fill="#4d5c42" />
      <ellipse cx="34" cy="9" rx="8" ry="3" transform="rotate(18 34 9)" fill="#5d6c4c" />
      <ellipse cx="14" cy="17" rx="7" ry="2.8" transform="rotate(-52 14 17)" fill="#3c4a34" />
      <ellipse cx="42" cy="13" rx="6" ry="2.4" transform="rotate(42 42 13)" fill="#6a7a58" />
    </svg>
  );
}

function Leaf() {
  return (
    <svg className="jrn-f10c__leaf" viewBox="0 0 28 36" aria-hidden>
      <path d="M14 34c0-10 1-18 8-26-10 1-16 8-18 18 4-2 8-4 10-8" fill="none" stroke="#3e4b36" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M8 16c3 1 6 4 7 8" fill="none" stroke="#3e4b36" strokeWidth="1.1" />
    </svg>
  );
}

function Badge({ tone }: { tone: PurchaseCheckTone }) {
  if (tone === 'CHECK_IN') {
    return (
      <span className="jrn-f10c__badge" data-tone={tone} aria-hidden>
        <b>!</b>
      </span>
    );
  }
  if (tone === 'OVER') {
    return (
      <span className="jrn-f10c__badge" data-tone={tone} aria-hidden>
        <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="#f6f3ee" strokeWidth="1.8" strokeLinecap="round" /></svg>
      </span>
    );
  }
  return (
    <span className="jrn-f10c__badge" data-tone={tone} aria-hidden>
      <svg viewBox="0 0 24 24"><path d="M5 12.5 10 17.5 19 7" fill="none" stroke="#f6f3ee" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}

export function PurchaseCheckedScreen() {
  const { go, openOverlay, closeOverlay, overlay } = useJurnl();
  const [params] = useSearchParams();
  useCurrency();
  const amount = Number(params.get('amount') ?? '0');
  const category = (params.get('category') ?? 'OTHER').trim().toUpperCase() || 'OTHER';
  const pay = (params.get('pay') ?? 'CHECKING').trim().toUpperCase() || 'CHECKING';
  const result = classifyPurchaseCheck(amount, category);
  const copy = COPY[result.tone];
  const body = result.tone === 'CHECK_IN'
    ? `THIS PURCHASE IS HIGHER THAN YOUR AVERAGE ${category} SPEND, BUT YOU STILL HAVE ROOM IN YOUR PLAN.`
    : result.tone === 'OVER'
      ? `THIS PURCHASE EXCEEDS YOUR CURRENT SAFE TO SPEND AMOUNT BY ${formatMoney(result.overBy)}. YOU CAN ADJUST YOUR PLAN OR CHOOSE A DIFFERENT AMOUNT.`
      : 'THIS PURCHASE KEEPS YOU ON TRACK. YOUR UPDATED SAFE TO SPEND AMOUNT IS:';
  const figureNote = result.tone === 'OVER' ? 'OVER YOUR SAFE TO SPEND' : THROUGH;

  const onPrimary = () => {
    if (result.tone === 'OVER') {
      go('plan');
      return;
    }
    if (result.tone === 'CHECK_IN' && amount > 0) {
      createPurchase({ title: category, target_amount: amount });
    }
    go('safe');
  };
  const onSecondary = () => go('purchases');

  return (
    <JurnlScreen screenId="F10.CHECKED" familyPlate={PLATE} family productNav>
      <div className="jrn-f10c" data-jrn-authority="F10-PURCHASE-CHECKED" data-tone={result.tone}>
        <header className="jrn-f10c__brand">
          <div className="jrn-f10c__lockup">
            <Sprig />
            <p className="jrn-f10c__word">JURNL</p>
            <p className="jrn-f10c__desc">FINANCIAL LIFE.<br />BEAUTIFULLY ORGANIZED.</p>
          </div>
          <p className="jrn-f10c__tag">PLAN TODAY.<br />GROW FREELY.</p>
        </header>
        <section className="jrn-f10c__verdict" aria-label="PURCHASE CHECKED">
          <p className="jrn-f10c__kicker">PURCHASE CHECKED</p>
          <h1>{copy.title}</h1>
          <p className="jrn-f10c__sub">{copy.sub}</p>
        </section>
        <div className="jrn-f10c__stack">
          <Badge tone={result.tone} />
          <article className="jrn-f10c__card">
            <div className="jrn-f10c__buy">
              <img className="jrn-f10c__photo" src={thumbFor(category)} alt="" />
              <dl>
                <div>
                  <dt>AMOUNT</dt>
                  <dd>{formatMoney(Number.isFinite(amount) ? amount : 0)}</dd>
                </div>
                <div>
                  <dt>CATEGORY</dt>
                  <dd>{category}</dd>
                </div>
                <div className="jrn-f10c__pay">
                  <div>
                    <dt>PAY WITH</dt>
                    <dd>{pay}</dd>
                  </div>
                  <span className="jrn-f10c__chip" aria-hidden><i /></span>
                </div>
              </dl>
            </div>
            <div className="jrn-f10c__impact">
              <Leaf />
              <div className="jrn-f10c__impact-copy">
                <p className="jrn-f10c__notice">{copy.notice}</p>
                <p>{body}</p>
              </div>
              <div className="jrn-f10c__figure" data-tone={result.tone}>
                <b>{formatMoney(result.after)}</b>
                <span>{figureNote}</span>
              </div>
            </div>
          </article>
        </div>
        <div className="jrn-f10c__actions">
          <button type="button" className="jrn-f10c__primary" data-jrn-trigger="purchase-checked-primary" onClick={onPrimary}>
            {copy.primary} <span aria-hidden>→</span>
          </button>
          <button type="button" className="jrn-f10c__secondary" data-jrn-trigger="purchase-checked-secondary" onClick={onSecondary}>
            {copy.secondary} <span aria-hidden>→</span>
          </button>
        </div>
      </div>
      <JurnlProductNav marks="authority" current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />
      {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F10" onClose={closeOverlay} /> : null}
      {overlay === 'ask' ? <AskJurnlSheet familyId="F10" nodeId="F10.CHECKED" onClose={closeOverlay} /> : null}
    </JurnlScreen>
  );
}
