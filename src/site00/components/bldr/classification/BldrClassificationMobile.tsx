import type { BldrBuildClassIconId } from '../../../config/bldr-build-class-icons';
import { BldrImmersiveSelection } from './BldrImmersiveSelection';

type BldrClassificationMobileProps = {
  onSelectClass: (classId: BldrBuildClassIconId) => void;
  resumeHref?: string | null;
  resumeLabel?: string;
};

/** Mobile BLDR build classification — immersive portal route. */
export function BldrClassificationMobile(props: BldrClassificationMobileProps) {
  return <BldrImmersiveSelection {...props} />;
}
