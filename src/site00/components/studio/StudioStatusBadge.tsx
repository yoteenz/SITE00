type StudioStatusBadgeProps = {
  label: string;
};

export function StudioStatusBadge({ label }: StudioStatusBadgeProps) {
  return (
    <div className="site00-studio-status" role="status">
      <span className="site00-studio-status__label">{label}</span>
      <span className="site00-studio-status__mark" aria-hidden="true">◆</span>
    </div>
  );
}
