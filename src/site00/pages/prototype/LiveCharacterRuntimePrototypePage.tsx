/**
 * Dev-only architecture panel — not linked from production nav.
 */
import { Link } from 'react-router-dom';

export default function LiveCharacterRuntimePrototypePage() {
  if (!import.meta.env.DEV) {
    return <p>Live character runtime prototype is dev-only.</p>;
  }
  return (
    <main className="site00-page" style={{ padding: 24, maxWidth: 720 }} data-testid="live-character-runtime-prototype">
      <h1>Live Character Runtime (prototype)</h1>
      <p>
        Default Character Fabrication uses <strong>STATIC_AUTHORITY</strong>. Enable live mode with{' '}
        <code>?liveRuntime=1</code> on fabrication routes. Mock Unreal: add <code>&amp;runtimeMock=1</code> (ACKs are labeled{' '}
        <code>mock: true</code>).
      </p>
      <p>
        Real Unreal requires founder Windows host — see{' '}
        <code>docs/studio-world/live-character-runtime/LOCAL-UNREAL-SETUP.md</code>.
      </p>
      <ul>
        <li>
          <Link to="/production/ndxbook/expression/character-fabrication?entry=002&amp;station=identity&amp;designPreview=1">
            Character Fabrication (static default)
          </Link>
        </li>
        <li>
          <Link to="/production/ndxbook/expression/character-fabrication?entry=002&amp;station=identity&amp;designPreview=1&amp;liveRuntime=1&amp;runtimeMock=1">
            + liveRuntime + runtimeMock (MOCK adapter)
          </Link>
        </li>
      </ul>
    </main>
  );
}
