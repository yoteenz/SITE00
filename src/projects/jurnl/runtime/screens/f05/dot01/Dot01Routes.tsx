/**
 * F05 DOT 01 routes. With the MONEY parent pilot opted in (/money?parent=motion, remembered for the session), the
 * places directory and each place open the DOT 01 pages; otherwise the current screens stay (no regression for the
 * default MONEY hub). The new DOT 01 addresses (history, settings, balance review, entry) always open DOT 01 pages.
 */
import { MoneyPlaceDetailScreen, MoneyPlacesScreen } from '../../MoneyScreens';
import { resolveF05ParentVariant } from '../MoneyParentRoute';
import { AccountPage } from './AccountPage';
import { DirectoryPage } from './DirectoryPage';

function dot01(): boolean {
  return resolveF05ParentVariant(null) === 'motion';
}

export function F05PlacesRoute() {
  return dot01() ? <DirectoryPage /> : <MoneyPlacesScreen />;
}

export function F05PlaceRoute() {
  return dot01() ? <AccountPage /> : <MoneyPlaceDetailScreen />;
}

export { BalanceReviewPage, NeedsReviewPage, SettingsPage, TransactionDetailPage } from './DetailPages';
export { HistoryPage } from './HistoryPage';
