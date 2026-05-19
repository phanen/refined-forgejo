import React from "dom-chef";

import features from "../feature-manager.js";
import pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function addDeleteButton(container: Element): void {
  if (container.querySelector(".rgf-pr-delete-file")) {
    return;
  }

  const editButton = container.querySelector<HTMLAnchorElement>("a.ui.basic.button[href*='/_edit/']");
  if (!editButton) {
    return;
  }

  const deleteHref = editButton.href.replace("/_edit/", "/_delete/");
  if (deleteHref === editButton.href) {
    return;
  }

  editButton.after(
    <a className="rgf-pr-delete-file ui basic mini button" rel="nofollow" href={deleteHref}>
      Delete
    </a>,
  );
}

function init(signal: AbortSignal): void {
  observe(".diff-file-header-actions", addDeleteButton, { signal });
}

void features.add(import.meta.url, {
  include: [pageDetect.isPRFiles],
  init,
});
