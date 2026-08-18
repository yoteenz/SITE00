const STEPS = [
  { num: '01', label: 'INTERPRET', key: 'interpret_status' },
  { num: '02', label: 'DIRECT', key: 'direct_status' },
  { num: '03', label: 'PRODUCE', key: 'produce_status' },
  { num: '04', label: 'APPROVE', key: 'approve_status' },
] as const;

type PipelineState = Record<(typeof STEPS)[number]['key'], string> | null | undefined;

export function StudioPipelineBar({ pipeline }: { pipeline: PipelineState }) {
  return (
    <div className="site00-admin-pipeline" aria-label="Production pipeline">
      {STEPS.map((step) => {
        const status = pipeline?.[step.key] ?? 'PENDING';
        const className = [
          'site00-admin-pipeline__step',
          status === 'COMPLETE' ? 'site00-admin-pipeline__step--complete' : '',
          status === 'IN_PROGRESS' ? 'site00-admin-pipeline__step--active' : '',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <div key={step.key} className={className}>
            <div className="site00-admin-pipeline__num">{step.num}</div>
            <div className="site00-admin-pipeline__label">{step.label}</div>
            <div className="site00-admin-pipeline__status">{status.replace('_', ' ')}</div>
          </div>
        );
      })}
    </div>
  );
}
