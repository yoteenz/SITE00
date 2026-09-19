/**
 * P0.VR.8R3R3 — Founder-readable capture / authority upload transport errors.
 */

export function formatCaptureTransportError(code: string | null | undefined): string {
  switch (code) {
    case 'API_UNREACHABLE':
      return 'CAPTURE API UNREACHABLE — check Railway deploy and try again.';
    case 'CORS_REJECTED':
      return 'CAPTURE API BLOCKED BY CORS — redeploy API from latest main.';
    case 'ENDPOINT_NOT_FOUND':
      return 'CAPTURE API OUT OF DATE — redeploy Railway from latest main.';
    case 'REQUEST_TIMEOUT':
      return 'CAPTURE TIMED OUT — the page may still be loading on the server. Wait a moment, then try RECAPTURE.';
    case 'INVALID_API_BASE_URL':
      return 'API BASE URL NOT CONFIGURED for this host.';
    case 'MIXED_CONTENT_BLOCKED':
      return 'HTTPS PAGE CANNOT CALL HTTP API — check VITE_API_BASE.';
    case 'INVALID_API_RESPONSE':
      return 'CAPTURE API RETURNED HTML INSTEAD OF JSON — API host may be misconfigured.';
    case 'SERVER_5XX':
      return 'CAPTURE API SERVER ERROR — check Railway logs.';
    case 'AUTH_FAILED':
      return 'SIGN IN REQUIRED for cloud upload.';
    default:
      return code ? `CAPTURE API ERROR — ${code}` : 'REFERENCE UPLOAD FAILED';
  }
}

export function isRecoverableAuthorityUploadError(code: string | null | undefined): boolean {
  return (
    code === 'API_UNREACHABLE' ||
    code === 'CORS_REJECTED' ||
    code === 'ENDPOINT_NOT_FOUND' ||
    code === 'REQUEST_TIMEOUT' ||
    code === 'SERVER_5XX' ||
    code === 'INVALID_API_RESPONSE'
  );
}
