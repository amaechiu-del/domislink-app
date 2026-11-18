import "./styles.css";
import { subdomains, statusLabels } from "./data/subdomains.js";

const grid = document.querySelector("#apps-grid");
const search = document.querySelector("#app-search");
const filters = document.querySelector("#category-filters");
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
const year = document.querySelector("#year");
const installButton = document.querySelector("#install-button");
const installDialog = document.querySelector("#install-dialog");
let activeCategory = "All";
let deferredInstallPrompt = null;

year.textContent = new Date().getFullYear();

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

  const status = document.createElement("span");
  status.className = `status-pill status-${app.status}`;
  status.textContent = statusLabels[app.status] ?? "Status unknown";
  top.append(icon, status);

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

  const action = app.url ? document.createElement("a") : document.createElement("span");
  action.className = app.url ? "app-action" : "app-action app-action-disabled";
  action.textContent = app.url ? "Open app ↗" : "In preparation";
  if (app.url) {
    action.href = app.url;
    action.target = "_blank";
    action.rel = "noopener noreferrer";
    action.setAttribute("aria-label", `Open ${app.name} in a new tab; connection not yet verified`);
  }
  footer.append(domain, action);
  article.append(top, category, heading, description, footer);
  return article;
}

function renderApps() {
  const query = search.value.trim().toLowerCase();
  const visible = subdomains.filter((app) => {
    const matchesCategory = activeCategory === "All" || app.category === activeCategory;
    const haystack = [app.name, app.short, app.category, app.description, app.domain ?? ""].join(" ").toLowerCase();
    return matchesCategory && haystack.includes(query);
  });
  grid.replaceChildren(...visible.map(createAppCard));
  resultCount.textContent = `${visible.length} of ${subdomains.length} apps`;
  emptyState.hidden = visible.length !== 0;
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
