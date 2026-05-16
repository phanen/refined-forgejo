import delegate from "delegate-it";
import React from "dom-chef";

import features from "../feature-manager.js";
import { isNotifications } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function openAllNotifications(): void {
  const links = [...document.querySelectorAll<HTMLAnchorElement>("#notification_table .notifications-link[href]")]
    .map(link => link.href);

  if (links.length === 0) {
    return;
  }

  if (links.length >= 10 && !confirm(`This will open ${links.length} new tabs. Continue?`)) {
    return;
  }

  for (const url of links) {
    window.open(url, "_blank", "noopener");
  }
}

function addOpenButton(container: Element): void {
  if (container.querySelector(".rgf-open-all-notifications")) {
    return;
  }

  container.append(
    <button type="button" className="ui basic button rgf-open-all-notifications">
      Open all
    </button>,
  );
}

function init(signal: AbortSignal): void {
  observe("#notification_div .button-row", addOpenButton, { signal });
  delegate("button.rgf-open-all-notifications", "click", openAllNotifications, { signal });
}

void features.add(import.meta.url, {
  include: [
    isNotifications,
  ],
  init,
});
