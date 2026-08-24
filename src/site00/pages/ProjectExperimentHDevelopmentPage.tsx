import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { site00ProjectBrandCharacterFormationPath } from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type { BrandCharacterFormationRun } from '../../../shared/site00-brand-lore/brandCharacterTerritory/types';
import type { BrandCharacterDevelopment } from '../../../shared/site00-brand-lore/brandCharacterTerritory/developmentTypes';
import '../styles/site00-replay-execution.css';
import '../styles/site00-experiment-g.css';

export default function ProjectExperimentHDevelopmentPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<BrandCharacterFormationRun | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.experimentHGet(projectSlug);
      setRun((result.run as BrandCharacterFormationRun | null) ?? null);
    } catch {
      setRun(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (projectSlug !== 'ndxbook') {
    return (
      <EcosystemShell hidePageHeader>
        <p>Brand Character Development is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  const developments = run?.developments ?? [];
  const projectTitle = projectDisplayName(projectSlug);

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <p className="site00-project-lore-calibration__kicker">CHARACTER DEVELOPMENT</p>
            <h1 className="site00-project-lore-calibration__project">{projectTitle}</h1>
            <p className="site00-project-lore-calibration__headline">DEVELOPED CHARACTER REVIEW</p>
            <Link to={site00ProjectBrandCharacterFormationPath(projectSlug)}>← TERRITORY REVIEW</Link>
          </header>
          <ProjectExperimentsHubNav projectSlug={projectSlug} />

          {loading ? (
            <p className="site00-experiment-g__pending">LOADING DEVELOPMENTS…</p>
          ) : developments.length === 0 ? (
            <p className="site00-experiment-g__pending">
              No developed characters yet. Mark territories LOVE THE CHARACTER or PROMISING — DEVELOP, then trigger development from Territory Review.
            </p>
          ) : (
            <div className="site00-experiment-g">
              {developments.map((dev: BrandCharacterDevelopment) => (
                <article key={dev.id} className="site00-experiment-g__card">
                  <h4 className="site00-experiment-g__card-title">DEVELOPED — {dev.parentTerritoryId}</h4>
                  <dl className="site00-experiment-g__dl">
                    <div><dt>WHO IS THIS?</dt><dd>{dev.coreCharacter.characterEssence || dev.coreCharacter.characterThesis}</dd></div>
                    <div><dt>THE CONTRADICTION</dt><dd>{dev.coreCharacter.characterContradiction || dev.productiveTension.governingContradiction}</dd></div>
                    <div><dt>HOW THEY THINK</dt><dd>{dev.intellectualCharacter.intelligenceStyle}</dd></div>
                    <div><dt>HOW THEY REACT</dt><dd>{dev.emotionalCharacter.irritationBehavior || dev.emotionalCharacter.delightBehavior}</dd></div>
                    <div><dt>HOW THEY TALK</dt><dd>{dev.languageCharacter.verbalCadence}</dd></div>
                    <div><dt>WHAT THEY FIND FUNNY</dt><dd>{dev.humorSystem.humorLogic || dev.humorSystem.humorMechanism}</dd></div>
                    <div><dt>HOW THEY RELATE TO CULTURE</dt><dd>{dev.culturalIntelligence.culturalPosition || dev.culturalIntelligence.culturalMemory}</dd></div>
                    <div><dt>HOW THEY RELATE TO YOU</dt><dd>{dev.socialCharacter.audienceRelationship}</dd></div>
                    <div><dt>WHAT THEY LOVE</dt><dd>{dev.coreCharacter.whatItFindsInteresting}</dd></div>
                    <div><dt>WHAT THEY CAN&apos;T STAND</dt><dd>{dev.coreCharacter.whatItRejects}</dd></div>
                    <div><dt>HOW THEY EXERCISE TASTE</dt><dd>{dev.tasteCharacter.tasteLogic}</dd></div>
                    <div><dt>WHEN THEY TOUCH AN ARTIFACT</dt><dd>{dev.artifactBehavior.traceOfHandling || dev.artifactBehavior.whatItAnnotates}</dd></div>
                    <div><dt>RANGE</dt><dd>{dev.allowedRange.join(' · ')}</dd></div>
                    <div><dt>NEVER THIS</dt><dd>{dev.antiDirections.join(' · ')}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </EcosystemShell>
  );
}
