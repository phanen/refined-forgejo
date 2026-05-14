import features from "../feature-manager.js";

const cancelSelectors = [
  {
    container: ".edit-content-zone:not(.tw-hidden)",
    cancelButton: "button[data-button-name=\"cancel-edit\"]",
  },
  {
    container: "form.comment-form:not(.tw-hidden)",
    cancelButton: ".cancel-code-comment",
  },
  {
    container: "#issue-title-editor:not(.tw-hidden)",
    cancelButton: ".ui.cancel.button",
  },
];

function handler(event: KeyboardEvent): void {
  if (event.key !== "Escape" || event.defaultPrevented) {
    return;
  }

  const target = event.target as Element;

  // Handle search input blur
  if (target instanceof HTMLInputElement && (target.name === "q" || target.closest(".navbar-search, .repo-search"))) {
    target.blur();
    return;
  }

  // Climb up from target to find the nearest cancelable container
  for (const { container, cancelButton } of cancelSelectors) {
    const match = target.closest(container) as HTMLElement | null;
    if (!match) {
      continue;
    }

    const cancel = match.querySelector<HTMLElement>(cancelButton);
    cancel?.click();
    event.preventDefault();
    return;
  }
}

function init(signal: AbortSignal): void {
  globalThis.addEventListener("keydown", handler, { signal });
}

features.add(import.meta.url, {
  init,
});

/*
Test URLs:

- https://codeberg.org/forgejo/forgejo/issues/1
- https://codeberg.org/forgejo/forgejo/pulls/1
*/
