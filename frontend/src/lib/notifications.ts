// Lightweight wrapper around the browser Notification API.
// No backend / service worker involved — purely client-side OS notifications
// that fire while the tab is open (foreground or background).

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

/**
 * Ask the user for permission if we haven't yet. Safe to call multiple times.
 * Returns the final permission state.
 */
export async function ensureNotificationPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (!notificationsSupported()) return "unsupported";
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission;
  }
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return Notification.permission;
  }
}

interface NotifyOptions {
  body?: string;
  /** Only show when the tab is hidden (default: false → always show). */
  onlyWhenHidden?: boolean;
  /** Called when the user clicks the notification. */
  onClick?: () => void;
  /** Tag — newer notifications with same tag replace older ones. */
  tag?: string;
}

export function notify(title: string, opts: NotifyOptions = {}): Notification | null {
  if (!notificationsSupported()) return null;
  if (Notification.permission !== "granted") return null;
  if (opts.onlyWhenHidden && document.visibilityState === "visible") return null;

  try {
    const n = new Notification(title, {
      body: opts.body,
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      tag: opts.tag,
    });
    n.onclick = () => {
      window.focus();
      opts.onClick?.();
      n.close();
    };
    return n;
  } catch {
    return null;
  }
}
