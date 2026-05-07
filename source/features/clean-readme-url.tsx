import features from "../feature-manager.js";
import pageDetect from "../helpers/page-detect.js";

function maybeCleanUrl(): void {
  const parsed = new URL(location.href);
  if (parsed.searchParams.get("tab") === "readme" || parsed.searchParams.get("tab") === "readme-ov-file") {
    parsed.searchParams.delete("tab");
    history.replaceState(history.state, "", parsed.href);
  }
}

function init(): void {
  maybeCleanUrl();
  const interval = setInterval(maybeCleanUrl, 1000);
  document.addEventListener("turbo:before-visit", () => {
    clearInterval(interval);
  });
}

features.add(import.meta.url, {
  include: [
    pageDetect.isRepoHome,
  ],
  init,
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig
*/
