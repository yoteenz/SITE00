import { DesktopHomeReferenceLayout } from '../components/DesktopHomeReferenceLayout';
import { MobileHomeReferenceLayout } from '../components/MobileHomeReferenceLayout';

export default function AstralWorldHomePage() {
  return (
    <>
      <div className="aw-desktop-only"><DesktopHomeReferenceLayout /></div>
      <div className="aw-mobile-only"><MobileHomeReferenceLayout /></div>
    </>
  );
}
