import React from "dom-chef";

import features from "../feature-manager.js";
import { isConversation, isPRFiles } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function addHideButton(actions: HTMLElement): void {
  if (actions.querySelector(".rgf-quick-comment-hiding-button")) {
    return;
  }

  const codeComment = actions.closest<HTMLElement>(".comment-code-cloud");
  const hideButton = codeComment?.closest<HTMLElement>(".conversation-holder")?.querySelector<HTMLButtonElement>(
    `button[id^="hide-outdated-"], button[id^="show-outdated-"]`,
  );
  if (!hideButton) {
    return;
  }

  actions.prepend(
    <button
      type="button"
      className="ui tiny basic button rgf-quick-comment-hiding-button"
      aria-label="Hide thread"
      title="Hide thread"
      onMouseDown={event => event.preventDefault()}
      onClick={() => hideButton.click()}
    >
      Hide
    </button>,
  );
}

function init(signal: AbortSignal): void {
  observe(".comment-code-cloud .button-sequence", element => {
    if (element instanceof HTMLElement) {
      addHideButton(element);
    }
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    isConversation,
    isPRFiles,
  ],
  init,
});
