import React from "dom-chef";
import { $ } from "select-dom";

import features from "../feature-manager.js";
import { buildRepoUrl } from "../github-helpers/index.js";

function init(): void {
  const container = $(".milestone");
  if (!container) {
    return;
  }

  const existingButton = container.querySelector("a[href*='/milestones/new']");
  if (existingButton) {
    return;
  }

  container.prepend(
    <a href={buildRepoUrl("milestones/new")} className="btn btn-sm">
      New Milestone
    </a>,
  );
}

features.add(import.meta.url, {
  include: [() => location.pathname.includes("/milestones/")],
  init,
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig/milestones
*/
