import React from "dom-chef";
import PlayIcon from "octicons-plain-react/Play";

import features from "../feature-manager.js";
import observe from "../helpers/selector-observer.js";

function addIndicator(workflowLink: Element): void {
  const link = workflowLink as HTMLAnchorElement;
  const href = link.href;
  if (!href) {
    return;
  }

  if (workflowLink.querySelector(".rgf-play-indicator")) {
    return;
  }

  const playButton = (
    <a
      href={href}
      className="btn btn-sm btn-icon rgf-play-indicator"
      aria-label="Trigger workflow manually"
      title="Manual trigger"
    >
      <PlayIcon />
    </a>
  );

  link.after(playButton);
}

async function init(signal: AbortSignal): Promise<void> {
  observe(
    "a[href*='/actions/workflows/']",
    addIndicator,
    { signal },
  );
}

features.add(import.meta.url, {
  include: [() => location.pathname.includes("/actions/")],
  init,
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig/actions
*/
