import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSite00OriginWideViewport } from '../../components/shell/useSite00OriginWideViewport';
import { site00OriginMobileLayoutPreviewActive } from '../../components/shell/site00OriginViewport';
import {
  AccessCredentialClosedPanel,
  AccessCredentialInactivePanel,
  AccessCredentialNotRecognizedPanel,
  AccessCredentialRecognizedPanel,
} from '../../components/access/AccessCredentialPanels';
import { AccessCredentialDebugToolbar } from '../../components/access/AccessCredentialDebugToolbar';
import {
  buildAccessCredentialDebugMockView,
  parseAccessCredentialDebugState,
  SITE00_ACCESS_DEBUG_DEFAULT_CODE,
} from '../../config/access-debug';
import { normalizeAccessCredentialCode } from '../../config/access-credentials';
import { SITE00_ROUTES } from '../../config/routes';

/**
 * Isolated access landing audit surface — mock credential data, no API or scan events.
 *
 * `/access/debug`
 *
 * Query params:
 * - `state=recognized|not_found|closed|inactive|loading` (default recognized)
 * - `code=00-0001` (default founder credential)
 * - `static=1` — skip recognition animation (final authorized frame)
 * - `site00MobileLayout=1` — force mobile composition on wide viewports
 */
export default function AccessCredentialDebugPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const isWide = useSite00OriginWideViewport();
  const [entering, setEntering] = useState(false);

  const state = parseAccessCredentialDebugState(params.get('state'));
  const code = normalizeAccessCredentialCode(params.get('code') ?? SITE00_ACCESS_DEBUG_DEFAULT_CODE)
    ?? SITE00_ACCESS_DEBUG_DEFAULT_CODE;
  const staticAuthorized = params.get('static') === '1';
  const forceMobile = site00OriginMobileLayoutPreviewActive(`?${params.toString()}`);
  const layout: 'desktop' | 'mobile' = forceMobile || !isWide ? 'mobile' : 'desktop';

  const mockView = useMemo(() => buildAccessCredentialDebugMockView(code, state), [code, state]);

  const enterSite = () => {
    setEntering(true);
    navigate(SITE00_ROUTES.originAlias);
  };

  const shellProps = {
    staticAuthorized,
    forceLayout: forceMobile ? ('mobile' as const) : isWide ? ('desktop' as const) : undefined,
  };

  let body: JSX.Element;

  if (state === 'loading') {
    body = (
      <div className={`site00-access-page site00-access-page--${layout} site00-access-page--loading`.trim()} aria-busy="true">
        <div className="site00-access-page__loading">VERIFYING CREDENTIAL…</div>
      </div>
    );
  } else if (state === 'not_found') {
    body = <AccessCredentialNotRecognizedPanel credentialId={code} {...shellProps} />;
  } else if (state === 'closed') {
    body = (
      <AccessCredentialClosedPanel credentialId={code} onEnterPublic={() => navigate(SITE00_ROUTES.originAlias)} {...shellProps} />
    );
  } else if (state === 'inactive') {
    body = <AccessCredentialInactivePanel credentialId={code} {...shellProps} />;
  } else if (mockView) {
    body = (
      <AccessCredentialRecognizedPanel
        view={mockView}
        onEnter={enterSite}
        entering={entering}
        {...shellProps}
      />
    );
  } else {
    body = <AccessCredentialNotRecognizedPanel credentialId={code} {...shellProps} />;
  }

  return (
    <div className="site00-access-debug-root">
      <AccessCredentialDebugToolbar
        state={state}
        code={code}
        staticAuthorized={staticAuthorized}
        layout={layout}
      />
      {body}
    </div>
  );
}
