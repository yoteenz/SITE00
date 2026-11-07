/**
 * CONNECTED ACCOUNTS & SYNC for a real account (production / provider sandbox). Built on the existing V3 folio parts;
 * no new visual language. Every state shown comes from the server's connection record — a local account never
 * shows as CONNECTED. Connected banking is read-only: nothing here moves money.
 */
import { useEffect, useMemo, useState } from 'react';
import { listActiveAccounts, type JurnlAccountRecord } from '../../data/foundation/accounts';
import { connectInstitution, decideMatch, disconnectInstitution, loadBankConfig, pullBankData, retrySync, useBankUiState } from '../../data/banking/bankLedger';
import { bankApi } from '../../data/banking/bankClient';
import { connectionHealth, formatAsOf, type ConnectionHealth } from '../../data/banking/health';
import { getRepository } from '../../data/repository/deviceRepository';
import { useRepoTick } from '../../data/home/money';
import { formatMoney } from '../../data/home/money';
import { JurnlModal } from '../components/primitives';
import { V3Folio, V3Notice, V3Pill, V3Row, V3RuleLabel } from '../surfaces/v3/V3Surfaces';

const STATUS_TONE: Record<ConnectionHealth['state'], 'ACTIVE' | 'AVAILABLE' | 'UNAVAILABLE'> = {
  NOT_CONNECTED: 'UNAVAILABLE',
  CONNECTING: 'AVAILABLE',
  CONNECTED: 'ACTIVE',
  SYNCING: 'ACTIVE',
  UP_TO_DATE: 'ACTIVE',
  DELAYED: 'AVAILABLE',
  NEEDS_RECONNECTION: 'AVAILABLE',
  PERMISSION_REVOKED: 'AVAILABLE',
  INSTITUTION_UNAVAILABLE: 'AVAILABLE',
  ERROR: 'AVAILABLE',
  DISCONNECTED: 'UNAVAILABLE',
};

function HealthChip({ h, testId }: { h: ConnectionHealth; testId?: string }) {
  return (
    <span className="jv3-status" data-state={STATUS_TONE[h.state]} data-health={h.state} data-testid={testId}>
      {h.state === 'UP_TO_DATE' ? 'UP TO DATE' : h.label}
    </span>
  );
}

function accountLine(a: JurnlAccountRecord): string {
  const c = a.connection!;
  const liability = a.account_type === 'CREDIT_CARD' || a.account_type === 'LOAN';
  const bal = liability ? c.current_balance : (c.available_balance ?? c.current_balance);
  const amount = bal == null ? 'BALANCE NOT PROVIDED' : `${liability ? 'OWED ' : ''}${formatMoney(Math.abs(bal))}`;
  const limit = liability && c.credit_limit != null ? ` · LIMIT ${formatMoney(c.credit_limit)}` : '';
  return `${a.masked_identifier ? `•${a.masked_identifier} · ` : ''}${amount}${limit} · AS OF ${formatAsOf(c.balance_as_of)}`;
}

const ERROR_COPY: Record<string, string> = {
  BANKING_NOT_CONFIGURED: 'CONNECTED BANKING IS NOT SET UP ON THIS SERVER YET. YOU CAN KEEP RECORDING BY HAND.',
  BANKING_NOT_ENABLED_FOR_ACCOUNT: 'CONNECTED BANKING IS NOT TURNED ON FOR THIS ACCOUNT.',
  AUTH_REQUIRED: 'SIGN IN AGAIN TO SEE YOUR CONNECTIONS.',
  OFFLINE: 'YOU ARE OFFLINE. SHOWING THE LAST KNOWN CONNECTION STATES.',
  RATE_LIMITED: 'YOUR BANK ASKED JURNL TO SLOW DOWN. TRY AGAIN IN A MINUTE.',
  PLAID_LINK_UNAVAILABLE: 'THE BANK CONNECTION WINDOW COULD NOT LOAD. CHECK YOUR CONNECTION AND TRY AGAIN.',
};

