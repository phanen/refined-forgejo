import delegate, { type DelegateEvent } from "delegate-it";

import features from "../feature-manager.js";
import { isIssueOrPR } from "../helpers/page-detect.js";

function triggerEdit(event: DelegateEvent<MouseEvent, HTMLElement>): void {
  // Don't trigger if a link, button or other interactive element was double-clicked
  if ((event.target as HTMLElement).closest("a, button, details, [role='button']")) {
    return;
  }

  const comment = event.delegateTarget.closest(".comment");
  if (!comment) {
    return;
  }

  // Forgejo edit button selectors
  const editButton = comment.querySelector<HTMLButtonElement | HTMLAnchorElement>(
    ".edit-content-button, .edit-content, a[href*='/_edit']",
  );

  if (editButton) {
    editButton.click();
  }
}

function init(signal: AbortSignal): void {
  // .render-content is often used for the actual markdown output in Forgejo/Gitea
  delegate(".comment-content, .render-content", "dblclick", triggerEdit, { signal });
}

features.add(import.meta.url, {
  include: [isIssueOrPR],
  init,
});
