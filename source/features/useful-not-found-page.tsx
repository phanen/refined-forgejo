import React from "dom-chef";

import features from "../feature-manager.js";
import onetime from "../helpers/onetime.js";

function getCleanPathname(): string {
  return location.pathname.replace(/\/\/+/g, "/").replace(/\/$/, "").replace(/^\//, "");
}

async function isUrlReachable(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

function getStrikeThrough(text: string): HTMLElement {
  return <del style={{ opacity: 0.6 }}>{text}</del>;
}

async function crossIfNonExistent(anchor: HTMLElement): Promise<void> {
  if (anchor instanceof HTMLAnchorElement && !(await isUrlReachable(anchor.href))) {
    anchor.replaceWith(getStrikeThrough(anchor.textContent ?? ""));
  }
}

async function showMissingPartOnce(): Promise<void> {
  const pathParts = getCleanPathname().split("/");
  if (pathParts.length <= 1) {
    return;
  }

  const breadcrumbs = pathParts
    .map((part, index) => {
      if (index === pathParts.length - 1) {
        return getStrikeThrough(part);
      }

      if (index >= 2 && ["src", "blob", "edit", "tree"].includes(part)) {
        return getStrikeThrough(part);
      }

      const pathname = "/" + pathParts.slice(0, index + 1).join("/");
      const link = <a href={pathname}>{part}</a>;
      void crossIfNonExistent(link);
      return link;
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
