import type { ExperienceCompilerWorkspaceState } from '../../../studioos/experience-compiler/workspace/types';
import { ExperienceCompilerCreativeWorkspace } from './creativeWorkspace/ExperienceCompilerCreativeWorkspace';
import '../../../site00/styles/site00-ec-creative-workspace.css';

type Props = {
  state: ExperienceCompilerWorkspaceState;
};

/** Founder-facing creative workspace (CGPT director engine underneath). */
export function ExperienceCompilerCreativeDirectorPanel({ state }: Props) {
  return <ExperienceCompilerCreativeWorkspace state={state} />;
}
