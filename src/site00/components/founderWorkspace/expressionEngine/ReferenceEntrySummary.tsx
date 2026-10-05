/**
 * Reference-fidelity — Entry summary card.
 */

type Props = {
  entryId: string;
  title: string;
  subject: string;
  stageBadge: string;
  thumbnailUrl: string | null;
  createdLabel?: string;
  updatedLabel?: string;
};

export function ReferenceEntrySummary({
  entryId,
  title,
  subject,
  stageBadge,
  thumbnailUrl,
  createdLabel,
  updatedLabel,
}: Props) {
  return (
    <article className="site00-ee-ref-entry">
      <div className="site00-ee-ref-entry__thumb">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="" loading="lazy" />
        ) : (
          <span className="site00-ee-ref-entry__thumb-placeholder" aria-hidden />
        )}
      </div>
      <div className="site00-ee-ref-entry__body">
        <span className="site00-ee-ref-entry__id">{entryId}</span>
        <h2 className="site00-ee-ref-entry__title">{title}</h2>
        <p className="site00-ee-ref-entry__subject">{subject}</p>
        <span className="site00-ee-ref-entry__badge">{stageBadge}</span>
        {createdLabel || updatedLabel ? (
          <p className="site00-ee-ref-entry__dates">
            {createdLabel ? `CREATED ${createdLabel}` : null}
            {createdLabel && updatedLabel ? ' · ' : null}
            {updatedLabel ? `UPDATED ${updatedLabel}` : null}
          </p>
        ) : null}
      </div>
    </article>
  );
}
