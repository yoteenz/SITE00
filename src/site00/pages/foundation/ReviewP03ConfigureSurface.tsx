import { useEffect, useState } from 'react';
import { P03Configure } from '../../foundation-client/parents/EntryIntake';
import type { IntakeDraft } from '../../foundation-client/model';

const SEED: IntakeDraft = {
  business_name: 'REVIEW STUDIO LLC',
  industry: 'PROFESSIONAL SERVICES',
  contact_name: 'FOUNDER PREVIEW',
  current_email: 'preview@example.com',
  phone: '901-555-0100',
  existing_domain: '',
  existing_registrar: '',
  existing_email_provider: '',
  team_size: 3,
  domainPath: null,
  needs: ['UNSURE'],
};

export default function ReviewP03ConfigureSurface({
  initialState = 'default',
}: {
  initialState?: 'default' | 'domain_expanded' | 'email_expanded';
}) {
  const [draft, setDraft] = useState<IntakeDraft>(() => ({
    ...SEED,
    domainPath: initialState === 'domain_expanded' ? 'NEW' : SEED.domainPath,
  }));
  const [expandToken, setExpandToken] = useState(0);

  useEffect(() => {
    if (initialState === 'domain_expanded') {
      setDraft((d) => ({ ...d, domainPath: 'NEW' }));
      setExpandToken((t) => t + 1);
    }
    if (initialState === 'email_expanded') {
      setExpandToken((t) => t + 1);
    }
  }, [initialState]);

  const expandedRow =
    initialState === 'domain_expanded' ? 'domain' : initialState === 'email_expanded' ? 'email' : null;

  return (
    <P03Configure
      key={`${initialState}-${expandToken}`}
      draft={draft}
      update={(patch) => setDraft((d) => ({ ...d, ...patch }))}
      editable
      onSubmit={() => undefined}
      submitting={false}
      submitError={null}
      save={null}
      initialExpandedRow={expandedRow}
    />
  );
}
