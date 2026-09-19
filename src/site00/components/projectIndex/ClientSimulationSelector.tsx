/**
 * B5.9R10 — Site 00-styled client simulation selector (floating popover).
 */

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { searchClients } from '../../../../shared/site00-projects/clientSimulation/clientDirectoryService.js';
import type { ClientDirectorySearchResult } from '../../../../shared/site00-projects/clientSimulation/types.js';
import { useSite00ProjectsIndex } from '../../hooks/useSite00Projects';
import { useProjectViewMode } from '../../context/ProjectViewModeContext';

export function ClientSimulationSelector() {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const { clientProjects } = useSite00ProjectsIndex();
  const {
    clientSelectorOpen,
    closeClientSelector,
    selectSimulatedClient,
    activeSimulatedClientId,
  } = useProjectViewMode();

  const results = useMemo(
    () => searchClients(query, clientProjects ?? []),
    [query, clientProjects],
  );

  useEffect(() => {
    if (!clientSelectorOpen) return;
    setQuery('');
    setHighlightIndex(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [clientSelectorOpen]);

  useEffect(() => {
    if (!clientSelectorOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeClientSelector();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [clientSelectorOpen, closeClientSelector]);

  if (!clientSelectorOpen) return null;

  const handleSelect = (client: ClientDirectorySearchResult) => {
    selectSimulatedClient(client.clientId, client.projectIds[0] ?? null);
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[highlightIndex]) {
      e.preventDefault();
      handleSelect(results[highlightIndex]!);
    }
  };

  return (
    <>
      <button
        type="button"
        className="site00-pidx-client-selector__backdrop"
        aria-label="Close client selector"
        onClick={closeClientSelector}
      />
      <div
        ref={panelRef}
        className="site00-pidx-client-selector"
        role="dialog"
        aria-label="View as client"
        data-overlay="client-selector"
      >
        <div className="site00-pidx-client-selector__header">
          <span className="site00-pidx-client-selector__title">VIEW AS CLIENT</span>
          <button type="button" className="site00-pidx-client-selector__close" onClick={closeClientSelector}>
            ×
          </button>
        </div>

        <label className="site00-pidx-client-selector__search-label" htmlFor={`${listboxId}-search`}>
          SEARCH CLIENTS
        </label>
        <input
          ref={inputRef}
          id={`${listboxId}-search`}
          type="search"
          className="site00-pidx-client-selector__search"
          placeholder="SEARCH CLIENTS..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlightIndex(0);
          }}
          onKeyDown={onInputKeyDown}
          autoComplete="off"
        />

        <p className="site00-pidx-client-selector__count">
          {String(results.length).padStart(2, '0')} CLIENT{results.length === 1 ? '' : 'S'}
        </p>

        <ul className="site00-pidx-client-selector__list" role="listbox" id={listboxId}>
          {results.length === 0 ? (
            <li className="site00-pidx-client-selector__empty">NO CLIENTS YET</li>
          ) : (
            results.map((client, index) => {
              const selected = client.clientId === activeSimulatedClientId;
              const highlighted = index === highlightIndex;
              return (
                <li key={client.clientId} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`site00-pidx-client-selector__row${selected ? ' is-selected' : ''}${highlighted ? ' is-highlighted' : ''}`}
                    onClick={() => handleSelect(client)}
                    onMouseEnter={() => setHighlightIndex(index)}
                  >
                    <span className="site00-pidx-client-selector__name">
                      {client.fullName.toUpperCase()}
                      {client.isDemoFixture ? <span className="site00-pidx-client-selector__demo">DEMO</span> : null}
                    </span>
                    <span className="site00-pidx-client-selector__meta">
                      {String(client.projectCount).padStart(2, '0')} PROJECTS
                    </span>
                    <span className="site00-pidx-client-selector__projects">
                      {client.projectLabels.join(' · ')}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </>
  );
}
