import features from "../feature-manager.js";
import onetime from "../helpers/onetime.js";
import observe from "../helpers/selector-observer.js";

function addSourceTypeToLink(link: Element): void {
  const anchor = link as HTMLAnchorElement;
  const url = new URL(anchor.href);

  if (url.searchParams.has("type")) {
    return;
  }

  if (url.pathname.includes("/repositories") || url.pathname.match(/^\/[^\/]+\/[^\/]+\/?$/)) {
    url.searchParams.set("type", "source");
    anchor.href = url.href;
  }
}

function initOnce(): void {
  observe(
    "a[href*='?tab=repositories'], a[href*='/repositories']",
    addSourceTypeToLink,
  );
}

features.add(import.meta.url, {
  init: onetime(initOnce),
});