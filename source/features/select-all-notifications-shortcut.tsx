import features from "../feature-manager.js";
import { isNotifications } from "../helpers/page-detect.js";
import { selectAllNotifications } from "./select-notifications.js";

function shouldIgnoreShortcutTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  if (target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
    return true;
  }

  if (target.tagName === "INPUT") {
    const input = target as HTMLInputElement;
    return !["checkbox", "radio", "button", "submit", "reset"].includes(input.type);
  }

  return false;
}

function init(signal: AbortSignal): void {
  document.addEventListener("keydown", event => {
    if (event.key.toLowerCase() !== "a" || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
      return;
    }

    if (shouldIgnoreShortcutTarget(event.target)) {
      return;
    }

    selectAllNotifications();
    event.preventDefault();
    event.stopPropagation();
  }, { signal, capture: true });
}

void features.add(import.meta.url, {
  include: [
    isNotifications,
  ],
  shortcuts: {
    a: "Select all notifications",
  },
  init,
});
