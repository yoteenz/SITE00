import { PresentationGate } from '../presentation';
import { DesktopEnter } from './enter/DesktopEnter';
import { MobileEnter } from './enter/MobileEnter';

/** Canonical /enter route — dedicated mobile and desktop presentations. */
export default function EnterPage() {
  return <PresentationGate mobile={<MobileEnter />} desktop={<DesktopEnter />} />;
}
