export const ACCOUNT_PREFERENCES_KEY = "domislink.one-link.account-preview.v1";

export const DEFAULT_CHANNELS = { email: true, whatsapp: false, sms: true, push: true };\n\nexport const DEFAULT_ACCOUNT = {
  displayName: "",
  email: "",
  phone: "",
  language: "English",
  timezone: "Africa/Lagos",
  notifications: {
    security: true,
    product: true,
    announcements: false,
  },
};

function textValue(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function normaliseAccount(value) {
  const source = value && typeof value === "object" ? value : {};
  const notifications = source.notifications && typeof source.notifications === "object" ? source.notifications : {};\n  const channels = source.channels && typeof source.channels === "object" ? source.channels : {};
  const language = ["English", "French", "Portuguese"].includes(source.language) ? source.language : DEFAULT_ACCOUNT.language;
  const timezone = ["Africa/Lagos", "UTC", "Europe/London", "America/New_York"].includes(source.timezone)
    ? source.timezone : DEFAULT_ACCOUNT.timezone;
  return {
    displayName: textValue(source.displayName, 80),
    email: textValue(source.email, 254).toLowerCase(),
    phone: textValue(source.phone, 32),
    language,
    timezone,
    notifications: {
      security: notifications.security !== false,
      product: notifications.product !== false,
      announcements: notifications.announcements === true,
    },
  };
}

export function readAccount(storage) {
  if (!storage || typeof storage.getItem !== "function") return { ...DEFAULT_ACCOUNT, channels: { ...DEFAULT_CHANNELS }, notifications: { ...DEFAULT_ACCOUNT.notifications } };
  try {
    const raw = storage.getItem(ACCOUNT_PREFERENCES_KEY);
    return normaliseAccount(raw ? JSON.parse(raw) : null);
  } catch {
    return { ...DEFAULT_ACCOUNT, notifications: { ...DEFAULT_ACCOUNT.notifications } };
  }
}

export function saveAccount(storage, value) {
  if (!storage || typeof storage.setItem !== "function") return false;
  try {
    storage.setItem(ACCOUNT_PREFERENCES_KEY, JSON.stringify(normaliseAccount(value)));
    return true;
  } catch {
    return false;
  }
}
