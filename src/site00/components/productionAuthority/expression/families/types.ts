import type { ExpressionData } from '../expressionData';
import type { ExpressionFamilyId, ResolvedExpressionRoute } from '../expressionRoutes';

export type FamilyProps = {
  d: ExpressionData;
  r: ResolvedExpressionRoute;
  entry: string;
  /** href for a family route, preserving project + entry context */
  go: (family: ExpressionFamilyId, id?: string, param?: string) => string;
};
