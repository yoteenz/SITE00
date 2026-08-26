import { useState } from 'react';
import { useAstralViewport } from '../../hooks/useAstralViewport';
import { DesktopHomeReferenceLayout } from '../DesktopHomeReferenceLayout';
import { AwM01WorldEntryScreen } from './AwM01WorldEntryScreen';
import { WhosHereWorldOverlay } from './overlays/WhosHereWorldOverlay';
import { TakeMeSomewhereWorldOverlay } from './overlays/TakeMeSomewhereWorldOverlay';

/**
 * SCENE 01: Arrival — AW_M_01 mobile canonical layout; desktop retains reference layout authority.
 */
export function MobileArrivalScene() {
  const { isMobile } = useAstralViewport();
  const [whosHereOpen, setWhosHereOpen] = useState(false);
  const [takeMeOpen, setTakeMeOpen] = useState(false);

  if (!isMobile) {
    return <DesktopHomeReferenceLayout />;
  }

  return (
    <>
      <AwM01WorldEntryScreen
        onWhosHere={() => setWhosHereOpen(true)}
        onTakeMeSomewhere={() => setTakeMeOpen(true)}
      />
      <WhosHereWorldOverlay open={whosHereOpen} onClose={() => setWhosHereOpen(false)} />
      <TakeMeSomewhereWorldOverlay open={takeMeOpen} onClose={() => setTakeMeOpen(false)} />
    </>
  );
}
