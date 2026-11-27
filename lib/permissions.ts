export const PERMISSIONS={VIEW_DASHBOARD:"view_dashboard",APPLICATIONS:"applications",MODERATION:"moderation",TICKETS:"tickets",STAFF:"staff",ANNOUNCEMENTS:"announcements",CONTROL:"control",AUDIT:"audit"} as const;
export type Permission=typeof PERMISSIONS[keyof typeof PERMISSIONS];
export const STAFF_ROLE_IDS=(process.env.DISCORD_STAFF_ROLE_IDS||"").split(",").map(x=>x.trim()).filter(Boolean);
export function hasStaffRole(roleIds:string[]){return STAFF_ROLE_IDS.length>0&&roleIds.some(id=>STAFF_ROLE_IDS.includes(id));}