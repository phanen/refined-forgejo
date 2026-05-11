import "./clean-footer.css";

import React from "dom-chef";

import features from "../feature-manager.js";
import observe from "../helpers/selector-observer.js";

function wrapInDetails(footer: Element): void {
  if (footer.closest("details")) {
    return;
  }

  const summary = <summary>Footer</summary>;
  const details = <details className="rgf-footer-details">{summary}</details>;

  // Move all children of footer into the details element
  while (footer.firstChild) {
    details.append(footer.firstChild);
  }

  footer.append(details);
}

function init(signal: AbortSignal): void {
  observe(".page-footer", wrapInDetails, { signal });
}

features.add(import.meta.url, {
  init,
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig
*/
