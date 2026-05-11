import React from "dom-chef";

import features from "../feature-manager.js";
import onetime from "../helpers/onetime.js";

function getCleanPathname(): string {
  return location.pathname.replace(/\/\/+/g, "/").replace(/\/$/, "").replace(/^\//, "");
}

async function showMissingPartOnce(): Promise<void> {
  const pathParts = getCleanPathname().split("/");
  if (pathParts.length <= 1) {
    return;
  }

  const breadcrumbs = pathParts
    .map((part, index) => {
      const pathname = "/" + pathParts.slice(0, index + 1).join("/");
      return <a href={pathname}>{part}</a>;
    })
    .flatMap((link, index) => [index > 0 && " / ", link]);

  const container = document.querySelector<HTMLElement>(
    ".page-content .ui.container, main .container",
  );
  if (!container) {
    return;
  }

  container.prepend(
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
- https://codeberg.org/ziglang/zig/nonexistent/path
*/