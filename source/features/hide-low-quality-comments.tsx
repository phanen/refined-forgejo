import "./preview-hidden-comments.css";
import "./hide-low-quality-comments.css";

import React from "dom-chef";
import UnfoldIcon from "octicons-plain-react/Unfold";
import features from "../feature-manager.js";
import isLowQualityComment from "../helpers/is-low-quality-comment.js";
import * as pageDetect from "../helpers/page-detect.js";

function getCommentBody(comment: HTMLElement): HTMLElement | undefined {
  return comment.querySelector<HTMLElement>(".comment-body .markup, .comment-content .markup") ?? undefined;
}

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

function getHiddenCommentsNote(hiddenCount: number): string {
  return `${hiddenCount} hidden comment${hiddenCount > 1 ? "s" : ""}`;
}

function hideComment(comment: HTMLElement): void {
  comment.classList.add("rgf-low-quality-comment");
  comment.classList.add("rgf-hidden-comment");
  updateOwnPreviews();
  updateNote();
}

function showComment(comment: HTMLElement): void {
  if (!comment.classList.contains("rgf-hidden-comment")) {
    return;
  }

  comment.classList.remove("rgf-hidden-comment");
  comment.querySelector<HTMLElement>(".rgf-preview-hidden-comments")?.remove();
  updateOwnPreviews();
  updateNote();
}

export function toggleComment(comment: HTMLElement): void {
  if (comment.classList.contains("rgf-hidden-comment")) {
    showComment(comment);
  } else {
    hideComment(comment);
  }
}

function createPreview(text: string, onClick: () => void): HTMLElement {
  return (
    <span
      className="rgf-preview-hidden-comments"
      title={text}
      data-tooltip-content={text}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event: React.KeyboardEvent<HTMLSpanElement>) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <span className="rgf-preview-hidden-comments-text">{text}</span>{" "}
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
        Show comment
      </button>
    </span>
  );
}

function updateOwnComment(comment: HTMLElement): void {
  const previewText = comment.classList.contains("rgf-hidden-comment") ? getOwnCommentPreview(comment) : "";
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
  header?.append(createPreview(previewText, () => toggleComment(comment)));
}

function updateOwnPreviews(): void {
  for (const comment of document.querySelectorAll<HTMLElement>(".comment.rgf-low-quality-comment")) {
    updateOwnComment(comment);
  }
}

function updateNote(): void {
  const hiddenCount = document.querySelectorAll(".rgf-hidden-comment").length;
  const noteTarget = document.querySelector<HTMLElement>(".time-desc, .pull-desc");
  if (!noteTarget) {
    return;
  }

  const note = document.querySelector<HTMLElement>(".rgf-low-quality-comments-note");
  if (!hiddenCount) {
    note?.remove();
    return;
  }

  if (note) {
    note.querySelector<HTMLElement>(".rgf-low-quality-comments-note-text")!.textContent = getHiddenCommentsNote(
      hiddenCount,
    );
    return;
  }

  noteTarget.insertAdjacentElement(
    "afterend",
    <span className="rgf-low-quality-comments-note">
      <span className="rgf-low-quality-comments-note-text">{getHiddenCommentsNote(hiddenCount)}</span>{" "}
      <button className="btn-link text-emphasized" type="button" onClick={unhide}>Show</button>
    </span>,
  );
}

function toggleCommentRoot(comment: HTMLElement, hiddenBefore?: boolean): void {
  if (hiddenBefore ?? comment.classList.contains("rgf-hidden-comment")) {
    comment.click();
    return;
  }

  comment.querySelector<HTMLElement>(".comment-header")?.click();
}

function unhide(): void {
  for (const comment of document.querySelectorAll<HTMLElement>(".rgf-hidden-comment")) {
    comment.classList.remove("rgf-hidden-comment");
  }
  document.querySelector(".rgf-low-quality-comments-note")?.remove();
  updateOwnPreviews();
  updateNote();
}

function shouldExpandComment(target: Element): boolean {
  return !target.closest(
    "button, a, input, textarea, select, .dropdown, .menu, [role='menuitem']",
  );
}

function shouldToggleCollapsedComment(comment: HTMLElement, target: Element): boolean {
  if (!comment.classList.contains("rgf-hidden-comment")) {
    return !!target.closest(".comment-header");
  }

  return true;
}

function initExpandOnClick(signal: AbortSignal): void {
  document.addEventListener("click", event => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const comment = event.target.closest<HTMLElement>(".rgf-low-quality-comment");
    if (!comment || !shouldExpandComment(event.target) || !shouldToggleCollapsedComment(comment, event.target)) {
      return;
    }

    if (event.altKey) {
      const hidden = comment.classList.contains("rgf-hidden-comment");
      const comments = [...document.querySelectorAll<HTMLElement>(
        hidden
          ? ".comment.rgf-low-quality-comment.rgf-hidden-comment"
          : ".comment.rgf-low-quality-comment:not(.rgf-hidden-comment)",
      )];

      event.preventDefault();
      event.stopImmediatePropagation();

      toggleCommentRoot(comment, hidden);
      for (const item of comments) {
        if (item !== comment) {
          toggleCommentRoot(item, hidden);
        }
      }
      return;
    }

    if (event.target.closest(".rgf-preview-hidden-comments")) {
      return;
    }

    toggleComment(comment);
  }, { signal, capture: true });
}

function init(signal: AbortSignal): void {
  for (const comment of document.querySelectorAll<HTMLElement>(".comment")) {
    const body = getCommentBody(comment);
    const text = body?.textContent?.trim();
    if (!text || !isLowQualityComment(text)) {
      continue;
    }

    if (body && body.querySelector("a, img, video, pre, code")) {
      continue;
    }

    hideComment(comment);
  }

  updateOwnPreviews();

  updateNote();
  initExpandOnClick(signal);
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isConversation,
    pageDetect.isPRFiles,
  ],
  awaitDomReady: true,
  init,
});
