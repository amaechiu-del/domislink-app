export const APP_PREFERENCES_KEY = "domislink.one-link.preferences.v1";
export const MAX_RECENT_APPS = 6;

function validIdSet(validIds) {
  return new Set(Array.isArray(validIds) ? validIds.filter((id) => typeof id === "string") : []);
}

export function normaliseAppPreferences(value, validIds) {
  const allowed = validIdSet(validIds);
  const source = value && typeof value === "object" ? value : {};
  const pinned = Array.isArray(source.pinned)
    ? [...new Set(source.pinned.filter((id) => typeof id === "string" && allowed.has(id)))]
    : [];
  const recent = Array.isArray(source.recent)
    ? [...new Set(source.recent.filter((id) => typeof id === "string" && allowed.has(id)))].slice(0, MAX_RECENT_APPS)
    : [];
  return { pinned, recent };
}

export function readAppPreferences(storage, validIds) {
  if (!storage || typeof storage.getItem !== "function") return { pinned: [], recent: [] };
  try {
    const raw = storage.getItem(APP_PREFERENCES_KEY);
    return normaliseAppPreferences(raw ? JSON.parse(raw) : null, validIds);
  } catch {
    return { pinned: [], recent: [] };
  }
}

export function writeAppPreferences(storage, value, validIds) {
  if (!storage || typeof storage.setItem !== "function") return false;
  try {
    const safeValue = normaliseAppPreferences(value, validIds);
    storage.setItem(APP_PREFERENCES_KEY, JSON.stringify(safeValue));
    return true;
  } catch {
    return false;
  }
}

export function togglePinnedApp(value, appId, validIds) {
  const current = normaliseAppPreferences(value, validIds);
  if (!validIdSet(validIds).has(appId)) return current;
  const pinned = current.pinned.includes(appId)
    ? current.pinned.filter((id) => id !== appId)
    : [...current.pinned, appId];
  return { ...current, pinned };
}

export function recordRecentApp(value, appId, validIds) {
  const current = normaliseAppPreferences(value, validIds);
  if (!validIdSet(validIds).has(appId)) return current;
  return {
    ...current,
    recent: [appId, ...current.recent.filter((id) => id !== appId)].slice(0, MAX_RECENT_APPS),
  };
}
