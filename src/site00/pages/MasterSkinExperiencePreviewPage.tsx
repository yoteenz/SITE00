/**
 * Founder preview — compare proof skins + doctor onboarding demo.
 */

import { MasterSkinEvolveProofPanel } from '../components/masterSkin/MasterSkinEvolveProofPanel.js';
import { MasterSkinOnboardingStep } from '../components/masterSkin/MasterSkinOnboardingStep.js';
import '../styles/site00-master-skin.css';

export function MasterSkinExperiencePreviewPage() {
  return (
    <div className="site00-master-skin-preview-page" style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ marginBottom: 24 }}>
        <h1>MASTER SKIN / EXPERIENCE PREVIEW</h1>
        <p>Compare NDXBOOK · Doctor Demo · AIO proof skins. Host shell unchanged; module expression differs.</p>
      </header>
      <MasterSkinEvolveProofPanel />
      <section style={{ marginTop: 32 }}>
        <MasterSkinOnboardingStep
          projectId="demo-doctor-health"
          fieldTags={['HEALTH', 'MEDICAL']}
          brandPersonality={['CALM', 'PRECISE', 'HUMAN', 'TRUSTED', 'EDUCATIONAL']}
          primaryColor="#2a7f8f"
          audience="PATIENTS"
        />
      </section>
    </div>
  );
}
