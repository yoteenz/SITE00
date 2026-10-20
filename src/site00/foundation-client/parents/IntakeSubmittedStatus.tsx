/** Post-intake status (INTAKE_SUBMITTED / G-02 withheld) — honest progress, no quote or checkout. */
import type { ClientDigitalFoundationPayload } from '../../../../shared/site00-digital-foundation/clientProjection.js';
import { DfCta, DfHeadline, DfLede, DfRail, DfTrust } from '../shell';
import { SpecRow } from './CheckoutActivation';

const POST_INTAKE_STAGES = [
  'INTAKE RECEIVED',
  'FOUNDATION REVIEW',
  'PERSONALIZED PROPOSAL',
  'APPROVAL & PAYMENT',
  'FOUNDATION SETUP',
  'FINAL VERIFICATION',
  'COMPLETE',
] as const;

function formatAsOf(d: Date): string {
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }).toUpperCase();
}

function shortRef(artifactId: string): string {
  return artifactId.replace(/-/g, '').slice(0, 8).toUpperCase();
}

export function P03IntakeSubmitted({
  payload,
  fetchedAt,
  onRefresh,
  busy,
}: {
  payload: ClientDigitalFoundationPayload;
  fetchedAt: Date;
  onRefresh: () => void;
  busy?: boolean;
}) {
  const received = payload.artifact.last_activity_at ?? payload.artifact.created_at;
  return (
    <>
      <DfRail index="03" label="FOUNDATION STATUS" />
      <DfHeadline lines={['YOUR FOUNDATION', 'IS TAKING', 'SHAPE.']} />
      <DfLede>
        SITE 00 RECEIVED YOUR INTAKE. WE REVIEW YOUR INFORMATION BEFORE SENDING A PERSONALIZED PROPOSAL ON THIS SAME
        LINK — NO PRICING IS SHOWN UNTIL THAT REVIEW IS COMPLETE.
      </DfLede>
      <ul className="df-specs">
        <SpecRow icon="layers" label="INTAKE RECEIVED" sub="STATUS" wide />
        <SpecRow
          icon="clock"
          label={new Date(received).toLocaleString('en-US').toUpperCase()}
          sub="RECEIVED"
          wide
        />
        <SpecRow icon="document" label={shortRef(payload.artifact.artifact_id)} sub="REFERENCE" wide />
        <SpecRow icon="clock" label={formatAsOf(fetchedAt)} sub="STATUS AS OF" wide />
      </ul>
      <section className="df-section" aria-labelledby="df-post-intake-stages">
        <h2 className="df-section__label" id="df-post-intake-stages">
          WHAT HAPPENS NEXT
        </h2>
        <ol className="df-stages">
          {POST_INTAKE_STAGES.map((label, i) => (
            <li key={label} className={`df-stage df-stage--${i === 0 ? 'in_progress' : 'waiting'}`}>
              <span className="df-stage__node" aria-hidden="true" />
              <span className="df-stage__label">{label}</span>
              <span className="df-stage__status">{i === 0 ? 'CURRENT' : 'UPCOMING'}</span>
            </li>
          ))}
        </ol>
      </section>
      <div className="df-actions">
        <DfCta tone="outline" label="REFRESH STATUS" busy={busy} onClick={onRefresh} />
      </div>
      <DfTrust text="SAFE. SECURE. ON TRACK." />
    </>
  );
}
