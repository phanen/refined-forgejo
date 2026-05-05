import React from "dom-chef";
import {$optional} from "select-dom";

import features from "../feature-manager.js";

function init(): false | void {
  const originalPreviousNext = $optional(".commit .float-right, [class*='ButtonGroup']:has(a[href*='/commits/']), [class*='commit-nav']");
  if (!originalPreviousNext) {
    return false;
  }

  const container = $optional("#files, [class*='diff'], [class*='commit']");
  if (!container) {
    return false;
  }

  const clone = originalPreviousNext.cloneNode(true) as HTMLElement;
  const wrapper = (
    <div className="rgh-prev-next-commit-buttons d-flex flex-justify-end mb-3">
      {clone}
    </div>
  );

  container.after(wrapper);
}

features.add(import.meta.url, {
  include: [() => /\/pull\/\d+\/commits/.test(location.pathname)],
  deduplicate: "has-rgh-prev-next",
  awaitDomReady: true,
  init,
});