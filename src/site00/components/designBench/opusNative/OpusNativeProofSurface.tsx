/**
 * P0.VR.OPUS-NATIVE1 — Phase 23 proof surface.
 *
 * A deliberately small, test-only panel that the native Opus runtime performs
 * its first controlled visual task against. It exists so the proof can be real
 * — a genuine patch to a genuine rendered surface — without any approved
 * design work being exposed to an agent's first run.
 *
 * The one knob the agent touches is the `--proof-divider` token in
 * site00-opus-native.css, which draws the row boundaries below.
 */

export interface OpusNativeProofSurfaceProps {
  projectSlug: string;
  runtimeStatus: string;
}

export function OpusNativeProofSurface({ projectSlug, runtimeStatus }: OpusNativeProofSurfaceProps) {
  const rows: Array<[string, string]> = [
    ['project', projectSlug.toUpperCase()],
    ['surface', 'OPUS-NATIVE-PROOF'],
    ['runtime', runtimeStatus],
    ['model', 'CLAUDE-OPUS-5'],
    ['write scope', '1 FILE'],
    ['reversible', 'YES'],
  ];

  return (
    <section className="s00-opus-proof" aria-label="Native Opus proof surface">
      <div className="s00-opus-proof__bar">
        <span>Proof surface</span>
        <span>Test only</span>
      </div>
      <div className="s00-opus-proof__panel">
        {rows.map(([key, value]) => (
          <div className="s00-opus-proof__row" key={key}>
            <span className="s00-opus-proof__key">{key}</span>
            <span className="s00-opus-proof__value">{value}</span>
          </div>
        ))}
      </div>
      <p className="s00-opus-proof__note">
        This panel is the only surface the native runtime may modify. Its row dividers are drawn from a
        single CSS token so the first controlled task is one reversible edit.
      </p>
    </section>
  );
}

export default OpusNativeProofSurface;
