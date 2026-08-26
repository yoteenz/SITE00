import { ImmersiveRouteFrame } from '../components/ImmersiveRouteFrame';
import { MobileArrivalScene } from '../components/scenes/MobileArrivalScene';

export default function AstralWorldHomePage() {
  return (
    <ImmersiveRouteFrame className="aw-route-scene--m01">
      <MobileArrivalScene />
    </ImmersiveRouteFrame>
  );
}
