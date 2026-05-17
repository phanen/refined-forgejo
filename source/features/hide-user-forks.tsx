import features from "../feature-manager.js";
import onetime from "../helpers/onetime.js";
import { isUserProfile } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function addSourceTypeToLink(link: Element): void {
  const anchor = link as HTMLAnchorElement;
  const url = new URL(anchor.href);

  if (url.searchParams.has("fork") || url.searchParams.has("archived")) {
    return;
  }

  if (url.searchParams.get("tab") !== "repositories") {
    return;
  }

  url.searchParams.set("fork", "0");
  url.searchParams.set("archived", "0");
  anchor.href = url.href;
}

function initOnce(): void {
  observe(
    "a[href*='tab=repositories']",
    addSourceTypeToLink,
  );
}

features.add(import.meta.url, {
  include: [isUserProfile],
  init: onetime(initOnce),
});

/*
Test URLs:

- https://codeberg.org/ziglang
*/
