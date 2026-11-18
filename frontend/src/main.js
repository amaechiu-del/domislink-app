import "./styles.css";
import { subdomains, statusLabels } from "./data/subdomains.js";
import { getAppDetails } from "./data/app-details.js";
import { readAccount, saveAccount, DEFAULT_ACCOUNT } from "./data/account-preferences.js";
import { readNotificationState, saveNotificationState, markNotificationRead, markAllNotificationsRead, filterNotifications } from "./data/notifications.js";
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
const detailDialog = document.querySelector("#app-detail-dialog");
const accountCentre = document.querySelector("#account-centre");
const accountStorage = getStorage();
let accountData = readAccount(accountStorage);
let notificationState = readNotificationState(accountStorage);
let activeNotificationFilter = "all";
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

  const detailButton = document.createElement("button");
  detailButton.type = "button";
  detailButton.className = "details-button";
  detailButton.textContent = "View details";
  detailButton.addEventListener("click", () => showAppDetails(app.id));

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
  article.append(top, category, heading, description, detailButton, footer);
  return article;
}


function showAppDetails(appId) {
  const app = subdomains.find((item) => item.id === appId);
  if (!app) return;
  const details = getAppDetails(app.id);
  const canOpen = Boolean(app.url && app.status !== "planned");

  const title = detailDialog.querySelector("#detail-title");
  const category = detailDialog.querySelector("#detail-category");
  const status = detailDialog.querySelector("#detail-status");
  const tagline = detailDialog.querySelector("#detail-tagline");
  const audience = detailDialog.querySelector("#detail-audience");
  const domain = detailDialog.querySelector("#detail-domain");
  const featureList = detailDialog.querySelector("#detail-features");
  const next = detailDialog.querySelector("#detail-next");
  const openLink = detailDialog.querySelector("#detail-open");
  const repoLink = detailDialog.querySelector("#detail-repo");

  title.textContent = app.name;
  category.textContent = app.category;
  status.className = `status-pill status-${app.status}`;
  status.textContent = statusLabels[app.status] ?? "Status unknown";
  tagline.textContent = details.tagline;
  audience.textContent = details.audience;
  domain.textContent = app.domain ?? "Production address not confirmed";
  featureList.replaceChildren(...details.features.map((feature) => {
    const item = document.createElement("li");
    item.textContent = feature;
    return item;
  }));
  next.textContent = details.next;

  openLink.hidden = !canOpen;
  if (canOpen) {
    openLink.href = app.url;
    openLink.onclick = () => {
      preferences = recordRecentApp(preferences, app.id, appIds);
      persistPreferences();
    };
  } else {
    openLink.removeAttribute("href");
    openLink.onclick = null;
  }

  repoLink.hidden = !app.repo;
  if (app.repo) {
    repoLink.href = `https://github.com/${app.repo}`;
  } else {
    repoLink.removeAttribute("href");
  }
  detailDialog.showModal();
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

  if (baseApps.length === 0 && activeView === "pinned") {
    emptyTitle.textContent = "No pinned apps yet";
    emptyDescription.textContent = "Use the star on an app card to add it to your favourites.";
  } else if (baseApps.length === 0 && activeView === "recent") {
    emptyTitle.textContent = "No recently opened apps";
    emptyDescription.textContent = "Apps you open will appear here for quick access.";
  } else {
    emptyTitle.textContent = "No matching apps";
    emptyDescription.textContent = "Try another search or category.";
  }
}


function setAccountTab(tabId) {
  document.querySelectorAll("[data-account-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.accountPanel !== tabId;
  });
  document.querySelectorAll("[data-account-tab]").forEach((button) => {
    button.setAttribute("aria-current", button.dataset.accountTab === tabId ? "page" : "false");
  });
}

function renderAccountCentre() {
  const name = document.querySelector("#account-display-name");
  const email = document.querySelector("#account-email");
  const phone = document.querySelector("#account-phone");
  const language = document.querySelector("#account-language");
  const timezone = document.querySelector("#account-timezone");
  const avatar = document.querySelector("#account-avatar");
  const title = document.querySelector("#account-greeting");
  const saved = document.querySelector("#account-save-state");

  name.value = accountData.displayName;
  email.value = accountData.email;
  phone.value = accountData.phone;
  language.value = accountData.language;
  timezone.value = accountData.timezone;
  const initials = accountData.displayName.trim().split(/\\s+/).filter(Boolean).slice(0,2).map((part)=>part[0].toUpperCase()).join("");
  avatar.textContent = initials || "DL";
  title.textContent = accountData.displayName ? `Welcome, ${accountData.displayName}` : "Your DomisLink account";
  saved.textContent = "Local preview · not connected to SSO";
  for (const key of ["security","product","announcements"]) {
    document.querySelector(`#notify-${key}`).checked = accountData.notifications[key];
  }

  const connected = document.querySelector("#connected-apps-list");
  renderNotificationCentre();
\n  connected.replaceChildren(...subdomains.map((app) => {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = app.name;
    const state = document.createElement("small");
    state.textContent = app.status === "planned" ? "Preparing" : "Not linked";
    li.append(label,state);
    return li;
  }));
}


