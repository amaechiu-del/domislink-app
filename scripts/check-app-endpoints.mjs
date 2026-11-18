import { subdomains } from "../frontend/src/data/subdomains.js";

const timeoutMs = Number(process.env.ONE_LINK_CHECK_TIMEOUT_MS || 10000);
const targets = subdomains.filter((app) => app.url && app.status !== "planned");

function safeHost(url) {
  try { return new URL(url).host; } catch { return "invalid-url"; }
}

async function check(app) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const response = await fetch(app.url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "DomisLink-One-Link-Endpoint-Audit/1.0" },
    });
    return {
      app: app.name,
      host: safeHost(app.url),
      result: response.status < 500 ? "HTTP_RESPONDED" : "HTTP_SERVER_ERROR",
      status: response.status,
      ms: Date.now() - started,
      finalUrl: response.url,
    };
  } catch (error) {
    return {
      app: app.name,
      host: safeHost(app.url),
      result: error.name === "AbortError" ? "TIMEOUT" : "UNREACHABLE",
      detail: error.cause?.code || error.message,
      ms: Date.now() - started,
    };
  } finally {
    clearTimeout(timer);
  }
}

const results = await Promise.all(targets.map(check));
console.log("DomisLink One Link — public endpoint reachability");
console.log("This checks HTTP response only; it does not verify login, permissions, payment, or tenant isolation.\n");
console.table(results.map(({ app, host, result, status, ms, detail }) => ({
  app, host, result, http: status ?? "-", ms, detail: detail ?? "",
})));

const responded = results.filter((item) => item.status !== undefined && item.status < 500).length;
console.log(`\nHTTP responses: ${responded}/${results.length}`);
console.log("Do not change an app to 'Verified live' from this check alone.");
if (results.length && responded !== results.length) process.exitCode = 1;
