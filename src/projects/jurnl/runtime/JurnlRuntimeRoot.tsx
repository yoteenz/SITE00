/**
 * JURNL runtime root — the project body SITE 00 mounts at /production/jurnl/runtime/* (design-preview) and that a
 * future JURNL app shell mounts in production. Owns its own routing, state, fonts and styles.
 */

import { useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
// Type-only: the host's runtime mount contract (no host UI, styles or state cross into the project).
import type { ProjectRuntimeProps } from '../../../site00/projectRuntime/projectRuntimeRegistry';
import { F01_SCREENS } from '../data/f01/screens';
import { F02_SCREENS } from '../data/f02/screens';
import { JurnlOverlayHostContext, JurnlSuccessBanner } from './components/primitives';
import { JurnlEntitlementsProvider } from './monetization/JurnlEntitlements';
import { JurnlNavHostContext } from './components/ProductNav';
import { JurnlProductionServiceScreen } from './components/JurnlProductionServiceScreen';
import { JurnlRuntimeChrome } from './components/JurnlRuntimeChrome';
import { JurnlCornerChromeProvider } from './components/JurnlCornerChrome';
import { jurnlProductionFailClosed } from '../data/production/productionConfig';
import { JurnlStoreProvider, useJurnl } from './state/store';
import { CreateAccountScreen, ReturningUnlockScreen, SignInScreen, VerifyEmailScreen, WelcomeScreen } from './screens/EntryScreens';
import { ForgotPasswordScreen, NewPasswordScreen, ResetSentScreen, ResetSuccessScreen } from './screens/RecoveryScreens';
import { BiometricSetupScreen, DeviceTrustScreen, EntryCompleteScreen, PrivacyPrimerScreen, SecurityPrimerScreen } from './screens/SecurityScreens';
import { JURNL_F02_SCREEN_COMPONENTS } from './screens/SetupScreens';
import { PARENTS } from '../data/parents/catalog';
import { ActivityScreen, TodayScreen } from './screens/HomeScreens';
import { AccountScreen } from './screens/AccountScreens';
import { ParentAuthorityScreen, ParentReviewBoard } from './screens/ParentScreens';
import { MoneyHubScreen, MoneyPlaceDetailScreen, MoneyPlacesScreen } from './screens/MoneyScreens';
import { IncomeHubScreen, IncomeSourceScreen } from './screens/IncomeScreens';
import { UpcomingHubScreen, UpcomingItemScreen } from './screens/UpcomingScreens';
import { PlanHubScreen, PlanIntentionScreen } from './screens/PlanScreens';
import { SafeToSpendHubScreen, SafeToSpendReferenceScreen, SafeToSpendWhyScreen } from './screens/SafeToSpendScreens';
import { CheckPurchaseScreen } from './screens/CheckPurchaseScreens';
import { CreditHubScreen, CreditAccountScreen } from './screens/CreditScreens';
import { GoalsHubScreen, GoalDetailScreen } from './screens/GoalsScreens';
import { PurchasesHubScreen, PurchaseDetailScreen } from './screens/PurchasesScreens';
import { PurchaseCheckedScreen } from './screens/PurchaseCheckedScreen';
import { LockedPurchaseResultScreen } from './screens/LockedPurchaseResultScreen';
import { TripsHubScreen, TripDetailScreen } from './screens/TripsScreens';
import { PaydownHubScreen, PaydownWhatIfScreen } from './screens/PaydownScreens';
import { AheadHubScreen, AheadBranchScreen } from './screens/AheadScreens';
import { RecordsHubScreen, RecordDetailScreen } from './screens/RecordsScreens';
import './jurnl-runtime.css';
import './jurnl-environment.css';
import './jurnl-screens.css';
import './jurnl-setup.css';
import './jurnl-home.css';
import './jurnl-expression.css';
import './jurnl-parents.css';
import './jurnl-frame.css';
import './jurnl-archetypes.css';
import './jurnl-center-stage.css';
import './jurnl-f09-authority.css';
import './jurnl-root-authority.css';
import './jurnl-f10-checked.css';
import './jurnl-reference.css';

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
      {F02_SCREENS.map((s) => {
        const Screen = JURNL_F02_SCREEN_COMPONENTS[s.id as keyof typeof JURNL_F02_SCREEN_COMPONENTS];
        return <Route key={s.id} path={s.route} element={<Screen key={location.pathname} />} />;
      })}
      <Route path="today" element={<TodayScreen />} />
      <Route path="activity" element={<ActivityScreen />} />
      <Route path="account" element={<AccountScreen />} />
      <Route path="parents" element={<ParentReviewBoard />} />
      <Route path="money" element={<MoneyHubScreen />} />
      <Route path="money/places" element={<MoneyPlacesScreen />} />
      <Route path="money/places/:placeId" element={<MoneyPlaceDetailScreen />} />
      <Route path="income" element={<IncomeHubScreen />} />
      <Route path="income/:sourceId" element={<IncomeSourceScreen />} />
      <Route path="upcoming" element={<UpcomingHubScreen />} />
      <Route path="upcoming/:itemId" element={<UpcomingItemScreen />} />
      <Route path="plan" element={<PlanHubScreen />} />
      <Route path="plan/:intentionId" element={<PlanIntentionScreen />} />
      <Route path="safe" element={<SafeToSpendHubScreen />} />
      <Route path="safe/why" element={<SafeToSpendWhyScreen />} />
      <Route path="safe/check" element={<CheckPurchaseScreen />} />
      <Route path="safe/reference" element={<SafeToSpendReferenceScreen />} />
      <Route path="credit" element={<CreditHubScreen />} />
      <Route path="credit/:accountId" element={<CreditAccountScreen />} />
      <Route path="goals" element={<GoalsHubScreen />} />
      <Route path="goals/:goalId" element={<GoalDetailScreen />} />
      <Route path="purchases" element={<PurchasesHubScreen />} />
      <Route path="purchases/checked" element={<PurchaseCheckedScreen />} />
      <Route path="purchases/result/good-to-go" element={<LockedPurchaseResultScreen screenId="F09.RESULT.GOOD" />} />
      <Route path="purchases/result/quick-check-in" element={<LockedPurchaseResultScreen screenId="F09.RESULT.CHECK_IN" />} />
      <Route path="purchases/result/doesnt-fit" element={<LockedPurchaseResultScreen screenId="F09.RESULT.OVER" />} />
      <Route path="purchases/:purchaseId" element={<PurchaseDetailScreen />} />
      <Route path="trips" element={<TripsHubScreen />} />
      <Route path="trips/:tripId" element={<TripDetailScreen />} />
      <Route path="paydown" element={<PaydownHubScreen />} />
      <Route path="paydown/what-if" element={<PaydownWhatIfScreen />} />
      <Route path="ahead" element={<AheadHubScreen />} />
      <Route path="ahead/:branchId" element={<AheadBranchScreen />} />
      <Route path="records" element={<RecordsHubScreen />} />
      <Route path="records/:documentId" element={<RecordDetailScreen />} />
      {PARENTS.filter((p) => !['F05', 'F06', 'F07', 'F08', 'F09', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15', 'F16'].includes(p.id)).map((parent) => (
        <Route key={parent.id} path={parent.route} element={<ParentAuthorityScreen id={parent.id} />} />
      ))}
      <Route path="*" element={<EntryIndex />} />
    </Routes>
  );
}

