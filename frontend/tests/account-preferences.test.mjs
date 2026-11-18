import test from "node:test";
import assert from "node:assert/strict";
import { ACCOUNT_PREFERENCES_KEY, DEFAULT_ACCOUNT, normaliseAccount, readAccount, saveAccount } from "../src/data/account-preferences.js";

function storageMock(initial = {}) {
  const map = new Map(Object.entries(initial));
  return { getItem: (key) => map.get(key) ?? null, setItem: (key, value) => map.set(key, String(value)) };
}

test("normalises account fields and constrains preferences", () => {
  const account = normaliseAccount({
    displayName: "  Amaechi  ", email: " USER@EXAMPLE.COM ", phone: " 123 ",
    language: "Klingon", timezone: "Mars/Phobos",
    notifications: { security: false, product: true, announcements: true },
  });
  assert.equal(account.displayName, "Amaechi");
  assert.equal(account.email, "user@example.com");
  assert.equal(account.language, "English");
  assert.equal(account.timezone, "Africa/Lagos");
  assert.deepEqual(account.notifications, { security: false, product: true, announcements: true });
});

test("returns safe defaults for missing or malformed local storage", () => {
  assert.deepEqual(readAccount(storageMock()), DEFAULT_ACCOUNT);
  assert.deepEqual(readAccount(storageMock({ [ACCOUNT_PREFERENCES_KEY]: "bad-json" })), DEFAULT_ACCOUNT);
});

test("saves only allowlisted local account preferences", () => {
  const store = storageMock();
  assert.equal(saveAccount(store, { displayName: "Member", password: "do-not-store", notifications: { security: true } }), true);
  const saved = JSON.parse(store.getItem(ACCOUNT_PREFERENCES_KEY));
  assert.equal(saved.displayName, "Member");
  assert.equal("password" in saved, false);
});

test("stores only allowlisted delivery channels", () => {
  const account = normaliseAccount({
    channels: { email: false, whatsapp: true, sms: false, push: true, telegram: true },
  });
  assert.deepEqual(account.channels, { email: false, whatsapp: true, sms: false, push: true });
  assert.equal("telegram" in account.channels, false);
});

test("preserves local channel preferences when saved", () => {
  const store = storageMock();
  assert.equal(saveAccount(store, {
    displayName: "Member",
    channels: { email: true, whatsapp: true, sms: false, push: false },
  }), true);
  const saved = JSON.parse(store.getItem(ACCOUNT_PREFERENCES_KEY));
  assert.deepEqual(saved.channels, { email: true, whatsapp: true, sms: false, push: false });
});
