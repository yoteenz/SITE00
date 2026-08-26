type StatusKind = 'joinable' | 'reading' | 'available' | 'live';

export function AstralStatusChip({ label, kind = 'available' }: { label: string; kind?: StatusKind }) {
  return <span className={`aw-status-chip aw-status-chip--${kind}`}>{label}</span>;
}
