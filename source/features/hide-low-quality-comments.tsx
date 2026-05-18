import "./hide-low-quality-comments.css";

import React from "dom-chef";
import features from "../feature-manager.js";
import isLowQualityComment from "../helpers/is-low-quality-comment.js";
import * as pageDetect from "../helpers/page-detect.js";

function getCommentBody(comment: HTMLElement): HTMLElement | undefined {
  return comment.querySelector<HTMLElement>(".comment-body .markup, .comment-content .markup") ?? undefined;
}

function dispatchHiddenCommentsChanged(): void {
  document.dispatchEvent(new Event("rgf-hidden-comments-changed"));
}

function getHiddenCommentsNote(hiddenCount: number): string {
  return `${hiddenCount} hidden comment${hiddenCount > 1 ? "s" : ""}`;
}

function hideComment(comment: HTMLElement): void {
  comment.classList.add("rgf-hidden-comment");
  dispatchHiddenCommentsChanged();
}

function showComment(comment: HTMLElement): void {
  if (!comment.classList.contains("rgf-hidden-comment")) {
    return;
  }

  comment.classList.remove("rgf-hidden-comment");
  dispatchHiddenCommentsChanged();
}

function unhide(): void {
  for (const comment of document.querySelectorAll<HTMLElement>(".rgf-hidden-comment")) {
    comment.classList.remove("rgf-hidden-comment");
  }
  document.querySelector(".rgf-low-quality-comments-note")?.remove();
  dispatchHiddenCommentsChanged();
}

function shouldExpandComment(target: Element): boolean {
  return !target.closest(
    ".comment-header-right, button, a, input, textarea, select, .dropdown, .menu, [role='menuitem']",
  );
}

function initExpandOnClick(signal: AbortSignal): void {
  document.addEventListener("click", event => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const comment = event.target.closest<HTMLElement>(".rgf-hidden-comment");
    if (!comment || !shouldExpandComment(event.target)) {
      return;
    }

    showComment(comment);
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

  updateNote();
  document.addEventListener("rgf-hidden-comments-changed", updateNote, { signal });
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
