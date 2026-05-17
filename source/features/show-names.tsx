import "./show-names.css";

import features from "../feature-manager.js";
import api from "../forgejo-helpers/api.js";
import { isConversation, isPRFiles } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

const fullNameCache = new Map<string, Promise<string | undefined>>();

async function getFullName(username: string): Promise<string | undefined> {
  let promise = fullNameCache.get(username);
  if (!promise) {
    promise = api.v1(`users/${username}`)
      .then(data => (data as { full_name?: string; name?: string }).full_name ?? (data as { name?: string }).name)
      .catch(() => undefined);
    fullNameCache.set(username, promise);
  }
  return promise;
}

function appendFullName(link: HTMLAnchorElement, fullName: string): void {
  if (link.dataset.rgfShowNames === "done") {
    return;
  }

  const username = link.textContent?.trim();
  if (!username || username === fullName) {
    return;
  }

  const suffix = document.createElement("span");
  suffix.className = "rgf-show-names";
  suffix.innerHTML = `(<span class="rgf-show-names-full-name">${fullName}</span>)`;
  link.insertAdjacentElement("afterend", suffix);
  link.dataset.rgfShowNames = "done";
}

function updateLink(link: HTMLAnchorElement): void {
  const username = link.textContent?.trim();
  if (!username || link.dataset.rgfShowNames === "done") {
    return;
  }

  void getFullName(username).then(fullName => {
    if (fullName) {
      appendFullName(link, fullName);
    }
  });
}

function init(signal: AbortSignal): void {
  observe(
    [
      ".comment-header-left .author[href^='/']",
      ".comment-code-cloud .author[href^='/']",
      ".timeline-item.event .author[href^='/']",
    ],
    element => {
      if (element instanceof HTMLAnchorElement) {
        updateLink(element);
      }
    },
    { signal },
  );
}

void features.add(import.meta.url, {
  include: [
    isConversation,
    isPRFiles,
  ],
  init,
});
