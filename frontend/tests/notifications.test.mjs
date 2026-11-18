import test from "node:test";
import assert from "node:assert/strict";
import {
  NOTIFICATION_STATE_KEY,
  previewNotifications,
  normaliseNotificationState,
  readNotificationState,
  saveNotificationState,
  markNotificationRead,
  markAllNotificationsRead,
  filterNotifications,
} from "../src/data/notifications.js";

function storageMock(initial = {}) {
  const map = new Map(Object.entries(initial));
  return { getItem: (key) => map.get(key) ?? null, setItem: (key, value) => map.set(key, String(value)) };
}

test("notification state only retains known, unique read IDs", () => {
  assert.deepEqual(normaliseNotificationState({ read: ["welcome", "unknown", "welcome", 7] }), { read: ["welcome"] });
});

test("read and save notification state safely", () => {
  const storage = storageMock();
  assert.deepEqual(readNotificationState(storage), { read: [] });
  assert.equal(saveNotificationState(storage, { read: ["welcome", "unknown"] }), true);
  assert.deepEqual(JSON.parse(storage.getItem(NOTIFICATION_STATE_KEY)), { read: ["welcome"] });
  assert.deepEqual(readNotificationState(storage), { read: ["welcome"] });
});

test("malformed and blocked storage falls back to unread state", () => {
  assert.deepEqual(readNotificationState(storageMock({ [NOTIFICATION_STATE_KEY]: "{" })), { read: [] });
  assert.deepEqual(readNotificationState({ getItem() { throw new Error("blocked"); } }), { read: [] });
});

test("mark one and all notifications read", () => {
  assert.deepEqual(markNotificationRead({ read: [] }, "welcome"), { read: ["welcome"] });
  assert.deepEqual(markNotificationRead({ read: [] }, "not-real"), { read: [] });
  assert.equal(markAllNotificationsRead({ read: [] }).read.length, previewNotifications.length);
});

test("filters all, unread, security and product announcements", () => {
  const state = { read: ["welcome"] };
  assert.equal(filterNotifications("all", state).length, 3);
  assert.equal(filterNotifications("unread", state).length, 2);
  assert.equal(filterNotifications("security", state)[0].id, "security-guide");
  assert.equal(filterNotifications("product", state).length, 2);
});
