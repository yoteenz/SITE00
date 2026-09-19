import type { EditorialLeadPresentation } from '../../../../shared/site00-studio-world-production/founderWorkspace/types';

type EditorialLeadCardProps = {
  lead: EditorialLeadPresentation;
  onInspect?: () => void;
};

export function EditorialLeadCard({ lead, onInspect }: EditorialLeadCardProps) {
  return (
    <article className="site00-fws-lead">
      <div className="site00-fws-lead__body">
        <h3 className="site00-fws-lead__headline">{lead.headline}</h3>
        <p className="site00-fws-lead__line">{lead.leadLine}</p>
        {lead.sourceHint ? <p className="site00-fws-lead__source">{lead.sourceHint}</p> : null}
      </div>
      {onInspect && lead.inspectScore != null ? (
        <button type="button" className="site00-fws-lead__inspect" onClick={onInspect} title="View score">
          {lead.inspectScore.toFixed(2)}
        </button>
      ) : null}
    </article>
  );
}

export function EditorialLeadList({ leads, onInspectLead }: {
  leads: EditorialLeadPresentation[];
  onInspectLead?: (lead: EditorialLeadPresentation) => void;
}) {
  if (!leads.length) {
    return (
      <p className="site00-fws-empty">NOT ENOUGH SIGNAL YET — NDX is watching.</p>
    );
  }
  return (
    <div className="site00-fws-lead-list">
      {leads.map((lead) => (
        <EditorialLeadCard key={lead.id} lead={lead} onInspect={onInspectLead ? () => onInspectLead(lead) : undefined} />
      ))}
    </div>
  );
}
