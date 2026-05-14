import "./pr-filters.css";

import React from "dom-chef";
import features from "../feature-manager.js";
import { isPRList } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function addDraftFilter(filterMenu: Element): void {
  if (filterMenu.querySelector(".rgf-pr-status-filter")) {
    return;
  }

  const url = new URL(location.href);
  const currentDraft = url.searchParams.get("draft");

  const dropdown = (
    <div className="ui dropdown type rgf-pr-status-filter">
      <div className="text">
        {currentDraft === "true" ? "Draft" : currentDraft === "false" ? "Ready for review" : "Status"}
        <i className="dropdown icon"></i>
      </div>
      <div className="menu transition hidden">
        <a className={`item ${!currentDraft ? "active selected" : ""}`} href={getFilterUrl("draft", null)}>
          All
        </a>
        <a
          className={`item ${currentDraft === "false" ? "active selected" : ""}`}
          href={getFilterUrl("draft", "false")}
        >
          Ready for review
        </a>
        <a className={`item ${currentDraft === "true" ? "active selected" : ""}`} href={getFilterUrl("draft", "true")}>
          Draft
        </a>
      </div>
    </div>
  );

  // Insert before the Sort dropdown, which is usually the last one or second to last
  const sortDropdown = filterMenu.querySelector(".ui.dropdown[data-get-sort]");
  if (sortDropdown) {
    sortDropdown.before(dropdown);
  } else {
    filterMenu.append(dropdown);
  }
}

function getFilterUrl(key: string, value: string | null): string {
  const url = new URL(location.href);
  if (value === null) {
    url.searchParams.delete(key);
  } else {
    url.searchParams.set(key, value);
  }
  return url.pathname + url.search;
}

function init(signal: AbortSignal): void {
  observe("#issue-filters .ui.secondary.filter.menu", addDraftFilter, { signal });
}

features.add(import.meta.url, {
  include: [isPRList],
  init,
});
