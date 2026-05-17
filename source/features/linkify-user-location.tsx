import React from "dom-chef";

import features from "../feature-manager.js";
import { getUser } from "../forgejo-helpers/index.js";
import { isUserProfile } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function linkifyProfileLocation(item: Element): void {
  const locationText = item.querySelector<HTMLElement>("span.tw-flex-1");
  if (!locationText || locationText.querySelector("a.rgf-user-location-link")) {
    return;
  }

  const location = locationText.textContent?.trim();
  if (!location) {
    return;
  }

  const mapLink = item.querySelector<HTMLAnchorElement>("a[href]");
  const href = mapLink?.href || `https://www.openstreetmap.org/search?query=${encodeURIComponent(location)}`;

  locationText.replaceChildren(
    <a className="rgf-user-location-link" href={href} rel="nofollow noreferrer" target="_blank">
      {location}
    </a>,
  );
}

function linkifyUserCardLocation(meta: Element): void {
  if (meta.querySelector("a, a.rgf-user-location-link") || !meta.querySelector("svg.octicon-location")) {
    return;
  }

  const text = meta.textContent?.trim();
  if (!text) {
    return;
  }

  const link = (
    <a
      className="rgf-user-location-link"
      href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(text)}`}
      rel="nofollow noreferrer"
      target="_blank"
    >
      {text}
    </a>
  );

  const svg = meta.querySelector("svg.octicon-location");
  svg?.insertAdjacentElement("afterend", link);
  for (const node of Array.from(meta.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      node.remove();
    }
  }
}

function init(signal: AbortSignal): void {
  if (!getUser()) {
    return;
  }

  observe("#profile-avatar-card li:has(svg.octicon-location), .user-cards .meta", element => {
    if (element.closest("#profile-avatar-card")) {
      linkifyProfileLocation(element);
    } else {
      linkifyUserCardLocation(element);
    }
  }, { signal });
}

features.add(import.meta.url, {
  include: [isUserProfile],
  init,
});
