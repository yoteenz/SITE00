export function assertNoSemanticFallbackInBuilderSource(source: string): void {
  const forbidden = [
    'composeTwinV2(pageIntent',
    'semantic composition fallback',
    'default NDXBOOK overview',
    'forensicReplicationBlueprint',
    'promoteTwinToLive',
  ];
  for (const needle of forbidden) {
    if (source.includes(needle)) {
      throw new Error(`TWIN_V2_GENERIC_RECOMPOSITION: forbidden fallback pattern "${needle}"`);
    }
  }
}

export function assertNoGhostedAuthorityImageInSource(source: string): void {
  const forbidden = ['authority-ghost', 'TWIN_V2_GHOSTED_AUTHORITY_IMAGE'];
  for (const needle of forbidden) {
    if (source.includes(needle)) {
      throw new Error('TWIN_V2_GHOSTED_AUTHORITY_IMAGE: full-page concept image cheat detected');
    }
  }
}

export function assertPackageDrivenComponentRef(componentRef: string): void {
  if (componentRef !== 'ConceptDirectedPackageTwinV2') {
    throw new Error('TWIN_V2_GENERIC_RECOMPOSITION: builder must render ConceptDirectedPackageTwinV2');
  }
}
