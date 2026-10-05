/**
 * JURNL runtime root — the project body SITE 00 mounts at /production/jurnl/runtime/* (design-preview) and that a
 * future JURNL app shell mounts in production. Owns its own routing, state, fonts and styles.
 */

import { useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
// Type-only: the host's runtime mount contract (no host UI, styles or state cross into the project).
import type { ProjectRuntimeProps } from '../../../site00/projectRuntime/projectRuntimeRegistry';
import { F01_FAMILY_BOUNDARY, F01_SCREENS } from '../data/f01/screens';
import { JurnlOverlayHostContext, JurnlSuccessBanner } from './components/primitives';
import { JurnlEntitlementsProvider } from './monetization/JurnlEntitlements';
import { JurnlStoreProvider, useJurnl } from './state/store';
import { CreateAccountScreen, ReturningUnlockScreen, SignInScreen, VerifyEmailScreen, WelcomeScreen } from './screens/EntryScreens';
import { ForgotPasswordScreen, NewPasswordScreen, ResetSentScreen, ResetSuccessScreen } from './screens/RecoveryScreens';
import { BiometricSetupScreen, DeviceTrustScreen, EntryCompleteScreen, FamilyBoundaryScreen, PrivacyPrimerScreen, SecurityPrimerScreen } from './screens/SecurityScreens';
import './jurnl-runtime.css';
import './jurnl-environment.css';
import './jurnl-screens.css';

/** Screen id → runtime component. Every F01 screen in the contract must appear here (tests enforce it). */
export const JURNL_F01_SCREEN_COMPONENTS = {
  'F01.00': WelcomeScreen,
  'F01.01': CreateAccountScreen,
  'F01.02': VerifyEmailScreen,
  'F01.03': SignInScreen,
  'F01.04': ReturningUnlockScreen,
  'F01.05': ForgotPasswordScreen,
  'F01.06': ResetSentScreen,
  'F01.07': NewPasswordScreen,
  'F01.08': ResetSuccessScreen,
  'F01.09': BiometricSetupScreen,
  'F01.10': DeviceTrustScreen,
  'F01.11': PrivacyPrimerScreen,
  'F01.12': SecurityPrimerScreen,
  'F01.13': EntryCompleteScreen,
} as const;

/** Runtime entry: returning users land on unlock, signed-in sessions on entry complete, everyone else on welcome. */
function EntryIndex() {
  const { session, device, basePath, mode } = useJurnl();
  const { search } = useLocation();
  const target = session.status === 'ACTIVE' ? 'entry/complete' : device.remembered.length ? 'entry/unlock' : 'entry';
  // Design-preview keeps host scenario switches; production never sees them.
  return <Navigate to={`${basePath}/${target}${mode === 'design-preview' ? search : ''}`} replace />;
}

function Toast() {
  const { toast, dismissToast } = useJurnl();
  if (!toast) return null;
  return <JurnlSuccessBanner key={toast.id} tone={toast.tone} title={toast.title} body={toast.body} onClose={dismissToast} testId={toast.testId} />;
}

function JurnlRoutes() {
  const location = useLocation();
  return (
    <Routes location={location}>
      <Route index element={<EntryIndex />} />
      {F01_SCREENS.map((s) => {
        const Screen = JURNL_F01_SCREEN_COMPONENTS[s.id];
        return <Route key={s.id} path={s.route} element={<Screen key={location.pathname} />} />;
      })}
      <Route path={F01_FAMILY_BOUNDARY.route} element={<FamilyBoundaryScreen />} />
      <Route path="*" element={<EntryIndex />} />
    </Routes>
  );
}

export default function JurnlRuntimeRoot({ basePath, mode }: ProjectRuntimeProps) {
  const [overlayHost, setOverlayHost] = useState<HTMLElement | null>(null);
  return (
    <div className="jrn" data-project-runtime="jurnl" data-runtime-mode={mode} data-jrn-app-stage="canvas" lang="en">
      <JurnlOverlayHostContext.Provider value={overlayHost}>
        {/* Entitlements context only (no DOM): future families query capabilities; F01 never renders monetization UI. */}
        <JurnlEntitlementsProvider mode={mode}>
          <JurnlStoreProvider basePath={basePath} mode={mode}>
            <JurnlRoutes />
            <Toast />
          </JurnlStoreProvider>
        </JurnlEntitlementsProvider>
      </JurnlOverlayHostContext.Provider>
      <div className="jrn-overlay-host" ref={setOverlayHost} data-jrn-overlay-host />
    </div>
  );
}
