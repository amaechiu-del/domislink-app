import "./styles.css";
import { subdomains, statusLabels } from "./data/subdomains.js";
import {
  readAppPreferences,
  writeAppPreferences,
  togglePinnedApp,
  recordRecentApp,
} from "./data/app-preferences.js";

const grid = document.querySelector("#apps-grid");
const search = document.querySelector("#app-search");
const filters = document.querySelector("#category-filters");
const views = document.querySelector("#app-views");
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
const emptyTitle = emptyState.querySelector("strong");
const emptyDescription = emptyState.querySelector("span");
const year = document.querySelector("#year");
const installButton = document.querySelector("#install-button");
const installDialog = document.querySelector("#install-dialog");
const appIds = subdomains.map((app) => app.id);
let activeCategory = "All";
let activeView = "all";
let deferredInstallPrompt = null;

function getStorage() {
  try { return window.localStorage; } catch { return null; }
}

const storage = getStorage();
let preferences = readAppPreferences(storage, appIds);

function persistPreferences() {
  writeAppPreferences(storage, preferences, appIds);
}

year.textContent = new Date().getFullYear();

const viewDefinitions = [
  { id: "all", label: "All apps" },
  { id: "pinned", label: "Pinned" },
  { id: "recent", label: "Recent" },
];

for (const view of viewDefinitions) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "view-button";
  button.textContent = view.label;
  button.dataset.view = view.id;
  button.setAttribute("aria-pressed", String(view.id === activeView));
  button.addEventListener("click", () => {
    activeView = view.id;
    views.querySelectorAll("button").forEach((item) => {
      item.setAttribute("aria-pressed", String(item.dataset.view === activeView));
    });
    renderApps();
  });
  views.append(button);
}

const categories = ["All", ...new Set(subdomains.map((app) => app.category))];
for (const category of categories) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "filter-button";
  button.textContent = category;
  button.dataset.category = category;
  button.setAttribute("aria-pressed", String(category === activeCategory));
  button.addEventListener("click", () => {
    activeCategory = category;
    filters.querySelectorAll("button").forEach((item) => {
      item.setAttribute("aria-pressed", String(item.dataset.category === category));
    });
    renderApps();
  });
  filters.append(button);
}

function createAppCard(app) {
  const article = document.createElement("article");
  article.className = "app-card";
  article.dataset.status = app.status;

  const top = document.createElement("div");
  top.className = "app-card-top";

  const icon = document.createElement("div");
  icon.className = "app-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = app.icon;

  const pin = document.createElement("button");
  const isPinned = preferences.pinned.includes(app.id);
  pin.type = "button";
  pin.className = "pin-button";
  pin.textContent = isPinned ? "★" : "☆";
  pin.setAttribute("aria-pressed", String(isPinned));
  pin.setAttribute("aria-label", isPinned ? `Unpin ${app.name}` : `Pin ${app.name}`);
  pin.title = isPinned ? "Remove from pinned apps" : "Pin this app";
  pin.addEventListener("click", () => {
    preferences = togglePinnedApp(preferences, app.id, appIds);
    persistPreferences();
    renderApps();
  });

  const status = document.createElement("span");
  status.className = `status-pill status-${app.status}`;
  status.textContent = statusLabels[app.status] ?? "Status unknown";
  top.append(icon, pin, status);

  const category = document.createElement("p");
  category.className = "app-category";
  category.textContent = app.category;

  const heading = document.createElement("h3");
  heading.textContent = app.name;

  const description = document.createElement("p");
  description.className = "app-description";
  description.textContent = app.description;

  const footer = document.createElement("div");
  footer.className = "app-card-footer";

  const domain = document.createElement("span");
  domain.className = "app-domain";
  domain.textContent = app.domain ?? "Production address pending";

  const canOpen = Boolean(app.url && app.status !== "planned");
  const action = canOpen ? document.createElement("a") : document.createElement("span");
  action.className = canOpen ? "app-action" : "app-action app-action-disabled";
  action.textContent = canOpen ? "Open app ↗" : "Launch coming soon";
  if (canOpen) {
    action.href = app.url;
    action.target = "_blank";
    action.rel = "noopener noreferrer";
    action.setAttribute("aria-label", `Open ${app.name} in a new tab. ${statusLabels[app.status]}`);
    action.addEventListener("click", () => {
      preferences = recordRecentApp(preferences, app.id, appIds);
      persistPreferences();
    });
  }
  footer.append(domain, action);
  article.append(top, category, heading, description, footer);
  return article;
}

function getViewApps() {
  if (activeView === "pinned") {
    return subdomains.filter((app) => preferences.pinned.includes(app.id));
  }
  if (activeView === "recent") {
    return preferences.recent
      .map((id) => subdomains.find((app) => app.id === id))
      .filter(Boolean);
  }
  return subdomains;
}

function renderApps() {
  const query = search.value.trim().toLowerCase();
  const baseApps = getViewApps();
  const visible = baseApps.filter((app) => {
    const matchesCategory = activeCategory === "All" || app.category === activeCategory;
    const haystack = [app.name, app.short, app.category, app.description, app.domain ?? ""].join(" ").toLowerCase();
    return matchesCategory && haystack.includes(query);
  });

  grid.replaceChildren(...visible.map(createAppCard));
  resultCount.textContent = `${visible.length} shown · ${subdomains.length} total apps`;
  emptyState.hidden = visible.length !== 0;

  if (activeView === "pinned") {
    emptyTitle.textContent = "No pinned apps yet";
    emptyDescription.textContent = "Use the star on an app card to add it to your favourites.";
  } else if (activeView === "recent") {
    emptyTitle.textContent = "No recently opened apps";
    emptyDescription.textContent = "Apps you open will appear here for quick access.";
  } else {
    emptyTitle.textContent = "No matching apps";
    emptyDescription.textContent = "Try another search or category.";
  }
}

search.addEventListener("input", renderApps);
renderApps();

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.hidden = false;
});
installButton.addEventListener("click", async () => {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installButton.hidden = true;
    return;
  }
  installDialog.showModal();
});
document.querySelector("#close-install-dialog").addEventListener("click", () => installDialog.close());

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("One Link offline shell could not be registered:", error);
    });
  });
}
