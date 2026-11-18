import test from "node:test";
import assert from "node:assert/strict";
import { subdomains } from "../src/data/subdomains.js";
import { appDetails, getAppDetails } from "../src/data/app-details.js";

test("every registered app has a product detail record", () => {
  for (const app of subdomains) {
    assert.ok(appDetails[app.id], `Missing detail record for ${app.id}`);
    assert.ok(appDetails[app.id].tagline.length > 15);
    assert.ok(appDetails[app.id].audience.length > 5);
    assert.ok(appDetails[app.id].next.length > 10);
  }
});

test("every product detail record has a feature list", () => {
  for (const app of subdomains) {
    assert.ok(Array.isArray(getAppDetails(app.id).features));
    assert.ok(getAppDetails(app.id).features.length >= 3);
  }
});

test("unknown products receive a safe fallback detail record", () => {
  const result = getAppDetails("unknown-app");
  assert.equal(result.features.length, 0);
  assert.ok(result.next.length > 0);
});
