/** SITE 00 dual-context access — semantic separation (UX state, not authorization) */

export type Site00PlatformRole = 'ADMIN' | 'STANDARD';

/** Active experience context — additive to platform role; does not grant authorization */
export type Site00ExperienceContext = 'CLIENT' | 'ADMIN';

export type Site00AccessIdentity = {
  userId: string;
  email: string;
  platformRole: Site00PlatformRole;
  activeContext: Site00ExperienceContext;
};
