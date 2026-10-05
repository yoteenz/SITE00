/**
 * P0.VR.DESIGN.OPUS-PROJECT-TABS1 — SKINS as the project's expression system.
 *
 * Not a theme builder. The founder does not choose a colour here; they read
 * the expression the project has committed to — palette, type ramp, material,
 * panel grammar, component styles — and then see how far it has actually been
 * applied across the page registry. The coverage and parity blocks are
 * measured, so this surface cannot claim an expression is in place on pages
 * that have no viewport authority.
 */

import { useMemo, useState } from 'react';

import { buildProjectSkinSystem } from '../../../../../../shared/site00-design-workspace-production/designProjectSkinSystem.js';
import { buildProjectPageArchitecture } from '../../../../../../shared/site00-design-workspace-production/designProjectLibraries.js';
import { pageFamilyPlateId } from '../../../../../../shared/site00-design-workspace-production/designProjectTabVisuals.js';
import { OverlayStatus } from '../designOverlayKit';
import {
  ProjectActionBar,
  ProjectCards,
  ProjectFilters,
  ProjectGroup,
  ProjectIdentity,
  ProjectPanes,
  ProjectSearch,
  ProjectSurface,
  useShellFormat,
} from '../designProjectSurfaceKit';
import { useDesignProductionNavigation } from '../useDesignProductionNavigation';
import { PsIconCompare, PsIconGrid, PsIconPalette, PsIconSliders } from './projectTabIcons';

const TYPE_CLASS: Record<string, string> = {
  Primary: 'tod-ps-type__item--sans',
  Display: 'tod-ps-type__item--cond',
  Accent: 'tod-ps-type__item--serif',
};

