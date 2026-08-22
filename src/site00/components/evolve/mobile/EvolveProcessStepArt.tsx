type EvolveProcessStepArtProps = {
  step: string;
};

function PropertyArt() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M16 44L32 24L48 44" stroke="rgba(196,30,58,0.4)" strokeWidth="0.85" />
      <rect x="22" y="44" width="20" height="12" stroke="rgba(196,30,58,0.35)" strokeWidth="0.75" />
      <line x1="32" y1="24" x2="32" y2="14" stroke="rgba(196,30,58,0.35)" strokeWidth="0.75" />
    </svg>
  );
}

function DiagnoseArt() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="18" stroke="rgba(196,30,58,0.25)" strokeWidth="0.75" />
      <circle cx="32" cy="32" r="8" stroke="rgba(196,30,58,0.35)" strokeWidth="0.75" />
      <circle cx="32" cy="32" r="3" fill="rgba(196,30,58,0.5)" />
      <line x1="32" y1="10" x2="32" y2="54" stroke="rgba(0,0,0,0.1)" strokeWidth="0.75" />
      <line x1="10" y1="32" x2="54" y2="32" stroke="rgba(0,0,0,0.1)" strokeWidth="0.75" />
    </svg>
  );
}

function SystemsArt() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect x="14" y="22" width="14" height="14" stroke="rgba(196,30,58,0.35)" strokeWidth="0.75" />
      <rect x="36" y="22" width="14" height="14" stroke="rgba(196,30,58,0.35)" strokeWidth="0.75" />
      <rect x="25" y="38" width="14" height="14" stroke="rgba(196,30,58,0.35)" strokeWidth="0.75" />
      <line x1="28" y1="29" x2="36" y2="29" stroke="rgba(196,30,58,0.3)" strokeWidth="0.75" />
      <line x1="32" y1="36" x2="32" y2="38" stroke="rgba(196,30,58,0.3)" strokeWidth="0.75" />
    </svg>
  );
}

function AccessArt() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect x="20" y="24" width="24" height="20" stroke="rgba(196,30,58,0.35)" strokeWidth="0.75" />
      <circle cx="32" cy="34" r="5" stroke="rgba(196,30,58,0.4)" strokeWidth="0.75" />
      <path d="M14 34H20M44 34H50" stroke="rgba(196,30,58,0.25)" strokeWidth="0.75" />
    </svg>
  );
}

function ScopeArt() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect x="18" y="16" width="28" height="36" stroke="rgba(196,30,58,0.35)" strokeWidth="0.75" />
      <line x1="22" y1="24" x2="42" y2="24" stroke="rgba(0,0,0,0.12)" strokeWidth="0.75" />
      <line x1="22" y1="30" x2="38" y2="30" stroke="rgba(0,0,0,0.1)" strokeWidth="0.75" />
      <line x1="22" y1="36" x2="40" y2="36" stroke="rgba(0,0,0,0.1)" strokeWidth="0.75" />
    </svg>
  );
}

function StudioArt() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect x="16" y="20" width="32" height="28" stroke="rgba(196,30,58,0.35)" strokeWidth="0.75" />
      <path d="M16 20L32 10L48 20" stroke="rgba(196,30,58,0.35)" strokeWidth="0.75" />
      <circle cx="32" cy="34" r="4" fill="rgba(196,30,58,0.45)" />
    </svg>
  );
}

const ARTS: Record<string, () => JSX.Element> = {
  PROPERTY: PropertyArt,
  DIAGNOSE: DiagnoseArt,
  SYSTEMS: SystemsArt,
  ACCESS: AccessArt,
  SCOPE: ScopeArt,
  'ENTER STUDIO': StudioArt,
};

export function EvolveProcessStepArt({ step }: EvolveProcessStepArtProps) {
  const Art = ARTS[step] ?? PropertyArt;
  return (
    <div className="site00-evolve-mobile-process__art" aria-hidden="true">
      <Art />
    </div>
  );
}
