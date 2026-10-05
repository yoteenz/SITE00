import type { TwinV2BuildCallPath } from './types.js';

/** Documented call path for BUILD THIS CONCEPT (approved V2 pilot). */
export function traceBuildThisConceptCallPath(): TwinV2BuildCallPath {
  return {
    steps: [
      'BUILD THIS CONCEPT',
      'PageConceptDirectedTwinV2Experience.handleBuildTwin',
      'prepareConceptDirectedTwinV2Build',
      'composeConceptDirectedTwinV2',
      'composeConceptDirectedTwinV2FromPackage',
      'buildTwinV2ViaVisualCompiler',
      'resolveTwinV2ImplementationStrategy',
      'runConceptVisualToCodeCompiler',
      'analyzeApprovedVisual',
      'ConceptVisualCompilerTwinV2 (render mount)',
      'buildTwinV2PreviewRoute',
    ],
  };
}
