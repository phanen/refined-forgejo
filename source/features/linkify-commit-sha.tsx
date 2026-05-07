import React from "dom-chef";

import features from "../feature-manager.js";
import { wrap } from "../helpers/dom-utils.js";

function init(): void {
  const element = document.querySelector(".sha, [class*='sha'], [class*='commit-sha']") as HTMLElement | null;
  if (element && !element.closest("a")) {
    const commitUrl = location.pathname.replace(/\/pull\/\d+\/commits/, "/commit");
    wrap(element, <a href={commitUrl} />);
  }
}

features.add(import.meta.url, {
  include: [() => /\/pull\/\d+\/commits/.test(location.pathname)],
  awaitDomReady: true,
  init,
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig/pulls/1/commits
*/
