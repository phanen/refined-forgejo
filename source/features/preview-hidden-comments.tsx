import "./preview-hidden-comments.css";

import React from "dom-chef";
import UnfoldIcon from "octicons-plain-react/Unfold";
import features from "../feature-manager.js";
import * as pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";
import { toggleComment } from "./hide-low-quality-comments.js";

function normalizeText(text: string): string {
  return text.replaceAll(/\s+/g, " ").trim();
}

function truncate(text: string, maxLength = 180): string {
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function getOwnCommentPreview(comment: HTMLElement): string {
  const body = comment.querySelector<HTMLElement>(".comment-body .markup, .comment-content .markup");
  return truncate(normalizeText(body?.textContent ?? ""));
}

function getNativeConversationPreview(holder: HTMLElement): string {
  const body = holder.querySelector<HTMLElement>(
    ".comment-code-cloud .comment-content .markup, .comment-code-cloud .render-content.markup",
  );
  const text = normalizeText(body?.textContent ?? "");
  if (!text) {
    return "";
  }

  return truncate(text);
}

function isNativeHidden(holder: HTMLElement): boolean {
  return !!holder.querySelector(".comment-code-cloud.tw-hidden");
}

function createPreview(text: string, options: { onClick?: () => void; actionLabel?: string } = {}): HTMLElement {
  const { onClick, actionLabel } = options;
  return (
    <span
      className={`rgf-preview-hidden-comments${actionLabel ? " rgf-preview-hidden-comments-actionable" : ""}`}
      title={text}
      data-tooltip-content={text}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick
        ? (event: React.KeyboardEvent<HTMLSpanElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick();
          }
        }
        : undefined}
    >
      <span className="rgf-preview-hidden-comments-text">{text}</span>
      {actionLabel && onClick && (
        <>
          {" "}
          <button
            type="button"
            className="btn rgf-preview-hidden-comments-action"
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              onClick();
            }}
          >
            <UnfoldIcon />
            {actionLabel}
          </button>
        </>
      )}
    </span>
  );
}

function updateOwnComment(comment: HTMLElement): void {
  const previewText = comment.classList.contains("rgf-low-quality-comment") ? getOwnCommentPreview(comment) : "";
  const existing = comment.querySelector<HTMLElement>(".rgf-preview-hidden-comments");

  if (!previewText) {
    existing?.remove();
    return;
  }

  comment.classList.add("rgf-preview-hidden-comments-toggleable");

  if (existing) {
    const text = existing.querySelector<HTMLElement>(".rgf-preview-hidden-comments-text");
    if (text) {
      text.textContent = previewText;
    }
    existing.title = previewText;
    existing.dataset.tooltipContent = previewText;
    return;
  }

  const header = comment.querySelector<HTMLElement>(".comment-header");
  if (!header) {
    return;
  }

  header.append(createPreview(previewText, {
    actionLabel: "Show comment",
    onClick: () => toggleComment(comment),
  }));
}

function updateNativeConversation(holder: HTMLElement): void {
  const previewText = isNativeHidden(holder) ? getNativeConversationPreview(holder) : "";
  const existing = holder.querySelector<HTMLElement>(".rgf-preview-hidden-comments");

  if (!previewText) {
    existing?.remove();
    return;
  }

  if (existing) {
    const text = existing.querySelector<HTMLElement>(".rgf-preview-hidden-comments-text");
    if (text) {
      text.textContent = previewText;
    }
    existing.title = previewText;
    existing.dataset.tooltipContent = previewText;
    return;
  }

  const header = holder.querySelector<HTMLElement>(
    ".resolved-placeholder .tw-flex.tw-items-center.tw-gap-2, .collapsible-comment-box .tw-flex.tw-items-center.tw-gap-2",
  );
  if (!header) {
    return;
  }

  header.append(createPreview(previewText, {
    onClick: () => toggleNativeConversation(holder),
  }));
}

function updatePreviews(): void {
  for (const comment of document.querySelectorAll<HTMLElement>(".comment.rgf-hidden-comment")) {
    updateOwnComment(comment);
  }

  for (const holder of document.querySelectorAll<HTMLElement>(".conversation-holder")) {
    updateNativeConversation(holder);
  }
}

function toggleNativeConversation(holder: HTMLElement): void {
  const toggleButton = holder.querySelector<HTMLButtonElement>(
    ".show-outdated:not(.tw-hidden), .hide-outdated:not(.tw-hidden)",
  );
  toggleButton?.click();
  setTimeout(updatePreviews, 0);
}

function init(signal: AbortSignal): void {
  updatePreviews();

  observe(".comment.rgf-hidden-comment, .conversation-holder", updatePreviews, { signal });

  document.addEventListener("rgf-hidden-comments-changed", updatePreviews, { signal });

  document.addEventListener("click", event => {
    if (!(event.target instanceof Element)) {
      return;
    }

    if (event.target.closest(".show-outdated, .hide-outdated")) {
      setTimeout(updatePreviews, 0);
    }
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isConversation,
    pageDetect.isPRFiles,
  ],
  awaitDomReady: true,
  init,
});
