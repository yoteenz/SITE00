/** Screen shell: environment + content column. `data-runtime-bounds` marks blocks for the host BOUNDS overlay. */

import type { ReactNode } from 'react';
import { JurnlEnvironment, type JurnlScene } from '../components/Environment';

export function JurnlScreen({
  screenId,
  scene,
  layout = 'hero',
  family = false,
  children,
}: {
  screenId: string;
  scene: JurnlScene;
  layout?: 'hero' | 'form' | 'center' | 'card';
  family?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="jrn-screen" data-transition={family ? 'family' : 'push'} data-jrn-screen={screenId}>
      <JurnlEnvironment scene={scene} />
      <div className={`jrn-col jrn-col--${layout}`} data-runtime-bounds="column">
        {children}
      </div>
    </section>
  );
}
