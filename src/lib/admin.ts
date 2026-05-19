export const ADMIN_PANEL_PASSWORD = "123654999";
export const GOOGLE_MAPS_API_KEY = "AIzaSyAeRL5ugx-QH2mDRf1RjxTW-XVKsYc7wm8";
export const ADMIN_UNLOCK_KEY = "medilife-admin-unlock-v1";

export function isAdminUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ADMIN_UNLOCK_KEY) === "1";
}
export function setAdminUnlocked(v: boolean) {
  if (typeof window === "undefined") return;
  if (v) localStorage.setItem(ADMIN_UNLOCK_KEY, "1");
  else localStorage.removeItem(ADMIN_UNLOCK_KEY);
}
