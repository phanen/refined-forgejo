import "./highest-rated-comment.css";

import React from "dom-chef";
import features from "../feature-manager.js";
import isLowQualityComment from "../helpers/is-low-quality-comment.js";
import * as pageDetect from "../helpers/page-detect.js";
import { waitForElement } from "../helpers/selector-observer.js";

const positiveReactions = new Set(["+1", "heart", "hooray"]);
const negativeReactions = new Set(["-1"]);

function getReactionCount(comment: Element, contents: Set<string>): number {
  let count = 0;
  for (
    const reaction of comment.querySelectorAll<HTMLElement>(
      ".comment-reactions [data-reaction-content], .reactions [data-reaction-content]",
    )
  ) {
    if (!contents.has(reaction.dataset.reactionContent ?? "")) {
      continue;
    }
    const reactionCount = Number.parseInt(reaction.querySelector(".reaction-count")?.textContent ?? "0", 10);
    count += Number.isFinite(reactionCount) ? reactionCount : 0;
  }
  return count;
}

function getBestComment(): HTMLElement | undefined {
  let best: { comment: HTMLElement; score: number } | undefined;
  for (const comment of document.querySelectorAll<HTMLElement>(".comment")) {
    const body = comment.querySelector<HTMLElement>(".comment-body .markup, .comment-content .markup");
    const text = body?.textContent?.trim();
    if (!text || isLowQualityComment(text)) {
      continue;
    }

    const positive = getReactionCount(comment, positiveReactions);
    if (positive < 10) {
      continue;
    }

    const negative = getReactionCount(comment, negativeReactions);
    if (negative >= positive / 2) {
      continue;
    }

    if (!best || positive > best.score) {
      best = { comment, score: positive };
    }
  }
  return best?.comment;
}

function highlightBestComment(comment: HTMLElement): void {
  comment.classList.add("rgf-highest-rated-comment");

  const headerLeft = comment.querySelector<HTMLElement>(".comment-header-left");
  if (headerLeft && !headerLeft.querySelector(".rgf-highest-rated-comment-badge")) {
    headerLeft.append(
      <span className="ui tiny green label rgf-highest-rated-comment-badge">
        Highest-rated
      </span>,
    );
  }
}

async function init(signal: AbortSignal): Promise<false | void> {
  await waitForElement(".reactions, .comment-reactions", { signal }).catch(() => {});
  const bestComment = getBestComment();
  if (!bestComment) {
    return false;
  }

  highlightBestComment(bestComment);
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isConversation,
    pageDetect.isPRFiles,
  ],
  awaitDomReady: true,
  init,
});
