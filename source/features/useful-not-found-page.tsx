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
      // Last part is always the 404
      if (index === pathParts.length - 1) {
        return getStrikeThrough(part);
      }

      // Routing segments (src/blob/edit) never exist as standalone pages
      if (index >= 2 && ["src", "blob", "edit", "tree"].includes(part)) {
        return getStrikeThrough(part);
      }

      // Every other segment is likely valid — make it clickable
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