export default function JurnlRuntimeRoot({ basePath, mode }: ProjectRuntimeProps) {
  const [overlayHost, setOverlayHost] = useState<HTMLElement | null>(null);
  const [navHost, setNavHost] = useState<HTMLElement | null>(null);
  if (mode === 'production' && jurnlProductionFailClosed(mode)) {
    return <JurnlProductionServiceScreen />;
  }
  return (
    <div className="jrn" data-project-runtime="jurnl" data-runtime-mode={mode} data-jrn-app-stage="canvas" lang="en">
      <JurnlNavHostContext.Provider value={navHost}>
      <JurnlOverlayHostContext.Provider value={overlayHost}>
        {/* Entitlements context only (no DOM): future families query capabilities; F01 never renders monetization UI. */}
        <JurnlEntitlementsProvider mode={mode}>
          <JurnlStoreProvider basePath={basePath} mode={mode}>
            <JurnlCornerChromeProvider>
            <JurnlRuntimeChrome />
            <JurnlRoutes />
            <Toast />
            </JurnlCornerChromeProvider>
          </JurnlStoreProvider>
        </JurnlEntitlementsProvider>
      </JurnlOverlayHostContext.Provider>
      </JurnlNavHostContext.Provider>
      {/* Viewport dock: the nav is centered to the viewport, outside every screen, column and animation. */}
      <div className="jrn-nav-host" ref={setNavHost} data-jrn-nav-host />
      <div className="jrn-overlay-host" ref={setOverlayHost} data-jrn-overlay-host />
    </div>
  );
}