function renderNotificationCentre() {
  const count = document.querySelector("#notification-unread-count");
  const list = document.querySelector("#notification-feed");
  if (!count || !list) return;
  const unread = filterNotifications("unread",notificationState).length;
  count.textContent = `${unread} unread`;
  const items = filterNotifications(activeNotificationFilter,notificationState);
  list.replaceChildren(...items.map((item) => {
    const card = document.createElement("article");
    card.className = `notification-card ${notificationState.read.includes(item.id) ? "is-read" : "is-unread"}`;
    const meta = document.createElement("div");
    meta.className = "notification-card-meta";
    const type = document.createElement("span");
    type.textContent = item.label;
    const example = document.createElement("span");
    example.textContent = "EXAMPLE";
    meta.append(type,example);
    const title = document.createElement("h3");
    title.textContent = item.title;
    const message = document.createElement("p");
    message.textContent = item.message;
    const footer = document.createElement("div");
    footer.className = "notification-card-footer";
    const state = document.createElement("span");
    state.textContent = notificationState.read.includes(item.id) ? "Read on this device" : "Unread";
    const action = document.createElement("button");
    action.type = "button";
    action.textContent = notificationState.read.includes(item.id) ? "Read" : "Mark as read";
    action.disabled = notificationState.read.includes(item.id);
    action.addEventListener("click",() => {
      notificationState = markNotificationRead(notificationState,item.id);
      saveNotificationState(accountStorage,notificationState);
      renderNotificationCentre();
    });
    footer.append(state,action);
    card.append(meta,title,message,footer);
    return card;
  }));
  document.querySelector("#notification-empty").hidden = items.length !== 0;
}

document.querySelectorAll("[data-notification-filter]").forEach((button) => {
  button.addEventListener("click",() => {
    activeNotificationFilter = button.dataset.notificationFilter;
    document.querySelectorAll("[data-notification-filter]").forEach((item) => {
      item.setAttribute("aria-pressed",String(item === button));
    });
    renderNotificationCentre();
  });
});
document.querySelector("#mark-all-notifications-read").addEventListener("click",() => {
  notificationState = markAllNotificationsRead(notificationState);
  saveNotificationState(accountStorage,notificationState);
  renderNotificationCentre();
});
\nfunction openAccountCentre() {
  document.querySelector(".hero").hidden = true;
  document.querySelector("#apps").hidden = true;
  document.querySelector("#identity").hidden = true;
  accountCentre.hidden = false;
  renderAccountCentre();
  setAccountTab("profile");
  window.scrollTo({top:0,behavior:"smooth"});
}

function closeAccountCentre() {
  accountCentre.hidden = true;
  document.querySelector(".hero").hidden = false;
  document.querySelector("#apps").hidden = false;
  document.querySelector("#identity").hidden = false;
  window.scrollTo({top:0,behavior:"smooth"});
}

document.querySelector("#open-account").addEventListener("click", openAccountCentre);
document.querySelector("#close-account").addEventListener("click", closeAccountCentre);
document.querySelectorAll("[data-account-tab]").forEach((button) => {
  button.addEventListener("click", () => setAccountTab(button.dataset.accountTab));
});

document.querySelector("#account-profile-form").addEventListener("submit", (event) => {
  event.preventDefault();
  accountData = {
    ...accountData,
    displayName: document.querySelector("#account-display-name").value,
    email: document.querySelector("#account-email").value,
    phone: document.querySelector("#account-phone").value,
    language: document.querySelector("#account-language").value,
    timezone: document.querySelector("#account-timezone").value,
  };
  if (saveAccount(accountStorage,accountData)) {
    renderAccountCentre();
    document.querySelector("#account-save-state").textContent = "Saved on this device";
  } else {
    document.querySelector("#account-save-state").textContent = "Local storage unavailable; changes were not saved";
  }
});

for (const key of ["security","product","announcements"]) {
  document.querySelector(`#notify-${key}`).addEventListener("change",(event) => {
    accountData.notifications[key] = event.target.checked;
    const ok = saveAccount(accountStorage,accountData);
    document.querySelector("#notification-save-state").textContent = ok
      ? "Notification preferences saved on this device"
      : "Local storage unavailable; preference was not saved";
  });
}


for (const key of ["email","whatsapp","sms","push"]) {
  document.querySelector(`#channel-${key}`).addEventListener("change",(event) => {
    accountData.channels[key] = event.target.checked;
    const ok = saveAccount(accountStorage,accountData);
    document.querySelector("#notification-save-state").textContent = ok
      ? "Channel preferences saved on this device; delivery is not connected"
      : "Local storage unavailable; preference was not saved";
  });
}
\ndocument.querySelector("#reset-account-preview").addEventListener("click", () => {
  accountData = { ...DEFAULT_ACCOUNT, notifications: { ...DEFAULT_ACCOUNT.notifications } };
  saveAccount(accountStorage,accountData);
  renderAccountCentre();
  document.querySelector("#privacy-reset-state").textContent = "Local account preview data reset";
});

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
document.querySelector("#close-detail-dialog").addEventListener("click", () => detailDialog.close());

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("One Link offline shell could not be registered:", error);
    });
  });
}
