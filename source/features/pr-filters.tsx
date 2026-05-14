import "./pr-filters.css";

import React from "dom-chef";
import features from "../feature-manager.js";
import { isPRList } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function getFilterUrl(queryModifier: (q: string) => string): string {
  const url = new URL(location.href);
  const q = url.searchParams.get("q") ?? "";
  const newQ = queryModifier(q).trim();

  if (newQ) {
    url.searchParams.set("q", newQ);
  } else {
    url.searchParams.delete("q");
  }

  return url.pathname + url.search;
}

function addDraftFilter(filterMenu: Element): void {
  if (filterMenu.querySelector(".rgf-pr-status-filter")) {
    return;
  }

  const url = new URL(location.href);
  const q = url.searchParams.get("q") ?? "";
  const isWIP = q.includes("WIP");

  const dropdown = (
    <div className="ui dropdown type rgf-pr-status-filter">
      <div className="text">
        {isWIP ? "WIP" : "Status"}
        <i className="dropdown icon"></i>
      </div>
      <div className="menu transition hidden">
        <a
          className={`item ${!isWIP ? "active selected" : ""}`}
          href={getFilterUrl(q => q.replace(/\+?WIP/g, ""))}
        >
          All
        </a>
        <a
          className={`item ${isWIP ? "active selected" : ""}`}
          href={getFilterUrl(q => q.includes("WIP") ? q : (q ? `${q}+WIP` : "WIP"))}
        >
          WIP
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

function init(signal: AbortSignal): void {
  observe("#issue-filters .ui.secondary.filter.menu", addDraftFilter, { signal });
}

features.add(import.meta.url, {
  include: [isPRList],
  init,
});
