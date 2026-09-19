/** P0.APP.2 — Client app visual design lock status. */

export const CLIENT_APP_DESIGN_STATUS = 'REFERENCE_LOCKED_V1' as const;

export type ClientAppDesignStatus = typeof CLIENT_APP_DESIGN_STATUS;

export type AppScreenQaRecord = {
  screen: number;
  name: string;
  route: string;
  referenceMatched: boolean;
  shellMatched: boolean;
  spacingMatched: boolean;
  typeMatched: boolean;
  iconsMatched: boolean;
  interactionsVerified: boolean;
  responsiveVerified: boolean;
  remainingDeviation: string | null;
  screenshot: string;
};

export const CLIENT_APP_QA_MATRIX: AppScreenQaRecord[] = [
  { screen: 1, name: 'SPLASH', route: '/app', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-01-splash.png' },
  { screen: 2, name: 'PROJECT SELECT', route: '/app/preview/select', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-02-project-select.png' },
  { screen: 3, name: 'PROJECT PULSE', route: '/app/preview/fixture-app-ndxbook', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-03-project-pulse.png' },
  { screen: 4, name: 'OPPORTUNITY HOME', route: '/app/preview/fixture-app-website-only', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-04-opportunity.png' },
  { screen: 5, name: 'PROJECT MAP', route: '/app/preview/fixture-app-ndxbook/project/map', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-05-project-map.png' },
  { screen: 6, name: 'THE BUILD', route: '/app/preview/fixture-app-ndxbook/project/build', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-06-the-build.png' },
  { screen: 7, name: 'MILESTONES', route: '/app/preview/fixture-app-ndxbook/project/milestones', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-07-milestones.png' },
  { screen: 8, name: 'CLIENT TASKS', route: '/app/preview/fixture-app-identity-website/project/tasks', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-08-client-tasks.png' },
  { screen: 9, name: 'DECISIONS', route: '/app/preview/fixture-app-ndxbook/project/decisions', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-09-decisions.png' },
  { screen: 10, name: 'ACTIVITY', route: '/app/preview/fixture-app-ndxbook/project/activity', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-10-activity.png' },
  { screen: 11, name: 'REVIEWS QUEUE', route: '/app/preview/fixture-app-ndxbook/reviews', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-11-review-queue.png' },
  { screen: 12, name: 'REVIEW DETAIL', route: '/app/preview/fixture-app-ndxbook/reviews/review-identity-direction-02', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-12-review-detail.png' },
  { screen: 13, name: 'COMPARE', route: '/app/preview/fixture-app-ndxbook/reviews/review-identity-direction-02/compare', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-13-compare.png' },
  { screen: 14, name: 'COMMENTS', route: '/app/preview/fixture-app-ndxbook/reviews/review-identity-direction-02/comments', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-14-comments.png' },
  { screen: 15, name: 'ANNOTATIONS', route: '/app/preview/fixture-app-ndxbook/reviews/review-identity-direction-02/annotations', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-15-annotations.png' },
  { screen: 16, name: 'APPROVAL', route: '/app/preview/fixture-app-ndxbook/reviews/review-identity-direction-02/approve', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-16-approval.png' },
  { screen: 17, name: 'REVISION', route: '/app/preview/fixture-app-ndxbook/reviews/review-identity-direction-02/revision', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-17-revision.png' },
  { screen: 18, name: 'VERSION HISTORY', route: '/app/preview/fixture-app-ndxbook/reviews/review-identity-direction-02/history', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-18-version-history.png' },
  { screen: 19, name: 'INBOX', route: '/app/preview/fixture-app-ndxbook/inbox', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-19-inbox.png' },
  { screen: 20, name: 'LIBRARY', route: '/app/preview/fixture-app-ndxbook/library', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-20-library.png' },
  { screen: 21, name: 'LIBRARY CATEGORY', route: '/app/preview/fixture-app-ndxbook/library/approved-identity', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-21-library-category.png' },
  { screen: 22, name: 'FILE VIEWER', route: '/app/preview/fixture-app-ndxbook/library/approved-identity/file-1', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-22-file-viewer.png' },
  { screen: 23, name: 'BEHIND PROJECT', route: '/app/preview/fixture-app-ndxbook/project/behind', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-23-behind-project.png' },
  { screen: 24, name: 'POST-LAUNCH HOME', route: '/app/preview/fixture-app-post-launch', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-24-post-launch-home.png' },
  { screen: 25, name: 'POST-LAUNCH OPPORTUNITY', route: '/app/preview/fixture-app-post-launch-opportunity', referenceMatched: true, shellMatched: true, spacingMatched: true, typeMatched: true, iconsMatched: true, interactionsVerified: true, responsiveVerified: true, remainingDeviation: null, screenshot: 'client-app-screen-25-post-launch-opportunity.png' },
];
