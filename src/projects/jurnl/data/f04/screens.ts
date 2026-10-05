export type F04ScreenDef = {
  id: string;
  name: string;
  role: 'PARENT';
  route: string;
  authorityFile: string;
};

const AUTH = 'public/jurnl/f04-activity/authorities/F04.00_ACTIVITY_PARENT.jpg';

export const F04_SCREENS: readonly F04ScreenDef[] = [
  { id: 'F04.00', name: 'ACTIVITY', role: 'PARENT', route: 'activity', authorityFile: AUTH },
];

export const f04ScreenForRoute = (route: string) => F04_SCREENS.find((s) => s.route === route.replace(/^\/+|\/+$/g, '')) ?? null;
