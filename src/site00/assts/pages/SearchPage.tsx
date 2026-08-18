import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AsstsAssetListRow } from '../components/AsstsCards';
import { useAsstsAutoRefresh } from '../components/AsstsDevPanel';
import { AsstsVaultSubpageShell } from '../components/AsstsVaultSubpageShell';
import { fetchAsstsLibrary, type AsstsAssetDetail } from '../services/asstsApi';

export default function AsstsSearchPage() {
  const [query, setQuery] = useState('');
  const [assets, setAssets] = useState<AsstsAssetDetail[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetchAsstsLibrary({ view: 'all' });
      setAssets(res.filteredAssets ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  }, []);

  useAsstsAutoRefresh(load, { hasGenerating: false });

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return assets.filter((a) => {
      const hay = `${a.asset_key} ${a.display_name} ${a.status}`.toLowerCase();
      return hay.includes(q);
    });
  }, [assets, query]);

  return (
    <AsstsVaultSubpageShell title="SEARCH." tagline="FIND ASSETS ACROSS THE VAULT.">
      <label className="assts-vault-subpage__search">
        <span className="assts-vault-subpage__search-label">SEARCH ASSETS</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ASSET KEY, NAME, STATUS…"
          className="assts-vault-subpage__search-input"
          autoComplete="off"
        />
      </label>

      {error ? (
        <div className="assts-alert assts-glass assts-glass--panel" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? <p className="assts-library-home__empty-note">LOADING VAULT INDEX…</p> : null}

      {!loading && query.trim() && results.length === 0 ? (
        <p className="assts-library-home__empty-note">No assets match &ldquo;{query.trim()}&rdquo;</p>
      ) : null}

      {!loading && !query.trim() ? (
        <p className="assts-library-home__empty-note">Enter a term to search the vault</p>
      ) : null}

      <div className="assts-filtered-list">
        {results.map((a) => (
          <AsstsAssetListRow
            key={a.id}
            assetKey={a.asset_key}
            displayName={a.display_name}
            previewUrl={a.currentVersion?.previewUrl}
            status={a.status}
            to={`/assts/${a.id}`}
          />
        ))}
      </div>

      <p className="assts-vault-subpage__hint">
        <Link to="/assts?view=all">Browse all assets</Link>
      </p>
    </AsstsVaultSubpageShell>
  );
}
