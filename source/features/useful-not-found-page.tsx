import React from "dom-chef";

import features from "../feature-manager.js";
import onetime from "../helpers/onetime.js";

function getCleanPathname(): string {
  return location.pathname.replace(/\/\/+/g, "/").replace(/\/$/, "").replace(/^\//, "");
}

function getStrikeThrough(text: string): HTMLElement {
  return <del style={{ opacity: 0.6 }}>{text}</del>;
}

async function showMissingPartOnce(): Promise<void> {
  const pathParts = getCleanPathname().split("/");
  if (pathParts.length <= 1) {
    return;
  }

  const breadcrumbs = pathParts
    .map((part, index) => {
      // Stríke through everything after owner/repo (all suspect in a 404)
      if (index >= 2) {
        return getStrikeThrough(part);
      }

      const pathname = "/" + pathParts.slice(0, index + 1).join("/");
      return <a href={pathname}>{part}</a>;
    })
    .flatMap((link, index) => [index > 0 && " / ", link]);

  const heading = document.querySelector<HTMLElement>("h1.error-code");
  if (!heading) {
    return;
  }

  heading.after(
    <h2 className="ui header center aligned" style={{ marginTop: "1em" }}>
      {breadcrumbs}
    </h2>,
  );
}

features.add(import.meta.url, {
  awaitDomReady: true,
  init: onetime(showMissingPartOnce),
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig/nonexistent
- https://codeberg.org/ziglang/zig/src/branch/main/nonexistent
*/
