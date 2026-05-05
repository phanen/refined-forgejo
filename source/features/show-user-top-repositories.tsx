import React from "dom-chef";

import features from "../feature-manager.js";
import pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function addLink(title: Element): void {
  if (title.querySelector(".rgh-top-repos-link")) {
    return;
  }

  const url = new URL(location.pathname, location.href);
  url.search = new URLSearchParams({
    tab: "repositories",
    sort: "stars",
  }).toString();

  title.firstChild!.after(" / ", <a className="rgh-top-repos-link" href={url.href}>Top repositories</a>);
}

function init(signal: AbortSignal): void {
  observe(".js-pinned-items-reorder-container h2, .profile-repo-button-group, [class*='pinned'] h2", addLink, {
    signal,
  });
}

features.add(import.meta.url, {
  include: [
    pageDetect.isUserProfile,
  ],
  init,
});
