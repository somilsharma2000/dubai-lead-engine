// Role-based access control. Server-enforced in every API route and server action.
export const ROLES = ['PLATFORM_ADMIN','PLATFORM_OPS','OWNER','AGENCY_ADMIN','AGENCY_MEMBER','CLIENT_OWNER','CLIENT_MEMBER','ANALYST'] as const;
export type Role = (typeof ROLES)[number];

const CAN: Record<string, Role[]> = {
  'leads.read':      ['OWNER','AGENCY_ADMIN','AGENCY_MEMBER','CLIENT_OWNER','CLIENT_MEMBER','ANALYST'],
  'leads.write':     ['OWNER','AGENCY_ADMIN','AGENCY_MEMBER','CLIENT_OWNER','CLIENT_MEMBER'],
  'properties.read': ['OWNER','AGENCY_ADMIN','AGENCY_MEMBER','CLIENT_OWNER','CLIENT_MEMBER','ANALYST'],
  'properties.write': ['OWNER','AGENCY_ADMIN','AGENCY_MEMBER','CLIENT_OWNER','CLIENT_MEMBER'],
  'tasks.read':      ['OWNER','AGENCY_ADMIN','AGENCY_MEMBER','CLIENT_OWNER','CLIENT_MEMBER','ANALYST'],
  'tasks.write':     ['OWNER','AGENCY_ADMIN','AGENCY_MEMBER','CLIENT_OWNER','CLIENT_MEMBER'],
  'calendar.read':   ['OWNER','AGENCY_ADMIN','AGENCY_MEMBER','CLIENT_OWNER','CLIENT_MEMBER','ANALYST'],
  'calendar.write':  ['OWNER','AGENCY_ADMIN','AGENCY_MEMBER','CLIENT_OWNER','CLIENT_MEMBER'],
  'workflows.manage':['OWNER','AGENCY_ADMIN'],
  'settings.read':   ['OWNER','AGENCY_ADMIN','CLIENT_OWNER','ANALYST'],
  'settings.write':  ['OWNER','CLIENT_OWNER'],
  'team.write':      ['OWNER','CLIENT_OWNER'],
  'admin.platform':  ['PLATFORM_ADMIN'],
  'admin.ops':       ['PLATFORM_ADMIN','PLATFORM_OPS'],
};
export function can(role: string, perm: keyof typeof CAN | string): boolean {
  const list = CAN[perm]; return !!list && list.includes(role as Role);
}
