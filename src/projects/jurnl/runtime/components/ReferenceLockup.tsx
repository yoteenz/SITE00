/**
 * The JURNL lockup as the founder references draw it: the approved sprig and JURNL word (cut from F09_LOCKUP.png,
 * haze removed, kept as two layers) with FINANCIAL LIFE. / BEAUTIFULLY ORGANIZED. set under it and PLAN TODAY. /
 * GROW FREELY. on the right. The screens arrange sprig and word differently, so each layer is placed by mapping its
 * own ink box onto the ink box measured in that screen's reference.
 */

import sprig from '../../families/F09_SAFE/REFERENCE_REPLICA/assets/LOCKUP_SPRIG.png';
import word from '../../families/F09_SAFE/REFERENCE_REPLICA/assets/LOCKUP_WORD.png';
import type { RefBox, RefType } from '../layout/referenceLayout';
import { RefText } from './ReferenceStage';

/** Each layer's pixel size and the ink box inside it. */
const LAYERS = {
  sprig: { src: sprig, w: 82, h: 78, ink: [2, 9, 78, 78] },
  word: { src: word, w: 196, h: 42, ink: [0, 0, 192, 40] },
} as const;

function placed(layer: keyof typeof LAYERS, target: RefBox) {
  const { w, h, ink } = LAYERS[layer];
  const sx = (target[2] - target[0]) / (ink[2] - ink[0]);
  const sy = (target[3] - target[1]) / (ink[3] - ink[1]);
  return { left: target[0] - ink[0] * sx, top: target[1] - ink[1] * sy, width: w * sx, height: h * sy };
}

type LockupLayout = {
  box: { sprig: RefBox; word: RefBox };
  text: { desc1: RefType; desc2: RefType; tag1?: RefType; tag2?: RefType };
};

export function ReferenceLockup({ L }: { L: LockupLayout }) {
  return (
    <div className="jrn-ref__lockup" role="img" aria-label="JURNL. FINANCIAL LIFE. BEAUTIFULLY ORGANIZED.">
      <img src={LAYERS.sprig.src} alt="" draggable={false} style={placed('sprig', L.box.sprig)} />
      <img src={LAYERS.word.src} alt="" draggable={false} style={placed('word', L.box.word)} />
      <RefText t={L.text.desc1} as="span">FINANCIAL LIFE.</RefText>
      <RefText t={L.text.desc2} as="span">BEAUTIFULLY ORGANIZED.</RefText>
      {L.text.tag1 && L.text.tag2 ? (
        <>
          <RefText t={L.text.tag1} as="span">PLAN TODAY.</RefText>
          <RefText t={L.text.tag2} as="span">GROW FREELY.</RefText>
        </>
      ) : null}
    </div>
  );
}
