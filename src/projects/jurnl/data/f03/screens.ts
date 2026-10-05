export type F03ScreenDef = {
  id: string;
  name: string;
  role: 'PARENT';
  route: string;
  authorityFile: string;
};

const AUTH = 'public/jurnl/f03-today/authorities/F03.00_TODAY_PARENT.jpg';

export const F03_SCREENS: readonly F03ScreenDef[] = [
  { id: 'F03.00', name: 'TODAY', role: 'PARENT', route: 'today', authorityFile: AUTH },
];

export const f03ScreenForRoute = (route: string) => F03_SCREENS.find((s) => s.route === route.replace(/^\/+|\/+$/g, '')) ?? null;