export function ProjectSkinsSurface() {
  const { projectSlug } = useDesignProductionNavigation();
  const format = useShellFormat();
  const skin = useMemo(() => buildProjectSkinSystem(projectSlug), [projectSlug]);
  const architecture = useMemo(() => buildProjectPageArchitecture(projectSlug), [projectSlug]);

  const [group, setGroup] = useState('all');
  const [query, setQuery] = useState('');

  const expressionCapture = useMemo(
    () =>
      architecture.families.map((family) => family.previewUrl).find(Boolean) ??
      '/site00/project-tabs/staged/raster/plate-ref-brand.jpg',
    [architecture.families],
  );

  const show = (id: string) => group === 'all' || group === id;
  const matches = (label: string) =>
    !query.trim() || label.toLowerCase().includes(query.trim().toLowerCase());

  return (
    <ProjectSurface id="skins">
      <ProjectIdentity
        name={skin.skinName}
        subtitle="PROJECT DESIGN SYSTEM"
        stats={[
          { label: 'SKIN', value: skin.version },
          { label: 'TOKENS', value: skin.palette.length + skin.typography.length },
          { label: 'PAGES COVERED', value: `${skin.pagesCovered}/${skin.pagesTotal}` },
          { label: 'FAMILIES', value: skin.coverage.length },
        ]}
        authority={{ label: 'EXPRESSION', state: skin.status, locked: skin.status === 'ACTIVE' }}
      />

      <ProjectPanes>
        <section className="tod-ps-feature">
          <span className="tod-ps-feature__eyebrow">ACTIVE PROJECT SKIN</span>
          <div className="tod-ps-feature__body">
            <div className="tod-ps-feature__shot">
              {expressionCapture ? (
                <img src={expressionCapture} alt={skin.skinName} loading="lazy" />
              ) : (
                /* No page in this project has been captured yet, so the plate
                   shows the expression itself rather than an empty frame. */
                <span className="tod-ps-skinPlate">
                  {skin.palette.map((swatch) => (
                    <i key={swatch.token} style={{ background: swatch.value }} />
                  ))}
                </span>
              )}
            </div>
            <div className="tod-ps-feature__meta">
              <span className={`tod-ok-status tod-ok-status--${skin.status === 'ACTIVE' ? 'ok' : 'na'}`}>
                {skin.status} · {skin.version}
              </span>
              <h3>{skin.tagline}</h3>
              <p className="tod-ps-feature__text">
                {skin.pagesCovered} of {skin.pagesTotal} pages carry this expression.
              </p>
              <div className="tod-ps-tags">
                {skin.traits.map((trait) => (
                  <span key={trait}>{trait}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <ProjectSearch
          placeholder="Search design system… (e.g. color, button, grid)"
          value={query}
          onChange={setQuery}
        />
        <ProjectFilters
          chips={[
            { id: 'all', label: 'ALL' },
            { id: 'foundations', label: 'FOUNDATIONS', count: skin.palette.length },
            { id: 'type', label: 'TYPOGRAPHY', count: skin.typography.length },
            { id: 'material', label: 'MATERIALS', count: skin.materials.length },
            { id: 'components', label: 'COMPONENTS', count: skin.componentStyles.length },
            { id: 'coverage', label: 'COVERAGE', count: skin.coverage.length },
          ]}
          activeId={group}
          onPick={setGroup}
        />

        {show('foundations') && matches('color palette') ? (
          <ProjectGroup title="COLOR PALETTE" meta={`${skin.palette.length} TOKENS`}>
            <div className="tod-ps-swatches">
              {skin.palette.map((swatch) => (
                <div key={swatch.token} className="tod-ps-swatch">
                  <span className="tod-ps-swatch__chip" style={{ background: swatch.value }} />
                  <strong>{swatch.token}</strong>
                  <em>{swatch.value}</em>
                </div>
              ))}
            </div>
          </ProjectGroup>
        ) : null}

        {show('type') && matches('typography') ? (
          <ProjectGroup title="TYPOGRAPHY SYSTEM" meta={`${skin.typography.length} STYLES`}>
            <div className="tod-ps-type">
              {skin.typography.map((style) => (
                <div
                  key={style.name}
                  className={`tod-ps-type__item ${TYPE_CLASS[style.role] ?? ''}`}
                >
                  <span className="tod-ps-type__sample">{style.sample}</span>
                  <strong>{style.name}</strong>
                  <em>
                    {style.role} · {style.stack}
                  </em>
                </div>
              ))}
            </div>
          </ProjectGroup>
        ) : null}

        {show('material') && matches('materials') ? (
          <ProjectGroup title="MATERIALS / ATMOSPHERE" meta={`${skin.materials.length}`}>
            <div className="tod-ps-tiles">
              {skin.materials.map((material) => (
                <div key={material.name} className="tod-ps-tile">
                  <span
                    className="tod-ps-tile__swatch"
                    data-texture={material.name.toLowerCase().replace(/\s+/g, '-')}
                    data-ptv-plate="material"
                  />
                  <strong>{material.name}</strong>
                  <em>{material.role}</em>
                </div>
              ))}
            </div>
          </ProjectGroup>
        ) : null}

        {show('material') && matches('texture') ? (
          <ProjectGroup title="TEXTURE LANGUAGE" meta={`${skin.textures.length}`}>
            <div className="tod-ps-tiles">
              {skin.textures.map((texture) => (
                <div key={texture} className="tod-ps-tile">
                  <span
                    className="tod-ps-tile__swatch"
                    data-texture={texture.toLowerCase().replace(/\s+/g, '-')}
                  />
                  <strong>{texture}</strong>
                </div>
              ))}
            </div>
          </ProjectGroup>
        ) : null}

        {show('components') && matches('components') ? (
          <ProjectGroup title="COMPONENT STYLES" meta={`${skin.componentStyles.length}`}>
            <div className="tod-ps-buttons">
              {skin.componentStyles.map((style) => (
                <span key={style.name} className="tod-ps-btnSample" data-tone={style.tone}>
                  {style.name}
                </span>
              ))}
            </div>
          </ProjectGroup>
        ) : null}

        {show('components') && matches('panel grammar') ? (
          <ProjectGroup title="PANEL GRAMMAR" meta={`${skin.panelGrammar.length} PATTERNS`}>
            <div className="tod-ps-tiles">
              {skin.panelGrammar.map((pattern) => (
                <div key={pattern.name} className="tod-ps-tile">
                  <span className="tod-ps-tile__swatch" data-texture="data-grid" />
                  <strong>{pattern.name}</strong>
                  <em>{pattern.role}</em>
                </div>
              ))}
            </div>
          </ProjectGroup>
        ) : null}

        {show('coverage') && matches('coverage') ? (
          <ProjectGroup title="APPLICATION COVERAGE" meta={`${skin.coverage.length} PAGE FAMILIES`}>
            {skin.coverage.length === 0 ? (
              <ProjectCards items={[]} emptyLabel="NO PAGES CARRY THIS EXPRESSION YET" />
            ) : (
              <table className="tod-ps-matrix">
                <thead>
                  <tr>
                    <th>FAMILY</th>
                    <th>PAGES</th>
                    <th>MOBILE</th>
                    <th>DESKTOP</th>
                    <th>PARITY</th>
                  </tr>
                </thead>
                <tbody>
                  {skin.coverage.map((row) => (
                    <tr key={row.family}>
                      <td>
                        <b>{row.family}</b>
                      </td>
                      <td>{row.pages}</td>
                      <td>{row.mobile}</td>
                      <td>{row.desktop}</td>
                      <td>{row.parity}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </ProjectGroup>
        ) : null}

        {show('coverage') && matches('parity') ? (
          <ProjectGroup title="PLATFORM PARITY" meta="DESKTOP + MOBILE">
            <ul className="tod-ps-checks">
              {skin.parity.map((check) => (
                <li key={check.label} data-ok={check.ok ? 'true' : 'false'}>
                  <i>{check.ok ? '✓' : ''}</i>
                  {check.label}
                </li>
              ))}
            </ul>
          </ProjectGroup>
        ) : null}

        {format === 'wide' && show('coverage') ? (
          <ProjectGroup title="EXPRESSION APPLIED" meta={`${architecture.families.length} FAMILIES`}>
            <ProjectCards
              items={architecture.families.map((family) => ({
                id: family.id,
                src:
                  family.previewUrl ??
                  `/site00/project-tabs/staged/${pageFamilyPlateId(family.label)}.svg`,
                title: family.label,
                sub: `${family.total} PAGES`,
                badge: family.needsDesign > 0 ? 'PARTIAL' : 'APPLIED',
                footer: family.route,
              }))}
              columns={6}
              emptyLabel="NO PAGE FAMILIES"
            />
          </ProjectGroup>
        ) : null}

        <ProjectGroup title="SKIN IDENTITY" meta={skin.version}>
          <div className="tod-ps-tags">
            <span>{skin.skinName}</span>
            <span>{skin.version}</span>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 10 }}>{skin.tagline}</p>
          <div style={{ marginTop: 6 }}>
            <OverlayStatus label={skin.status} />
          </div>
        </ProjectGroup>
      </ProjectPanes>

      <ProjectActionBar
        actions={[
          { id: 'edit', label: 'EDIT SYSTEM', icon: <PsIconSliders />, disabled: true },
          { id: 'tokens', label: 'VIEW TOKENS', icon: <PsIconPalette />, onClick: () => setGroup('foundations') },
          { id: 'icons', label: 'ICON SHEET', icon: <PsIconGrid />, onClick: () => setGroup('components') },
          { id: 'compare', label: 'COMPARE EXAMPLES', icon: <PsIconCompare />, onClick: () => setGroup('coverage') },
        ]}
      />
    </ProjectSurface>
  );
}
