import features from "../feature-manager.js";
import * as pageDetect from "../helpers/page-detect.js";

function getPreviewText(comment: HTMLElement): string {
  const body = comment.querySelector<HTMLElement>(".comment-body .markup, .comment-content .markup");
  const text = body?.textContent?.trim().replaceAll(/\s+/g, " ") ?? "";
  if (!text) {
    return "";
  }

  return text.length > 180 ? `${text.slice(0, 177)}…` : text;
}

function updatePreviews(): void {
  for (const comment of document.querySelectorAll<HTMLElement>(".comment")) {
    const previewText = comment.classList.contains("rgf-hidden-comment") ? getPreviewText(comment) : "";

    if (!previewText) {
      comment.classList.remove("rgf-preview-hidden-comments");
      comment.removeAttribute("title");
      delete comment.dataset.tooltipContent;
      continue;
    }

    comment.classList.add("rgf-preview-hidden-comments");
    comment.title = previewText;
    comment.dataset.tooltipContent = previewText;
  }
}

function init(signal: AbortSignal): void {
  updatePreviews();
  document.addEventListener("rgf-hidden-comments-changed", updatePreviews, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isConversation,
    pageDetect.isPRFiles,
  ],
  init,
});
