/**
 * B5.0R2 — Founder-facing error translation (never raw JSON).
 */

export type ExpressionEngineErrorView = {
  title: string;
  message: string;
  technicalDetail?: string;
  recoverable: boolean;
};

export function translateExpressionEngineError(raw: string | null): ExpressionEngineErrorView | null {
  if (!raw) return null;
  const trimmed = raw.trim();

  if (trimmed.startsWith('{') && trimmed.includes('ERROR')) {
    return {
      title: 'ENTRY CONTEXT UNAVAILABLE',
      message: 'We could not resolve the current Entry context.',
      technicalDetail: trimmed,
      recoverable: true,
    };
  }

  if (trimmed.includes('brandId') && trimmed.includes('entryNumber')) {
    return {
      title: 'ENTRY CONTEXT UNAVAILABLE',
      message: 'We could not resolve the current Entry context.',
      technicalDetail: trimmed,
      recoverable: true,
    };
  }

  if (trimmed.includes('<!DOCTYPE') || trimmed.includes('Unexpected token')) {
    return {
      title: 'EXPRESSION ENGINE UNAVAILABLE',
      message: 'The production API is temporarily unavailable. Retry shortly or return to Campaign Board.',
      technicalDetail: trimmed.slice(0, 500),
      recoverable: true,
    };
  }

  return {
    title: 'EXPRESSION ENGINE UNAVAILABLE',
    message: 'Something prevented the workspace from loading.',
    technicalDetail: trimmed,
    recoverable: true,
  };
}
