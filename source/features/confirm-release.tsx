import delegate, { type DelegateEvent } from "delegate-it";

import features from "../feature-manager.js";
import { pageDetect } from "../helpers/page-detect.js";

function confirmPublish(event: DelegateEvent<SubmitEvent, HTMLFormElement>): void {
  // Forgejo release form has a button for "Publish Release" (name="publish") and "Save Draft" (name="draft").
  // We only want to confirm on publish.
  const isPublish = (event as unknown as SubmitEvent).submitter?.getAttribute("name") === "publish";
  if (isPublish && !confirm("Are you sure you want to publish this release?")) {
    event.preventDefault();
  }
}

function init(signal: AbortSignal): void {
  delegate("#release-form", "submit", confirmPublish, { signal });
}

void features.add(import.meta.url, {
  include: [pageDetect.isNewRelease, pageDetect.isEditingRelease],
  init,
});
