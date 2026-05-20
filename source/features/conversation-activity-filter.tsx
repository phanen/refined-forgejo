import "./conversation-activity-filter.css";

import React from "dom-chef";
import EyeIcon from "octicons-plain-react/Eye";

import features from "../feature-manager.js";
import pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

const states = {
  showAll: "Show all activities",
  hideEvents: "Hide events",
  hideAllNoise: "Hide events, bots, collapsed comments",
} as const;

type State = keyof typeof states;

const storage = {
  get key(): string {
    return `rgf-conversation-activity-filter-state:${location.pathname}`;
  },
  set(value: State): void {
    sessionStorage.setItem(this.key, value);
  },
  get(): State {
    return (sessionStorage.getItem(this.key) as State) || "showAll";
  },
};

const hiddenClassName = "rgf-conversation-activity-filtered-event";
const collapsedClassName = "rgf-conversation-activity-collapsed-comment";
const botClassName = "rgf-conversation-activity-bot-comment";

let currentState: State = storage.get();

function isBotComment(item: HTMLElement): boolean {
  const anchor = item.querySelector<HTMLAnchorElement>(
    ".comment-header-left a[href*='/apps/'], .comment-header-left a[href$='-bot'], .comment-header-left a[href*='/bot-'], .comment-header-left a[href*='-bot/']",
  );
  if (anchor) {
    return true;
  }

  return !!item.querySelector(".comment-header-left .bot, .comment-header-left [data-bot='true']")
    || (item.textContent?.includes("[bot]") ?? false);
}

function processTimelineEvent(item: HTMLElement): void {
  if (item.querySelector(".octicon-git-commit")) {
    return;
  }

  if (item.classList.contains("comment")) {
    return;
  }

  item.classList.add(hiddenClassName);
}

function processSimpleComment(item: HTMLElement): void {
  if (item.querySelector(".octicon-unfold")) {
    item.classList.add(collapsedClassName);
  }

  if (isBotComment(item)) {
    item.classList.add(botClassName);
  }
}

function processReview(review: HTMLElement): void {
  const unresolvedThreads = review.querySelectorAll<HTMLElement>(
    ".js-resolvable-timeline-thread-container[data-resolved='false']",
  );
  const unresolvedThreadComments = review.querySelectorAll<HTMLElement>(
    ".timeline-comment-group:not(.minimized-comment)",
  );
  const hasMainComment = !!review.querySelector(".js-comment[id^='pullrequestreview'] .timeline-comment");

  if (!hasMainComment && (unresolvedThreads.length === 0 || unresolvedThreadComments.length === 0)) {
    review.classList.add(collapsedClassName);
    return;
  }

  for (const thread of unresolvedThreads) {
    if (![...unresolvedThreadComments].some(comment => thread.contains(comment))) {
      thread.classList.add(collapsedClassName);
    }
  }
}

function processItem(item: HTMLElement): void {
  if (location.hash.startsWith("#issuecomment-") && item.querySelector(location.hash)) {
    return;
  }

  if (item.matches(".conversation-holder")) {
    processReview(item);
    return;
  }

  if (item.matches(".timeline-item")) {
    if (item.classList.contains("event")) {
      processTimelineEvent(item);
      return;
    }

    if (item.querySelector(".comment-body, .render-content.markup, .comment-content")) {
      processSimpleComment(item);
    }
  }
}

function applyState(state: State): void {
  const container = document.querySelector<HTMLElement>(".issue-content");
  if (!container) {
    return;
  }

  container.setAttribute("data-rgf-conversation-activity-filter", state);
  currentState = state;
  storage.set(state);
}

function createMenu(): HTMLElement {
  return (
    <details
      className="dropdown dir-rtl rgf-conversation-activity-filter"
      data-tooltip-content="Conversation activity filter"
    >
      <summary className="rgf-conversation-activity-filter-trigger" aria-label="Conversation activity filter">
        <EyeIcon className="rgf-conversation-activity-filter-eye icon" />
      </summary>
      <div className="content">
        <ul>
          {Object.entries(states).map(([state, label]) => (
            <li key={state}>
              <a
                href="#"
                className="item"
                data-state={state}
                role="menuitem"
                aria-pressed={currentState === state}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </details>
  ) as HTMLElement;
}

function addWidget(anchor: Element): void {
  const host = anchor.closest(".issue-title-header") ?? anchor.parentElement;
  if (!host || host.querySelector(".rgf-conversation-activity-filter")) {
    return;
  }

  const widget = createMenu();
  const meta = host.querySelector(".issue-title-meta");
  if (meta) {
    meta.append(widget);
  } else {
    host.append(widget);
  }

  widget.querySelector(".content")?.addEventListener("click", event => {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-state]");
    if (!target) {
      return;
    }

    event.preventDefault();
    applyState(target.dataset.state as State);
    widget.removeAttribute("open");
  });
}

function init(signal: AbortSignal): void {
  applyState(currentState);
  observe(".issue-title-header", addWidget, { signal });
  observe(".timeline-item, .conversation-holder", element => {
    if (element instanceof HTMLElement) {
      processItem(element);
    }
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isConversation,
  ],
  awaitDomReady: true,
  init,
});
