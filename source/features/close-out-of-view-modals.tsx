import delegate, { type DelegateEvent } from "delegate-it";
import { $$ } from "select-dom";

import features from "../feature-manager.js";

const visible = new Set();
const observer = new IntersectionObserver(entries => {
  let lastModal: Element | undefined;
  for (const { intersectionRatio, target: modal } of entries) {
    if (intersectionRatio > 0) {
      visible.add(modal);
    } else {
      visible.delete(modal);
    }

    lastModal = modal;
  }

  if (visible.size === 0 && lastModal) {
    observer.disconnect();
    const details = lastModal.closest("details") as HTMLDetailsElement | null;
    if (details) {
      details.open = false;
    }
  }
});

function menuActivatedHandler(event: DelegateEvent): void {
  const details = event.target as HTMLDetailsElement;

  const modals = $$([
    ":scope > details-menu",
    ":scope > details-dialog",
    ":scope > modal-dialog",
    ":scope > div > .dropdown-menu",
  ], details);

  for (const modal of modals) {
    observer.observe(modal);
  }
}

function init(): void {
  delegate(".details-overlay", "toggle", menuActivatedHandler, { capture: true });
}

features.add(import.meta.url, {
  init,
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig
- https://codeberg.org/ziglang/zig/issues
*/
