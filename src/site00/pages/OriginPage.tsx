import { PresentationGate } from '../presentation';
import { DesktopOrigin } from './origin/DesktopOrigin';
import { MobileOrigin } from './origin/MobileOrigin';

/** Canonical /origin route — presentation resolver selects MobileOrigin or DesktopOrigin. */
export default function OriginPage() {
  return <PresentationGate mobile={<MobileOrigin />} desktop={<DesktopOrigin />} />;
}
