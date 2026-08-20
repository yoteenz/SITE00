import { CtrlRoomCommandHero } from './CtrlRoomCommandHero';
import { CtrlRoomOperatorCredential } from './CtrlRoomOperatorCredential';
import { CtrlRoomOperatingStatus } from './CtrlRoomOperatingStatus';
import { CtrlRoomCommandOverview } from './CtrlRoomCommandOverview';
import { CtrlRoomPropertyNetwork } from './CtrlRoomPropertyNetwork';
import { CtrlRoomActionQueue } from './CtrlRoomActionQueue';
import { CtrlRoomActivityStream } from './CtrlRoomActivityStream';
import { CtrlRoomClosingModule } from './CtrlRoomClosingModule';
import type { useCtrlRoomData } from '../../../hooks/useCtrlRoomData';

type CtrlRoomData = ReturnType<typeof useCtrlRoomData>;

type CtrlRoomMobileExperienceProps = {
  data: CtrlRoomData;
};

export function CtrlRoomMobileExperience({ data }: CtrlRoomMobileExperienceProps) {
  return (
    <div className="site00-ctrl-room-mobile">
      <CtrlRoomCommandHero />
      <CtrlRoomOperatorCredential operator={data.operator} />
      <CtrlRoomOperatingStatus signals={data.operatingSignals} />
      <CtrlRoomCommandOverview metrics={data.metrics} billingHint={data.billingHint} />
      <CtrlRoomPropertyNetwork sites={data.sites} apiState={data.apiState} buildHref={data.buildHref} />
      <div className="site00-ctrl-room-mobile__dual">
        <CtrlRoomActionQueue signals={data.signals} apiState={data.apiState} />
        <CtrlRoomActivityStream rows={data.activity} settingsHref={data.settingsHref} />
      </div>
      <CtrlRoomClosingModule projectsHref={data.projectsHref} buildHref={data.buildHref} />
    </div>
  );
}
