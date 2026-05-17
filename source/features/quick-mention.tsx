import "./quick-mention.css";

import delegate, { type DelegateEvent } from "delegate-it";
import React from "dom-chef";
import ReplyIcon from "octicons-plain-react/Reply";

import features from "../feature-manager.js";
import { registerHotkey } from "../github-helpers/hotkey.js";
import { isCompare, isConversation, isNewIssue, isPRFiles } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function addQuoteReplyButton(actions: HTMLElement): void {
  if (actions.querySelector(".rgf-quote-reply-button")) {
    return;
  }

  const comment = actions.closest(".comment");
  const quoteReply = comment?.querySelector<HTMLElement>(".quote-reply");
  if (!quoteReply) {
    return;
  }

  const button = (
    <button
      type="button"
      className={`btn-octicon rgf-quote-reply-button${
        quoteReply.classList.contains("quote-reply-diff") ? " quote-reply-diff" : ""
      }`}
      data-target={quoteReply.dataset.target}
      data-author={quoteReply.dataset.author}
      data-reference-url={quoteReply.dataset.referenceUrl}
      data-context={quoteReply.dataset.context}
      aria-label="Quote reply"
      data-tooltip-content="Quote reply"
    >
      <ReplyIcon />
    </button>
  );

  actions.prepend(button);
}

function clickQuoteReply(event: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
  const button = event.delegateTarget;
  const comment = button.closest(".comment");
  const quoteReply = comment?.querySelector<HTMLElement>(".quote-reply");
  quoteReply?.click();
}

function quoteSelectedText(): void {
  const selection = document.getSelection();
  if (!selection || selection.isCollapsed) {
    return;
  }

  const root = selection.anchorNode instanceof Element
    ? selection.anchorNode
    : selection.anchorNode?.parentElement;
  const comment = root?.closest(".comment");
  const quoteReply = comment?.querySelector<HTMLButtonElement>(".rgf-quote-reply-button");
  quoteReply?.click();
}

function init(signal: AbortSignal): void {
  observe(".comment-header-right.actions", element => {
    if (element instanceof HTMLElement) {
      addQuoteReplyButton(element);
    }
  }, { signal });

  delegate(".rgf-quote-reply-button", "mousedown", event => event.preventDefault(), { signal });
  delegate(".rgf-quote-reply-button", "click", clickQuoteReply, { signal });

  registerHotkey("r", quoteSelectedText, { signal });
}

void features.add(import.meta.url, {
  include: [
    isConversation,
    isPRFiles,
    isCompare,
    isNewIssue,
  ],
  init,
});