export function ConnectedAccountsPanel({ onBack, onManual }: { onBack: () => void; onManual: () => void }) {
  useRepoTick();
  const ui = useBankUiState();
  const [confirm, setConfirm] = useState<{ itemId: string; name: string } | null>(null);
  const [removeImported, setRemoveImported] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<Record<string, string>>({});
  const snap = getRepository().getSnapshot();
  const cached = snap.bank?.connections ?? [];
  const items = ui.items.length ? ui.items : cached.map((c) => ({ ...c, institution_id: null, provider: 'PLAID' as const, products: [], consent_granted_at: '', last_sync_started_at: null, last_webhook_at: null, last_error_code: null, last_error_at: null, new_accounts_available: false, provider_revoked_at: null, created_at: '', updated_at: '' }));
  const accounts = listActiveAccounts().filter((a) => a.connection);
  const suggestions = (snap.bank?.matches ?? []).filter((m) => m.status === 'SUGGESTED');

  useEffect(() => {
    void loadBankConfig().then((cfg) => {
      if (cfg?.configured) void pullBankData();
    });
  }, []);

  const configured = ui.config?.configured === true;
  const sandbox = ui.config?.environment === 'sandbox';
  const errorText = ui.lastError ? (ERROR_COPY[ui.lastError.code] ?? 'SOMETHING WENT WRONG WITH YOUR BANK CONNECTION. YOUR EARLIER DATA IS SAFE.') : null;
  const active = items.filter((i) => i.status !== 'DISCONNECTED');
  const past = items.filter((i) => i.status === 'DISCONNECTED');
  const accountsByItem = useMemo(() => {
    const m = new Map<string, JurnlAccountRecord[]>();
    for (const a of accounts) m.set(a.connection!.item_id, [...(m.get(a.connection!.item_id) ?? []), a]);
    return m;
  }, [accounts]);

  const connect = async (itemId: string | null) => {
    setNotice(null);
    const r = await connectInstitution(itemId);
    if (!r.ok && r.code !== 'CANCELLED') setNotice(ERROR_COPY[r.code ?? ''] ?? r.message ?? 'THE CONNECTION DID NOT FINISH. NOTHING WAS ADDED.');
  };

  const doDisconnect = async () => {
    if (!confirm) return;
    const r = await disconnectInstitution(confirm.itemId, removeImported);
    setConfirm(null);
    setNotice(
      r.ok
        ? removeImported
          ? `${confirm.name} IS DISCONNECTED. YOUR BANK'S ACCESS WAS REMOVED AND ITS IMPORTED TRANSACTIONS WERE DELETED.`
          : `${confirm.name} IS DISCONNECTED. YOUR BANK'S ACCESS WAS REMOVED. IMPORTED HISTORY IS KEPT.`
        : 'ACCESS WAS NOT REMOVED. NOTHING WAS DELETED. TRY AGAIN.',
    );
  };

  const checkCatalog = async (target: 'UBER_PRO_CARD' | 'LYFT_DIRECT') => {
    try {
      const r = (await bankApi.catalog(target)) as { note?: string };
      setCatalog((c) => ({ ...c, [target]: r.note ?? 'CHECKED.' }));
    } catch {
      setCatalog((c) => ({ ...c, [target]: 'COULD NOT CHECK RIGHT NOW. RECORD THIS CARD BY HAND FOR NOW.' }));
    }
  };

  return (
    <V3Folio
      label="CONNECTED ACCOUNTS & SYNC"
      testId="global-connections"
      title="CONNECTED ACCOUNTS & SYNC"
      script="how your money gets into jurnl"
      onClose={onBack}
      footer={
        <>
          <V3Pill tone="cream" trigger="connections-back" onClick={onBack}>
            BACK
          </V3Pill>
          {configured ? (
            <V3Pill tone="olive" trigger="connections-connect" onClick={() => void connect(null)} disabled={ui.connecting != null}>
              {ui.connecting === 'NEW' ? 'CONNECTING…' : 'CONNECT A BANK'}
            </V3Pill>
          ) : (
            <V3Pill tone="olive" trigger="connections-manual" onClick={onManual}>
              YOUR POCKETS
            </V3Pill>
          )}
        </>
      }
    >
      {sandbox ? (
        <V3Notice tone="attention" icon="warn" testId="connections-sandbox">
          TEST MODE. ONLY THE PROVIDER&apos;S SANDBOX INSTITUTIONS CAN BE CONNECTED HERE. NOTHING SHOWN IS REAL MONEY.
        </V3Notice>
      ) : null}
      {ui.config && !configured ? (
        <V3Notice tone="attention" icon="warn" testId="connections-not-configured">
          {ERROR_COPY.BANKING_NOT_CONFIGURED}
        </V3Notice>
      ) : null}
      {errorText ? (
        <V3Notice tone="attention" icon="warn" testId="connections-error">
          {errorText}
        </V3Notice>
      ) : null}
      {notice ? (
        <V3Notice icon="info" testId="connections-notice">
          {notice}
        </V3Notice>
      ) : null}

      <V3RuleLabel>YOUR BANKS</V3RuleLabel>
      {active.length === 0 ? <V3Row icon="bank" label="NO BANK CONNECTED" sub={connectionHealth(null).message} aside={<HealthChip h={connectionHealth(null)} testId="connections-state-none" />} testId="connections-none" /> : null}
      {active.map((item) => {
        const h = connectionHealth(item, new Date(), ui.connecting === item.item_id);
        const name = item.institution_name ?? 'YOUR BANK';
        return (
          <div key={item.item_id} data-testid={`connection-${item.item_id}`} data-health={h.state}>
            <V3Row icon="bank" label={name.toUpperCase()} sub={h.state === 'UP_TO_DATE' ? h.label : `${h.message}${h.asOf ? ` LAST UPDATED ${formatAsOf(h.asOf)}.` : ''}`} aside={<HealthChip h={h} testId={`connection-state-${item.item_id}`} />} testId={`connection-row-${item.item_id}`} />
            {(accountsByItem.get(item.item_id) ?? []).map((a) => (
              <V3Row key={a.account_id} icon="wallet" label={a.display_name} sub={accountLine(a)} testId={`connected-account-${a.account_id}`} />
            ))}
            <div className="jv3-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '4px 0 10px' }}>
              {h.actions.includes('RETRY') ? (
                <V3Pill tone="cream" trigger={`connection-retry-${item.item_id}`} onClick={() => void retrySync(item.item_id)} disabled={ui.loading}>
                  {ui.loading ? 'UPDATING…' : 'UPDATE NOW'}
                </V3Pill>
              ) : null}
              {h.actions.includes('RECONNECT') ? (
                <V3Pill tone="olive" trigger={`connection-reconnect-${item.item_id}`} onClick={() => void connect(item.item_id)} disabled={ui.connecting != null}>
                  RECONNECT
                </V3Pill>
              ) : null}
              {h.actions.includes('DISCONNECT') ? (
                <V3Pill tone="terracotta" trigger={`connection-disconnect-${item.item_id}`} onClick={() => setConfirm({ itemId: item.item_id, name: name.toUpperCase() })}>
                  DISCONNECT
                </V3Pill>
              ) : null}
            </div>
          </div>
        );
      })}
      {past.map((item) => {
        const h = connectionHealth(item);
        return <V3Row key={item.item_id} icon="bank" label={(item.institution_name ?? 'YOUR BANK').toUpperCase()} sub={h.message} aside={<HealthChip h={h} />} testId={`connection-row-${item.item_id}`} />;
      })}

      {suggestions.length ? (
        <>
          <V3RuleLabel>PLEASE CONFIRM</V3RuleLabel>
          {suggestions.slice(0, 5).map((m) => {
            const entries = m.entry_ids.map((id) => snap.transactions.find((t) => t.id === id)).filter(Boolean);
            const what = m.kind === 'TRANSFER' ? 'SAME TRANSFER?' : m.kind === 'CARD_PAYMENT' ? 'SAME CARD PAYMENT?' : m.kind === 'BILL_PAYMENT' ? 'IS THIS THE BILL PAYMENT?' : m.kind === 'EARNINGS_PAYOUT' ? 'SAME EARNINGS?' : m.kind === 'CASH_WITHDRAWAL' ? 'ADD TO CASH ON HAND?' : 'SAME PURCHASE?';
            return (
              <div key={m.match_id} data-testid={`match-${m.match_id}`}>
                <V3Row icon="arrows" label={what} sub={entries.map((e) => `${e!.merchant} ${formatMoney(e!.amount)}`).join(' · ')} testId={`match-row-${m.match_id}`} />
                {m.entry_ids.length > 1 ? (
                  <div style={{ display: 'flex', gap: 8, margin: '0 0 8px' }}>
                    <V3Pill tone="olive" trigger={`match-confirm-${m.match_id}`} onClick={() => decideMatch(m.match_id, 'CONFIRMED')}>
                      YES, THE SAME
                    </V3Pill>
                    <V3Pill tone="cream" trigger={`match-reject-${m.match_id}`} onClick={() => decideMatch(m.match_id, 'REJECTED')}>
                      NO
                    </V3Pill>
                  </div>
                ) : null}
              </div>
            );
          })}
        </>
      ) : null}

      <V3RuleLabel>WHAT JURNL CAN SEE</V3RuleLabel>
      <V3Row icon="shield" label="READ ONLY" sub="BALANCES, TRANSACTIONS, ACCOUNT NAMES AND LAST 4 DIGITS. JURNL NEVER MOVES MONEY, PAYS CARDS OR SEES YOUR BANK PASSWORD." testId="connections-permissions" />
      <V3Row icon="wallet" label="YOUR POCKETS" sub="CASH ON HAND AND ANY ACCOUNT YOU RECORD BY HAND STAY MANUAL." onClick={onManual} trigger="connections-pockets" testId="connections-pockets" />

      {configured ? (
        <>
          <V3RuleLabel>PAYOUT CARDS</V3RuleLabel>
          {(['UBER_PRO_CARD', 'LYFT_DIRECT'] as const).map((t) => (
            <V3Row
              key={t}
              icon="wallet"
              label={t === 'UBER_PRO_CARD' ? 'UBER PRO CARD' : 'LYFT DIRECT'}
              sub={catalog[t] ?? 'NOT CONFIRMED UNTIL YOU CONNECT IT AND YOUR TRANSACTIONS ARRIVE.'}
              onClick={() => void checkCatalog(t)}
              trigger={`connections-catalog-${t}`}
              testId={`connections-catalog-${t}`}
            />
          ))}
        </>
      ) : null}

      {confirm ? (
        <JurnlModal
          title={`DISCONNECT ${confirm.name}?`}
          body="JURNL WILL ASK YOUR BANK'S CONNECTION SERVICE TO REMOVE ITS ACCESS. NEW ACTIVITY STOPS ARRIVING. YOUR OWN ENTRIES, CORRECTIONS AND CASH ARE ALWAYS KEPT."
          onCancel={() => setConfirm(null)}
          testId="connections-disconnect-confirm"
          confirm={{ label: 'DISCONNECT', variant: 'destructive', onClick: () => void doDisconnect(), trigger: 'connections-disconnect-confirm-yes' }}
        >
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '10px 0', minHeight: 44 }}>
            <input type="checkbox" checked={removeImported} onChange={(e) => setRemoveImported(e.target.checked)} data-testid="connections-disconnect-remove-imported" />
            <span>ALSO DELETE TRANSACTIONS IMPORTED FROM THIS BANK</span>
          </label>
        </JurnlModal>
      ) : null}
    </V3Folio>
  );
}
