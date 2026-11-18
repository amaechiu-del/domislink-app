import test from "node:test";
import assert from "node:assert/strict";
import {
  APP_PREFERENCES_KEY,
  MAX_RECENT_APPS,
  normaliseAppPreferences,
  readAppPreferences,
  writeAppPreferences,
  togglePinnedApp,
  recordRecentApp,
} from "../src/data/app-preferences.js";

const ids = ["church", "meet", "studio", "summit", "tickets", "store", "wa", "property", "practice", "business-os"];

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
  };
}

test("normalises malformed data and removes unknown app IDs", () => {
  assert.deepEqual(normaliseAppPreferences({ pinned: ["church", "ghost", "church"], recent: ["meet", 5] }, ids), {
    pinned: ["church"],
    recent: ["meet"],
  });
});

test("reads safely when storage contains invalid JSON or throws", () => {
  assert.deepEqual(readAppPreferences(memoryStorage({ [APP_PREFERENCES_KEY]: "{" }), ids), { pinned: [], recent: [] });
  assert.deepEqual(readAppPreferences({ getItem() { throw new Error("blocked"); } }, ids), { pinned: [], recent: [] });
});

test("persists only valid app preferences", () => {
  const storage = memoryStorage();
  assert.equal(writeAppPreferences(storage, { pinned: ["church", "unknown"], recent: ["meet"] }, ids), true);
  assert.deepEqual(JSON.parse(storage.getItem(APP_PREFERENCES_KEY)), { pinned: ["church"], recent: ["meet"] });
});

test("toggles a favourite without losing recent apps", () => {
  const current = { pinned: ["church"], recent: ["meet"] };
  assert.deepEqual(togglePinnedApp(current, "meet", ids), { pinned: ["church", "meet"], recent: ["meet"] });
  assert.deepEqual(togglePinnedApp({ pinned: ["church", "meet"], recent: ["meet"] }, "church", ids), { pinned: ["meet"], recent: ["meet"] });
});

test("records recent apps newest-first, deduplicated and capped", () => {
  let current = { pinned: [], recent: [] };
  for (const id of ids) current = recordRecentApp(current, id, ids);
  assert.equal(current.recent.length, MAX_RECENT_APPS);
  assert.deepEqual(current.recent, ids.slice(-MAX_RECENT_APPS).reverse());
  current = recordRecentApp(current, "meet", ids);
  assert.equal(current.recent[0], "meet");
  assert.equal(current.recent.filter((id) => id === "meet").length, 1);
});

test("ignores attempts to pin or record an unregistered application", () => {
  const current = { pinned: ["church"], recent: ["meet"] };
  assert.deepEqual(togglePinnedApp(current, "unknown", ids), current);
  assert.deepEqual(recordRecentApp(current, "unknown", ids), current);
});
