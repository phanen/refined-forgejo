import "./unclip-checks.css";

import delegate from "delegate-it";

import features from "../feature-manager.js";
import { isPR } from "../helpers/page-detect.js";

function enableUnclip(panel: HTMLElement): void {
  panel.classList.add("rgf-unclip-checks");
}

function init(signal: AbortSignal): void {
  delegate(
    "button.commit-status-hide-checks",
    "click",
    event => {
      const button = event.delegateTarget;
      const panel = button.closest<HTMLElement>(".commit-status-panel");
      if (!panel) {
        return;
      }

      // Forgejo toggles max-height itself; only override after the list is expanded.
      queueMicrotask(() => {
        const list = panel.querySelector<HTMLElement>(".commit-status-list");
        if (!list) {
          return;
        }

        if (list.style.maxHeight) {
          enableUnclip(panel);
        } else {
          panel.classList.remove("rgf-unclip-checks");
        }
      });
    },
    { signal, capture: true },
  );
}

void features.add(import.meta.url, {
  include: [
    isPR,
  ],
  init,
});
