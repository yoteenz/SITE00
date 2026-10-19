import { FoundationReadinessDesk } from '../../pages/foundation/FoundationReadinessPage';
import { FounderWorkspacePageFrame } from '../shell/FounderWorkspacePageFrame';

export function SystemPage() {
  return (
    <FounderWorkspacePageFrame destination="system">
      <div className="ifw-system">
        <section className="ifw-panel">
          <h2 className="ifw-panel__title">Test lab · readiness</h2>
          <FoundationReadinessDesk embedded />
        </section>
      </div>
    </FounderWorkspacePageFrame>
  );
}
