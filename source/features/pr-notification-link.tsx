import features from "../feature-manager.js";
import { pageDetect } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function normalizePrLink(link: HTMLAnchorElement): void {
  const match = link.pathname.match(/^\/[^/]+\/[^/]+\/pulls\/(\d+)\/commits(?:\/[^/?#]+)?$/);
  if (!match) {
    return;
  }

  link.pathname = link.pathname.replace(/\/pulls\/(\d+)\/commits(?:\/[^/?#]+)?$/, "/pulls/$1");
}

function init(signal: AbortSignal): void {
  observe("#notification_table a.notifications-link[href*='/pulls/'][href*='/commits/']", element => {
    normalizePrLink(element as HTMLAnchorElement);
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isNotifications,
  ],
  init,
});
