import "./netiquette.css";

import toMilliseconds from "@sindresorhus/to-milliseconds";
import React from "dom-chef";
import FlameIcon from "octicons-plain-react/Flame";
import GitPullRequestDraftIcon from "octicons-plain-react/GitPullRequestDraft";
import InfoIcon from "octicons-plain-react/Info";
import { countElements } from "select-dom";

import features from "../feature-manager.js";
import type { Issue } from "../forgejo-helpers/api-types.js";
import api from "../forgejo-helpers/api.js";
import { buildRepoUrl, getRepo } from "../forgejo-helpers/index.js";
import { isConversation } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

const sixMonths = toMilliseconds({ days: 180 });
function formatClosedDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

type BannerKind = "draft" | "popular" | "closed";

function getConversationIndex(): number | undefined {
  const repo = getRepo();
  const index = repo?.pathParts[1];
  if (!repo || !["issues", "pulls"].includes(repo.pathParts[0] ?? "") || !index) {
    return undefined;
  }

  const parsed = Number.parseInt(index, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

async function getCloseDate(): Promise<Date | undefined> {
  const repo = getRepo();
  const index = getConversationIndex();
  if (!repo || !index) {
    return undefined;
  }

  try {
    const issue = await api.v1(`repos/${repo.owner}/${repo.name}/issues/${index}`) as Issue;
    if (!issue.closed_at) {
      return undefined;
    }

    return new Date(issue.closed_at);
  } catch {
    return undefined;
  }
}

function isLongAgo(date: Date): boolean {
  return (Date.now() - date.getTime()) > sixMonths;
}

function isPopularConversation(): boolean {
  return countElements(".timeline-item.comment:not(.form)") > 30
    || countElements(".participant-avatar") > 10;
}

function getDraftStateMessage(): string | undefined {
  const state = document.querySelector(".issue-state-label")?.textContent?.toLowerCase() ?? "";
  return state.includes("draft") ? "This PR is still a draft." : undefined;
}

function makeBanner(kind: BannerKind, message: React.JSX.Element | string): HTMLElement {
  const banner = document.createElement("div");
  banner.className = `ui message rgf-netiquette-banner rgf-netiquette-banner-${kind}`;
  banner.append(
    kind === "draft"
      ? <GitPullRequestDraftIcon className="rgf-netiquette-banner-icon" />
      : kind === "popular"
      ? <FlameIcon className="rgf-netiquette-banner-icon" />
      : <InfoIcon className="rgf-netiquette-banner-icon" />,
    <div className="rgf-netiquette-banner-body">
      <span className="rgf-netiquette-banner-text">{message}</span>
    </div>,
  );
  return banner;
}

function hasBanner(tab: HTMLElement, kind: BannerKind): boolean {
  return tab.querySelector(`.rgf-netiquette-banner-${kind}`) !== null;
}

function addBanner(textarea: HTMLTextAreaElement): void {
  const tab = textarea.closest<HTMLElement>(".ui.tab[data-tab-panel='markdown-writer']");
  if (!tab) {
    return;
  }

  const draftMessage = getDraftStateMessage();
  const messages: HTMLElement[] = [];

  if (draftMessage && !hasBanner(tab, "draft")) {
    messages.push(makeBanner("draft", "This is a draft PR, it might not be ready for review."));
  }

  if (isPopularConversation() && !hasBanner(tab, "popular")) {
    messages.push(
      makeBanner(
        "popular",
        "This issue is highly active. Read the full context before commenting.",
      ),
    );
  }

  if (messages.length > 0) {
    tab.prepend(...messages);
  }
}

function addClosedBanner(textarea: HTMLTextAreaElement, closeDate: Date): void {
  const tab = textarea.closest<HTMLElement>(".ui.tab[data-tab-panel='markdown-writer']");
  if (!tab || tab.querySelector(".rgf-netiquette-banner-closed")) {
    return;
  }

  tab.prepend(makeBanner(
    "closed",
    <>
      Closed a long time ago ({formatClosedDate(closeDate)}). Consider{" "}
      <a href={buildRepoUrl("issues/new/choose")}>opening a new issue</a>.
    </>,
  ) as HTMLElement);
}

function init(signal: AbortSignal): void {
  observe(
    ".combo-markdown-editor textarea.markdown-text-editor",
    textarea => {
      if (!(textarea instanceof HTMLTextAreaElement)) {
        return;
      }

      addBanner(textarea);

      void (async () => {
        const closeDate = await getCloseDate();
        if (closeDate && isLongAgo(closeDate)) {
          addClosedBanner(textarea, closeDate);
        }
      })();
    },
    { signal },
  );
}

void features.add(import.meta.url, {
  include: [
    isConversation,
  ],
  init,
});

/*
Test URLs
https://codeberg.org/forgejo/forgejo/pulls/213
https://codeberg.org/phanium/test-rgf-priv/pulls/2
https://codeberg.org/forgejo/forgejo/pulls/213
*/
