/**
 * F03 TODAY → SEE WHY. The daily money reading in the existing drawer: how Safe to Spend is made, where the money is,
 * what needs money next, and optional next steps. The TODAY parent composition stays as approved.
 */

import { formatRelativeDate, getTodayKey } from '../../data/foundation/dates';
import { useCurrency, useRepoTick } from '../../data/home/money';
import { BALANCE_BASIS_LABEL, LOCATION_KIND_LABEL } from '../../data/ledger/accounting';
import { computeTodayOperating } from '../../data/f03/todayOperating';
import { COMPLETENESS_LABEL } from '../../data/f09/safeToSpend';
import { JurnlButton, JurnlDrawer } from '../components/primitives';
import { useJurnl } from '../state/store';
import { money } from './FinanceSheets';

function Row({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return (
    <li>
      <span>{k}</span>
      <b>{v}</b>
      {sub ? <small>{sub}</small> : null}
    </li>
  );
}

export function TodayMoneySheet({ onClose }: { onClose: () => void }) {
  useCurrency();
  useRepoTick();
  const { go } = useJurnl();
  const today = getTodayKey();
  const t = computeTodayOperating(today);
  const s = t.sts;
  const others = s.protected + s.safetyBuffer + s.assigned + s.goalReserved + s.purchaseReserved + s.tripReserved;
  const assets = t.positions.filter((p) => p.nature === 'ASSET' && p.kind !== 'CASH');
  const cashPlaces = t.positions.filter((p) => p.kind === 'CASH');
  const cards = t.positions.filter((p) => p.nature === 'LIABILITY');
  return (
    <JurnlDrawer
      expression="analysis"
      size="long"
      testId="see-why"
      title="SEE WHY"
      lead={`SAFE TO SPEND IS THE MONEY IN YOUR ACCOUNTS MINUS BILLS AND CARD MINIMUMS DUE IN THE NEXT ${s.windowDays} DAYS, AND WHAT YOU HOLD BACK. ${COMPLETENESS_LABEL[s.completeness] === 'COMPLETE' ? '' : `${COMPLETENESS_LABEL[s.completeness]}.`}`}
      onClose={onClose}
    >
      <p className="jrn-eyebrow">HOW THIS NUMBER IS MADE</p>
      <ul className="jrn-why" data-testid="today-sts-lines">
        <Row k={s.cashSource === 'MOCK' ? 'SAMPLE CASH (ADD YOUR ACCOUNTS)' : 'MONEY IN YOUR ACCOUNTS'} v={money(s.cash)} />
        <Row k={`BILLS DUE BY ${formatRelativeDate(s.windowEnd, today)}`} v={`− ${money(s.upcoming)}`} sub={s.reservedForPayments > 0 ? `INCLUDES ${money(s.reservedForPayments)} YOU SET ASIDE. NOT TAKEN OFF TWICE.` : undefined} />
        <Row k="CARD MINIMUMS DUE" v={`− ${money(s.cardPayments)}`} />
        <Row k="HELD BACK, PLANS, GOALS, TRIPS" v={`− ${money(others)}`} />
        <Row k="SAFE TO SPEND" v={money(s.value)} />
      </ul>
      {s.unassignedEntries > 0 ? <p className="jrn-currency__note">{`${s.unassignedEntries} ${s.unassignedEntries === 1 ? 'ENTRY HAS' : 'ENTRIES HAVE'} NO ACCOUNT. OPEN ACTIVITY TO FIX.`}</p> : null}

      <p className="jrn-eyebrow">WHERE YOUR MONEY IS</p>
      <ul className="jrn-why" data-testid="today-places">
        <Row k="CASH ON HAND" v={money(t.summary.cashOnHand)} sub={cashPlaces.length ? undefined : 'NO CASH PLACE YET. ADD ONE IN MONEY.'} />
        {assets.map((p) => (
          <Row key={p.account_id} k={p.account.display_name} v={money(p.held)} sub={`${LOCATION_KIND_LABEL[p.kind]} · ${BALANCE_BASIS_LABEL[p.basis]}${p.freshness === 'OLDER' ? ` · LAST UPDATED ${p.daysSinceUpdate} DAYS AGO` : ''}`} />
        ))}
        {t.setAsideTotal > 0 ? <Row k="SET ASIDE FOR PAYMENTS" v={money(t.setAsideTotal)} sub="STILL IN YOUR ACCOUNTS. EARMARKED, NOT SPENT." /> : null}
        {cards.map((p) => (
          <Row key={p.account_id} k={`${p.account.display_name} OWES`} v={money(p.owed)} sub="A CARD BALANCE. NOT TAKEN FROM CASH." />
        ))}
      </ul>

      <p className="jrn-eyebrow">COMING UP</p>
      <ul className="jrn-why" data-testid="today-coming">
        {t.billsThisWeek.length === 0 && t.cards.every((c) => c.state !== 'DUE_SOON' && c.state !== 'PAST_DUE') ? <Row k="THIS WEEK" v="NOTHING DUE" /> : null}
        {t.billsThisWeek.map((b) => (
          <Row key={`${b.obligation_id}-${b.due_date}`} k={`${b.name} · ${formatRelativeDate(b.due_date, today)}`} v={money(b.remaining)} sub={b.reserved > 0 ? `${money(b.reserved)} SET ASIDE · ${money(b.stillNeeded)} STILL NEEDED` : 'NOTHING SET ASIDE YET'} />
        ))}
        {t.cards
          .filter((c) => c.state !== 'MINIMUM_PAID')
          .map((c) => (
            <Row key={c.account_id} k={c.name} v={c.remaining != null ? money(c.remaining) : '—'} sub={c.line} />
          ))}
        {s.accountShortfalls.map((sh) => (
          <Row key={sh.account_id} k={`${sh.name} IS SHORT`} v={money(sh.short)} sub={`${money(sh.committed)} IN BILLS ARE PAID FROM ${sh.name}, WHICH HAS ${money(sh.held)}.`} />
        ))}
        {s.overSetAside.map((o) => (
          <Row key={o.account_id} k={`${o.name} OVER-SET-ASIDE`} v={money(o.overBy)} sub="MORE IS SET ASIDE HERE THAN THE ACCOUNT HOLDS. REDUCE A SET-ASIDE OR MOVE MONEY IN." />
        ))}
      </ul>

      <p className="jrn-eyebrow">EARNED</p>
      <ul className="jrn-why" data-testid="today-earned">
        <Row k="TODAY" v={money(t.earned.today.total)} sub={t.earned.today.total > 0 ? `${money(t.earned.today.digital)} DIGITAL · ${money(t.earned.today.cash)} CASH` : 'NOTHING RECORDED TODAY'} />
        <Row k="THIS WEEK" v={money(t.earned.week.total)} sub={`${t.earned.week.days} ${t.earned.week.days === 1 ? 'DAY' : 'DAYS'} RECORDED`} />
      </ul>

      <p className="jrn-eyebrow">NEXT STEPS (OPTIONAL)</p>
      {t.actions.map((a) => (
        <JurnlButton key={a.id} variant="secondary" trigger={`today-next-${a.id}`} onClick={() => { onClose(); go(a.route, a.query); }}>
          {a.label}
        </JurnlButton>
      ))}
    </JurnlDrawer>
  );
}
