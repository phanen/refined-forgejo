import "./preview-hidden-comments.css";

import React from "dom-chef";
import features from "../feature-manager.js";
import * as pageDetect from "../helpers/page-detect.js";

function getNativeConversationPreview(holder: HTMLElement): string {
  const body = holder.querySelector<HTMLElement>(
    ".comment-code-cloud .comment-content .markup, .comment-code-cloud .render-content.markup",
  );
  const text = body?.textContent?.replaceAll(/\s+/g, " ").trim() ?? "";
  if (!text) {
    return "";
  }

  return text.length > 180 ? `${text.slice(0, 179)}…` : text;
}

function isNativeHidden(holder: HTMLElement): boolean {
  return !!holder.querySelector(".comment-code-cloud.tw-hidden");
}

function getNativeToggleContainer(holder: HTMLElement): HTMLElement | undefined {
  return holder.querySelector<HTMLElement>(
    ".resolved-placeholder, .collapsible-comment-box",
  ) ?? undefined;
}

function getNativeTextGroup(container: HTMLElement): HTMLElement | undefined {
  return container.matches(".resolved-placeholder")
    ? container.querySelector<HTMLElement>(":scope > .ui.grey.text") ?? undefined
    : container.querySelector<HTMLElement>(":scope > .tw-flex.tw-items-center.tw-gap-2:first-child") ?? undefined;
}

function labelNativeFilename(container: HTMLElement): void {
  const filename = container.querySelector<HTMLElement>("a.file-comment");
  if (filename) {
    filename.classList.add("label");
    filename.classList.add("ui");
  }
}

function createPreview(
  text: string,
  options: { onClick?: () => void; compact?: boolean } = {},
): HTMLElement {
  const { onClick, compact } = options;
  return (
    <span
      className={`rgf-preview-hidden-comments${compact ? " rgf-preview-hidden-comments-compact" : ""}`}
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
    </span>
  );
}

function updateNativeConversation(holder: HTMLElement): void {
  const container = getNativeToggleContainer(holder);
  if (!container) {
    return;
  }

  // Shorten "marked this conversation as resolved"
  const resolvedText = container.querySelector<HTMLElement>(".ui.grey.text");
  // https://codeberg.org/forgejo/forgejo/src/commit/1000a0da3afc514e9429034cb870d38e7be77022/templates/repo/issue/view_content/conversation.tmpl#L112
  if (resolvedText?.textContent?.includes("marked this conversation as resolved")) {
    const b = resolvedText.querySelector("b");
    if (b) {
      const svg = resolvedText.querySelector("svg");
      resolvedText.replaceChildren();
      if (svg) {
        resolvedText.append(svg);
        resolvedText.append(" ");
      }
      resolvedText.append(b);
    }
  }

  const previewText = isNativeHidden(holder) ? getNativeConversationPreview(holder) : "";
  const existing = holder.querySelector<HTMLElement>(".rgf-preview-hidden-comments");

  if (!previewText) {
    existing?.remove();
    return;
  }

  container.classList.add("rgf-preview-hidden-comments-toggleable");
  const textGroup = getNativeTextGroup(container);
  if (!textGroup || textGroup.querySelector(".rgf-preview-hidden-comments")) {
    return;
  }

  labelNativeFilename(container);
  textGroup.append(createPreview(previewText, {
    onClick: () => toggleNativeConversation(holder),
    compact: true,
  }));
}

function updatePreviews(): void {
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

  document.addEventListener("click", event => {
    if (!(event.target instanceof Element)) {
      return;
    }

    if (event.target.closest(".rgf-preview-hidden-comments")) {
      return;
    }

    const container = event.target.closest<HTMLElement>(
      ".resolved-placeholder.rgf-preview-hidden-comments-toggleable, .collapsible-comment-box.rgf-preview-hidden-comments-toggleable",
    );
    if (container && !event.target.closest("button, a, input, textarea, select, .dropdown, .menu, [role='menuitem']")) {
      const holder = container.closest<HTMLElement>(".conversation-holder");
      if (holder) {
        toggleNativeConversation(holder);
      }
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
