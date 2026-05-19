import "./patch-diff-links.css";
import React from "dom-chef";
import features from "../feature-manager.js";
import { pageDetect } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function createLink(type: "patch" | "diff", href: string): JSX.Element {
  return (
    <a href={href} className="rgf-patch-diff-link" data-turbo="false">
      {type}
    </a>
  );
}

function addPatchDiffLinks(container: Element): void {
  if (container.querySelector(".rgf-patch-diff-links")) {
    return;
  }

  // Find the commit SHA link to get the base URL
  // On PR files view, it's inside .item. On commit page, we are already at the URL.
  const commitShaLabel = container.querySelector<HTMLAnchorElement>(".item a.sha.label");

  let commitUrl: string;
  if (commitShaLabel) {
    commitUrl = commitShaLabel.pathname;
  } else {
    commitUrl = location.pathname.replace(/\/pulls\/\d+\/commits/, "/commit");
  }

  container.prepend(
    <div className="rgf-patch-diff-links item">
      {createLink("patch", `${commitUrl}.patch`)}
      {" · "}
      {createLink("diff", `${commitUrl}.diff`)}
    </div>,
  );
}

async function init(signal: AbortSignal): Promise<void> {
  // Commit page / PR files view commit header
  // Target the container that holds Parent and Commit SHA labels
  observe(".commit-header-row > .tw-flex:not(.author)", addPatchDiffLinks, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isCommit,
  ],
  init,
});
