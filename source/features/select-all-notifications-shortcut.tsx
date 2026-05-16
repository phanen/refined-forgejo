import features from "../feature-manager.js";
import { registerHotkey } from "../github-helpers/hotkey.js";
import pageDetect from "../helpers/page-detect.js";

function selectAllNotifications(): void {
  const button = document.querySelector<HTMLButtonElement>(
    "#notification_div form[action$='/notifications/purge'] button",
  );
  button?.click();
}

function init(signal: AbortSignal): void {
  registerHotkey("a", selectAllNotifications, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isNotifications,
  ],
  shortcuts: {
    a: "Select all notifications",
  },
  init,
});
