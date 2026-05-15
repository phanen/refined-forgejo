import "./conventional-commits.css";
import React from "dom-chef";
import features from "../feature-manager.js";
import { conventionalCommitRegex, parseConventionalCommit } from "../helpers/conventional-commits.js";
import { pageDetect } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function renderLabelInCommitTitle(commitTitleElement: Element): void {
  const link = commitTitleElement.querySelector<HTMLAnchorElement>("a.default-link, a.muted");
  if (!link) {
    return;
  }

  const text = link.textContent?.trim();
  if (!text) {
    return;
  }

  const commit = parseConventionalCommit(text);
  if (!commit) {
    return;
  }

  // Skip commits that are _only_ "ci:" without anything else
  if (commit.raw === text) {
    return;
  }

  link.textContent = text.replace(conventionalCommitRegex, "");
  link.prepend(
    <span className="ui label rgf-conventional-commit" rgf-conventional-commits={commit.rawType}>
      {commit.type}
    </span>,
    commit.scope ? <span className="text grey">{commit.scope}</span> : "",
  );
}

function init(signal: AbortSignal): void {
  observe(".commit-summary, td.message a:first-child", renderLabelInCommitTitle, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isCommitList,
  ],
  init,
});
