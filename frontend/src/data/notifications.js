export const NOTIFICATION_STATE_KEY = "domislink.one-link.notifications-preview.v1";

export const previewNotifications = [
  { id:"welcome", type:"product", title:"Welcome to One Link", message:"Your DomisLink app directory and Account Centre are being brought together in one installable workspace.", label:"Product update", example:true },
  { id:"security-guide", type:"security", title:"Protect your account", message:"When the identity gateway is ready, add a passkey and confirm your recovery email and phone number.", label:"Security", example:true },
  { id:"apps-update", type:"announcement", title:"More DomisLink apps are joining", message:"Applications are being connected progressively. A product is only marked live after its real sign-in and key workflows are verified.", label:"Announcement", example:true },
];

export function normaliseNotificationState(value, validIds = previewNotifications.map((item) => item.id)) {
  const source = value && typeof value === "object" ? value : {};
  const allowed = new Set(validIds);
  const read = Array.isArray(source.read)
    ? [...new Set(source.read.filter((id) => typeof id === "string" && allowed.has(id)))]
    : [];
  return { read };
}

export function readNotificationState(storage) {
  if (!storage || typeof storage.getItem !== "function") return { read: [] };
  try {
    const raw = storage.getItem(NOTIFICATION_STATE_KEY);
    return normaliseNotificationState(raw ? JSON.parse(raw) : null);
  } catch {
    return { read: [] };
  }
}

export function saveNotificationState(storage, value) {
  if (!storage || typeof storage.setItem !== "function") return false;
  try {
    storage.setItem(NOTIFICATION_STATE_KEY, JSON.stringify(normaliseNotificationState(value)));
    return true;
  } catch {
    return false;
  }
}

export function markNotificationRead(value, notificationId) {
  const current = normaliseNotificationState(value);
  if (!previewNotifications.some((item) => item.id === notificationId)) return current;
  return { read: [...new Set([...current.read, notificationId])] };
}

export function markAllNotificationsRead(value) {
  return { read: previewNotifications.map((item) => item.id) };
}

export function filterNotifications(filter, state) {
  const current = normaliseNotificationState(state);
  return previewNotifications.filter((item) => {
    if (filter === "unread") return !current.read.includes(item.id);
    if (filter === "security") return item.type === "security";
    if (filter === "product") return item.type === "product" || item.type === "announcement";
    return true;
  });
}
