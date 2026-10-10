// Barrel re-export: pages import server actions from their local '../actions'
// path; the real implementations live in src/server/actions/* — one module per
// business domain, no UI code inside.
export * from '@/server/actions/leads';
export * from '@/server/actions/tasks';
export * from '@/server/actions/properties';
export * from '@/server/actions/appointments';
export * from '@/server/actions/workflows';
export * from '@/server/actions/team';
export * from '@/server/actions/org';
export * from '@/server/actions/messaging';
export * from '@/server/actions/campaigns';
export * from '@/server/actions/billing';
export * from '@/server/actions/demo';
export * from '@/server/actions/admin';
