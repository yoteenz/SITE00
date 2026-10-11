/** Board 01 — P01 FOUNDATION ENTRY · P02 BUSINESS INTAKE · P03 FOUNDATION CONFIGURATOR. */
import { useState, type ReactNode } from 'react';
import type { DigitalFoundationCommercialConfig } from '../../../../shared/site00-digital-foundation/types.js';
import { DfIcon, type DfIconName } from '../icons';
import {
  BUSINESS_TYPES,
  DOMAIN_PATHS,
  formatDayRange,
  validateBusinessInfo,
  validateForRecommendation,
  type ClassTag,
  type ConfigurableNeed,
  type IntakeDraft,
  type IntakeErrors,
} from '../model';
import {
  DfBottomSheet,
  DfCheckMark,
  DfField,
  DfModal,
  DfPopover,
  DfRadioMark,
  DfSelect,
  DfToggleMark,
  useDfToasts,
} from '../components';
import { DfAlert, DfCta, DfHeadline, DfHeroObject, DfLede, DfRail, DfTrust } from '../shell';
import type { SaveStatus } from '../useFoundationArtifact';

// ─── Shared bits ───────────────────────────────────────────────────────────────────────────────

export function SaveChip({ status, savedAt, onRetry }: { status: SaveStatus; savedAt: Date | null; onRetry: () => void }) {
  if (status === 'idle') return null;
  if (status === 'error') {
    return (
      <button type="button" className="df-save df-save--error" onClick={onRetry}>
        NOT SAVED — RETRY
      </button>
    );
  }
  const label =
    status === 'saving' || status === 'dirty'
      ? 'SAVING…'
      : `SAVED${savedAt ? ` ${savedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : ''}`;
  return (
    <span className={`df-save df-save--${status}`} role="status" aria-live="polite">
      {label}
    </span>
  );
}

function Tag({ tag }: { tag: ClassTag }) {
  const tone = tag === 'PAID ADD-ON' || tag === 'MANUAL REVIEW' ? 'red' : tag === 'CONFIGURABLE' ? 'ink' : 'muted';
  return <span className={`df-tag df-tag--${tone}`}>{tag}</span>;
}

// ─── P01 ───────────────────────────────────────────────────────────────────────────────────────

export function P01Entry({
  config,
  onBegin,
  busy,
  error,
}: {
  config: DigitalFoundationCommercialConfig | null;
  onBegin: () => void;
  busy: boolean;
  error: string | null;
}) {
  const days = config ? formatDayRange(config.base_min_business_days, config.base_max_business_days) : null;
  return (
    <>
      <DfRail index="01" label="GET STARTED" />
      <DfHeadline lines={['YOUR', 'DIGITAL', 'FOUNDATION', 'STARTS HERE']} />
      <DfLede>
        ESTABLISH YOUR BUSINESS ON A SECURE, PROFESSIONAL <strong>FOUNDATION</strong> — DOMAIN, EMAIL, SECURITY AND
        OWNERSHIP. DONE FOR YOU.{days ? ` TYPICALLY ${days} BUSINESS DAYS.` : ''}
      </DfLede>
      <DfHeroObject />
      <ul className="df-triad" aria-label="WHAT YOUR FOUNDATION COVERS">
        <li>
          <DfIcon name="globe" />
          <span>DOMAIN</span>
          <span>&amp; OWNERSHIP</span>
        </li>
        <li>
          <DfIcon name="envelope" />
          <span>PROFESSIONAL</span>
          <span className="df-triad__line-2">BUSINESS EMAIL</span>
        </li>
        <li>
          <DfIcon name="shield" />
          <span>SECURITY</span>
          <span>&amp; SETUP</span>
        </li>
      </ul>
      {error && (
        <DfAlert role="alert">
          {error}
        </DfAlert>
      )}
      <DfCta label="BEGIN MY FOUNDATION" onClick={onBegin} busy={busy} busyLabel="STARTING…" />
      <DfTrust text="SECURE. GUIDED. DONE FOR YOU." />
    </>
  );
}

// ─── P02 ───────────────────────────────────────────────────────────────────────────────────────

export function P02Intake({
  draft,
  update,
  editable,
  onContinue,
  save,
  errors: externalErrors,
  onSaveForLater,
}: {
  draft: IntakeDraft;
  update: (patch: Partial<IntakeDraft>) => void;
  editable: boolean;
  onContinue: () => void;
  save: ReactNode;
  errors?: IntakeErrors;
  /** Flushes the autosave now; resolves true only once the server confirmed the save. */
  onSaveForLater?: () => Promise<boolean>;
}) {
  const [errors, setErrors] = useState<IntakeErrors>(externalErrors ?? {});
  const [savingLater, setSavingLater] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const toasts = useDfToasts();
  const err = { ...errors };
  const input = (field: 'business_name' | 'contact_name' | 'current_email' | 'phone', extra: Record<string, unknown> = {}) => ({
    id: `df-${field}`,
    className: 'df-input',
    value: draft[field],
    disabled: !editable,
    'aria-invalid': err[field as keyof IntakeErrors] ? true : undefined,
    'aria-describedby': err[field as keyof IntakeErrors] ? `df-${field}-error` : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      update({ [field]: e.target.value } as Partial<IntakeDraft>);
      if (err[field as keyof IntakeErrors]) {
        const rest = { ...err, [field]: undefined };
        setErrors(rest);
        if (!Object.values(rest).some(Boolean)) toasts.dismiss('p02-required');
      }
    },
    ...extra,
  });

  const submit = () => {
    const found = validateBusinessInfo(draft);
    setErrors(found);
    if (Object.keys(found).length) {
      toasts.push({ tone: 'warning', message: 'PLEASE COMPLETE ALL REQUIRED FIELDS.', key: 'p02-required' });
      const first = Object.keys(found)[0];
      document.getElementById(`df-${first}`)?.focus();
      return;
    }
    toasts.dismiss('p02-required');
    onContinue();
  };

  const saveForLater = async () => {
    if (!onSaveForLater || savingLater) return;
    setSavingLater(true);
    const ok = await onSaveForLater();
    setSavingLater(false);
    if (ok) setSavedOpen(true);
    else toasts.push({ tone: 'error', message: 'SOMETHING WENT WRONG. PLEASE TRY AGAIN.', key: 'intake-save' });
  };

  return (
    <>
      <DfRail index="02" label="BUSINESS INFORMATION" />
      <DfHeadline lines={['TELL US', 'ABOUT YOUR', 'BUSINESS']} />
      <DfLede>
        A FEW KEY <strong>DETAILS HELP US</strong> RECOMMEND THE RIGHT DIGITAL FOUNDATION FOR YOUR GOALS.
      </DfLede>
      <form
        className="df-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <DfField id="df-business_name" label="BUSINESS NAME" error={err.business_name}>
          <input {...input('business_name', { placeholder: 'YOUR BUSINESS NAME', autoComplete: 'organization' })} />
        </DfField>
        <DfField id="df-industry" label="BUSINESS TYPE" help="THIS INFORMATION HELPS US RECOMMEND THE RIGHT SETUP.">
          <DfSelect
            id="df-industry"
            labelledBy="df-industry-label"
            value={draft.industry}
            placeholder="SELECT A BUSINESS TYPE"
            disabled={!editable}
            options={[
              ...(draft.industry && !BUSINESS_TYPES.includes(draft.industry)
                ? [{ value: draft.industry, label: draft.industry.toUpperCase() }]
                : []),
              ...BUSINESS_TYPES.map((t) => ({ value: t, label: t })),
            ]}
            onChange={(v) => update({ industry: v })}
          />
        </DfField>
        <DfField id="df-contact_name" label="PRIMARY CONTACT" error={err.contact_name}>
          <input {...input('contact_name', { placeholder: 'FULL NAME', autoComplete: 'name' })} />
        </DfField>
        <DfField id="df-current_email" label="EMAIL ADDRESS" error={err.current_email}>
          <input
            {...input('current_email', {
              type: 'email',
              inputMode: 'email',
              placeholder: 'YOU@EXAMPLE.COM',
              autoComplete: 'email',
              autoCapitalize: 'none',
              spellCheck: false,
            })}
          />
        </DfField>
        <DfField id="df-phone" label="PHONE NUMBER">
          <input {...input('phone', { type: 'tel', inputMode: 'tel', placeholder: '(   )   -', autoComplete: 'tel' })} />
        </DfField>
        <DfCta type="submit" label="CONTINUE" action="p02-continue" />
        {onSaveForLater && editable && (
          <DfCta
            tone="text"
            label="SAVE FOR LATER"
            onClick={() => void saveForLater()}
            busy={savingLater}
            busyLabel="SAVING…"
            action="save-later"
          />
        )}
      </form>
      <DfTrust text="YOUR INFORMATION IS SECURE." aside={save} />
      <DfModal
        open={savedOpen}
        tone="success"
        title="INFORMATION SAVED."
        onClose={() => setSavedOpen(false)}
        primary={{
          label: 'CONTINUE',
          onClick: () => {
            setSavedOpen(false);
            submit();
          },
        }}
        secondary={{ label: 'SAVE FOR LATER', onClick: () => setSavedOpen(false) }}
      >
        <p>
          YOUR BUSINESS INFORMATION HAS BEEN SAVED SUCCESSFULLY. YOU CAN CONTINUE TO THE NEXT STEP OR COME BACK ANYTIME WITH
          THIS LINK.
        </p>
      </DfModal>
    </>
  );
}

// ─── P03 ───────────────────────────────────────────────────────────────────────────────────────

type RowProps = {
  icon: DfIconName;
  title: string;
  sub: string;
  tags: ClassTag[];
  control: 'locked' | 'check' | 'toggle' | 'arrow';
  checked?: boolean;
  active?: boolean;
  disabled?: boolean;
  onActivate?: () => void;
  expanded?: boolean;
  children?: ReactNode;
};

function ServiceRow({ icon, title, sub, tags, control, checked, active, disabled, onActivate, expanded, children }: RowProps) {
  const body = (
    <>
      <DfIcon name={icon} className="df-row__icon" />
      <span className="df-row__text">
        <span className="df-row__title">{title}</span>
        <span className="df-row__sub">{sub}</span>
        <span className="df-row__tags">
          {tags.map((t) => (
            <Tag key={t} tag={t} />
          ))}
        </span>
      </span>
      {control === 'arrow' ? (
        <span className="df-row__arrowbox" aria-hidden="true">
          <DfIcon name="arrow" />
        </span>
      ) : control === 'toggle' ? (
        <span className="df-row__switch" aria-hidden="true">
          <span className={`df-choice__state${checked ? ' df-choice__state--on' : ''}`}>{checked ? 'ON' : 'OFF'}</span>
          <DfToggleMark on={Boolean(checked)} disabled={disabled} />
        </span>
      ) : (
        <DfCheckMark checked={Boolean(checked)} locked={control === 'locked'} disabled={disabled && control !== 'locked'} />
      )}
    </>
  );
  const cls = `df-row df-row--service${active ? ' df-row--active' : ''}${control === 'locked' ? ' df-row--locked' : ''}`;
  if (!onActivate) {
    return (
      <li className={cls}>
        <div className="df-row__main" aria-label={`${title}, INCLUDED`}>
          {body}
        </div>
        {children}
      </li>
    );
  }
  return (
    <li className={cls}>
      <button
        type="button"
        className="df-row__main"
        onClick={onActivate}
        disabled={disabled}
        role={control === 'check' ? 'checkbox' : control === 'toggle' ? 'switch' : undefined}
        aria-checked={control === 'check' || control === 'toggle' ? Boolean(checked) : undefined}
        aria-expanded={expanded}
      >
        {body}
      </button>
      {children}
    </li>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="df-stepper" role="group" aria-label={label}>
      <button type="button" aria-label={`FEWER — ${label}`} disabled={disabled || value <= min} onClick={() => onChange(value - 1)}>
        <DfIcon name="minus" />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" aria-label={`MORE — ${label}`} disabled={disabled || value >= max} onClick={() => onChange(value + 1)}>
        <DfIcon name="plus" />
      </button>
    </div>
  );
}

const ADDITIONAL_SERVICES: { flag: ConfigurableNeed; title: string; sub: string; tags: ClassTag[] }[] = [
  {
    flag: 'HAVE_WEBSITE',
    title: 'MY DOMAIN ALREADY RUNS A WEBSITE',
    sub: 'WE PROTECT THE LIVE SITE WHILE WE CONNECT EMAIL',
    tags: ['PAID ADD-ON', 'MANUAL REVIEW'],
  },
  { flag: 'EVENTUAL_WEBSITE', title: "I'LL WANT A WEBSITE LATER", sub: 'WE PREPARE YOUR FOUNDATION FOR A SITE 00 BUILD', tags: ['CONFIGURABLE'] },
  { flag: 'NEED_BRANDING', title: 'I NEED BRANDING', sub: 'WE NOTE IT FOR YOUR NEXT STEP', tags: ['CONFIGURABLE'] },
  { flag: 'UNSURE', title: "I'M NOT SURE WHAT I NEED", sub: "WE'LL CLARIFY WITH YOU AFTER INTAKE", tags: ['CONFIGURABLE'] },
];

export function P03Configure({
  draft,
  update,
  editable,
  onSubmit,
  submitting,
  submitError,
  save,
}: {
  draft: IntakeDraft;
  update: (patch: Partial<IntakeDraft>) => void;
  editable: boolean;
  onSubmit: (errors: IntakeErrors) => void;
  submitting: boolean;
  submitError: string | null;
  save: ReactNode;
}) {
  const [open, setOpen] = useState<'domain' | 'email' | 'migration' | null>(null);
  const [sheet, setSheet] = useState(false);
  const [errors, setErrors] = useState<IntakeErrors>({});
  const has = (f: ConfigurableNeed) => draft.needs.includes(f);
  const toggleNeed = (f: ConfigurableNeed) =>
    update({ needs: has(f) ? draft.needs.filter((n) => n !== f) : [...draft.needs, f] });
  const domain = DOMAIN_PATHS.find((d) => d.path === draft.domainPath) ?? null;
  const extraPeople = draft.team_size - 1;
  const extras = ADDITIONAL_SERVICES.filter((s) => has(s.flag));

  const submit = () => {
    const found = validateForRecommendation(draft);
    setErrors(found);
    if (found.domainPath || found.existing_domain) setOpen('domain');
    onSubmit(found);
  };

  return (
    <>
      <DfRail index="03" label="BUILD YOUR FOUNDATION" />
      <DfHeadline lines={['SELECT', 'WHAT YOU NEED']} />
      <DfLede>
        CHOOSE THE SERVICES THAT FIT YOUR BUSINESS. WE&apos;LL RECOMMEND THE BEST SETUP AND HANDLE THE REST.
      </DfLede>
      <ul className="df-rows" aria-label="FOUNDATION SERVICES">
        <ServiceRow
          icon="globe"
          title="DOMAIN"
          sub={domain ? domain.title : 'REGISTER, TRANSFER OR CONNECT YOUR DOMAIN'}
          tags={domain?.path === 'LOST' ? ['PAID ADD-ON', 'MANUAL REVIEW'] : ['INCLUDED', 'CONFIGURABLE']}
          control="check"
          checked={Boolean(domain)}
          active={Boolean(domain) || open === 'domain'}
          disabled={!editable}
          expanded={open === 'domain'}
          onActivate={() => setOpen(open === 'domain' ? null : 'domain')}
        >
          {open === 'domain' && (
            <div className="df-reveal">
              <fieldset className="df-paths">
                <legend className="df-reveal__label">HOW SHOULD WE HANDLE YOUR DOMAIN?</legend>
                {DOMAIN_PATHS.map((p) => (
                  <label key={p.path} className={`df-path${draft.domainPath === p.path ? ' df-path--on' : ''}`}>
                    <input
                      type="radio"
                      name="df-domain-path"
                      value={p.path}
                      checked={draft.domainPath === p.path}
                      disabled={!editable}
                      onChange={() => {
                        update({ domainPath: p.path });
                        setErrors((e) => ({ ...e, domainPath: undefined }));
                      }}
                    />
                    <DfRadioMark checked={draft.domainPath === p.path} disabled={!editable} />
                    <span className="df-path__text">
                      <span className="df-path__title">{p.title}</span>
                      <span className="df-path__sub">{p.sub}</span>
                    </span>
                    <Tag tag={p.tag} />
                  </label>
                ))}
              </fieldset>
              {(draft.domainPath === 'OWN' || draft.domainPath === 'LOST') && (
                <div className="df-reveal__fields">
                  <DfField id="df-existing_domain" label="YOUR DOMAIN" error={errors.existing_domain}>
                    <input
                      id="df-existing_domain"
                      className="df-input"
                      value={draft.existing_domain}
                      placeholder="EXAMPLE.COM"
                      autoCapitalize="none"
                      spellCheck={false}
                      disabled={!editable}
                      aria-invalid={errors.existing_domain ? true : undefined}
                      onChange={(e) => {
                        update({ existing_domain: e.target.value });
                        setErrors((x) => ({ ...x, existing_domain: undefined }));
                      }}
                    />
                  </DfField>
                  <DfField id="df-existing_registrar" label="WHERE IT'S REGISTERED (IF YOU KNOW)">
                    <input
                      id="df-existing_registrar"
                      className="df-input"
                      value={draft.existing_registrar}
                      placeholder="E.G. GODADDY, SQUARESPACE"
                      disabled={!editable}
                      onChange={(e) => update({ existing_registrar: e.target.value })}
                    />
                  </DfField>
                </div>
              )}
              {draft.domainPath && (
                <button type="button" className="df-link" onClick={() => setOpen(null)}>
                  DONE
                </button>
              )}
            </div>
          )}
        </ServiceRow>
        {errors.domainPath && (
          <li className="df-rows__alert">
            <DfAlert role="alert">{errors.domainPath}</DfAlert>
          </li>
        )}
        <ServiceRow
          icon="envelope"
          title="PROFESSIONAL EMAIL"
          sub={
            extraPeople > 0
              ? `${draft.team_size} PEOPLE · ${extraPeople} ADDITIONAL ${extraPeople === 1 ? 'MAILBOX' : 'MAILBOXES'}`
              : 'BUSINESS MAILBOX, ALIASES AND CONFIGURATION'
          }
          tags={extraPeople > 0 ? ['CORE', 'PAID ADD-ON'] : ['CORE', 'INCLUDED']}
          control="locked"
          checked
          disabled={!editable}
          expanded={open === 'email'}
          onActivate={() => setOpen(open === 'email' ? null : 'email')}
        >
          {open === 'email' && (
            <div className="df-reveal df-reveal--inline">
              <span className="df-reveal__label">HOW MANY PEOPLE NEED EMAIL?</span>
              <Stepper
                label="PEOPLE WHO NEED EMAIL"
                value={draft.team_size}
                min={1}
                max={50}
                disabled={!editable}
                onChange={(n) => update({ team_size: n })}
              />
              <span className="df-reveal__note">ONE MAILBOX IS INCLUDED. EACH ADDITIONAL MAILBOX IS A PAID ADD-ON.</span>
            </div>
          )}
        </ServiceRow>
        <ServiceRow icon="layers" title="EMAIL ALIASES" sub="INFO@, BILLING@, ETC." tags={['CORE', 'INCLUDED']} control="locked" checked />
        <ServiceRow icon="shield" title="EMAIL SECURITY" sub="SPF, DKIM, DMARC SETUP" tags={['CORE', 'INCLUDED']} control="locked" checked />
        <ServiceRow
          icon="document"
          title="EMAIL SIGNATURE"
          sub="PROFESSIONAL SIGNATURE DESIGN AND SETUP"
          tags={['CORE', 'INCLUDED']}
          control="locked"
          checked
        />
        <ServiceRow
          icon="phone"
          title="DEVICE SETUP"
          sub={has('NEED_DEVICE') ? 'GUIDANCE FOR EVERYONE’S DEVICES' : 'ONE DEVICE INCLUDED · ADD YOUR TEAM'}
          tags={has('NEED_DEVICE') && draft.team_size > 1 ? ['CONFIGURABLE', 'PAID ADD-ON'] : ['INCLUDED', 'CONFIGURABLE']}
          control="check"
          checked={has('NEED_DEVICE')}
          active={has('NEED_DEVICE')}
          disabled={!editable}
          onActivate={() => toggleNeed('NEED_DEVICE')}
        />
        <ServiceRow
          icon="swap"
          title="EMAIL MIGRATION"
          sub="MOVE FROM EXISTING PROVIDER"
          tags={['PAID ADD-ON', 'MANUAL REVIEW']}
          control="toggle"
          checked={has('NEED_MIGRATION')}
          active={has('NEED_MIGRATION')}
          disabled={!editable}
          onActivate={() => {
            toggleNeed('NEED_MIGRATION');
            setOpen(has('NEED_MIGRATION') ? null : 'migration');
          }}
        >
          {open === 'migration' && has('NEED_MIGRATION') && (
            <div className="df-reveal">
              <DfField id="df-existing_email_provider" label="CURRENT EMAIL PROVIDER (IF YOU KNOW)">
                <input
                  id="df-existing_email_provider"
                  className="df-input"
                  value={draft.existing_email_provider}
                  placeholder="E.G. GMAIL, OUTLOOK, YAHOO"
                  disabled={!editable}
                  onChange={(e) => update({ existing_email_provider: e.target.value })}
                />
              </DfField>
            </div>
          )}
        </ServiceRow>
        <ServiceRow
          icon="plus"
          title="ADDITIONAL SERVICES"
          sub={extras.length ? extras.map((s) => s.title).join(' · ') : 'ADDITIONAL DOMAINS, USERS, DNS CLEANUP, ETC.'}
          tags={['CONFIGURABLE']}
          control="arrow"
          active={extras.length > 0}
          disabled={!editable}
          onActivate={() => setSheet(true)}
        />
      </ul>
      <DfPopover triggerLabel="WHAT DO THE TAGS MEAN?" title="SERVICE TAGS">
        <dl>
          <div>
            <dt>INCLUDED</dt>
            <dd>PART OF YOUR FOUNDATION PRICE.</dd>
          </div>
          <div>
            <dt>CONFIGURABLE</dt>
            <dd>YOU CHOOSE HOW IT IS SET UP.</dd>
          </div>
          <div>
            <dt>PAID ADD-ON</dt>
            <dd>PRICED ON YOUR RECOMMENDATION BEFORE YOU COMMIT.</dd>
          </div>
          <div>
            <dt>MANUAL REVIEW</dt>
            <dd>SITE 00 CONFIRMS SCOPE AND PRICING BEFORE CHECKOUT.</dd>
          </div>
        </dl>
      </DfPopover>
      {submitError && <DfAlert role="alert">{submitError}</DfAlert>}
      <DfCta
        label="VIEW MY RECOMMENDATION"
        onClick={submit}
        busy={submitting}
        busyLabel="BUILDING YOUR RECOMMENDATION…"
        disabled={!editable}
      />
      <DfTrust text="NO PASSWORDS. EVER." aside={save} />
      <DfBottomSheet open={sheet} title="ADDITIONAL SERVICES" onClose={() => setSheet(false)}>
        <ul className="df-rows df-rows--sheet">
          {ADDITIONAL_SERVICES.map((s) => (
            <ServiceRow
              key={s.flag}
              icon={s.flag === 'HAVE_WEBSITE' ? 'alert' : s.flag === 'EVENTUAL_WEBSITE' ? 'laptop' : s.flag === 'NEED_BRANDING' ? 'signature' : 'search'}
              title={s.title}
              sub={s.sub}
              tags={s.tags}
              control="check"
              checked={has(s.flag)}
              active={has(s.flag)}
              disabled={!editable}
              onActivate={() => toggleNeed(s.flag)}
            />
          ))}
        </ul>
        <p className="df-sheet__note">
          ADDITIONAL DOMAINS, MAILBOXES, ROUTING AND DNS CLEANUP ARE ADDED ON YOUR RECOMMENDATION, WITH THEIR PRICES.
        </p>
      </DfBottomSheet>
    </>
  );
}

/** Shown when intake is complete but full-service checkout is not yet certified (launch gate). */
export function P03IntakeSubmitted() {
  return (
    <>
      <DfRail index="03" label="INTAKE RECEIVED" />
      <DfHeadline lines={['WE HAVE', 'YOUR', 'FOUNDATION', 'DETAILS.']} />
      <DfLede>
        SITE 00 IS REVIEWING YOUR SUBMITTED INFORMATION. YOU DO NOT NEED TO DO ANYTHING ELSE RIGHT NOW. WE WILL FOLLOW UP
        WITH NEXT STEPS ON THIS SAME LINK WHEN YOUR QUOTE AND CHECKOUT ARE READY.
      </DfLede>
      <DfAlert>YOUR RECORD IS SAVED. REFRESHING THIS PAGE WILL NOT LOSE YOUR SUBMISSION.</DfAlert>
      <DfTrust text="SECURE. GUIDED. DONE FOR YOU." />
    </>
  );
}
