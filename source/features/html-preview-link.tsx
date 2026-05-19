import "./html-preview-link.css";
import React from "dom-chef";
import features from "../feature-manager.js";
import pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function getRawUrl(url: string): string {
  return url.replace(/\/(src|blame)\/(branch|commit|tag)\//, "/raw/$2/");
}

function addPreviewLinkToFileList(fileLink: Element): void {
  const link = fileLink as HTMLAnchorElement;
  const fileName = link.textContent?.trim() ?? link.getAttribute("title")?.trim();
  if (!fileName?.endsWith(".html")) {
    return;
  }

  const row = link.closest("tr.entry, .diff-file-header");
  if (!row || row.querySelector(".rgf-html-preview-link")) {
    return;
  }

  let rawUrl: string | undefined;
  if (link.classList.contains("file-link")) {
    // Diff view: get raw URL from the "Raw" button in the header
    const rawButton = row.querySelector<HTMLAnchorElement>("a[href*='/raw/']");
    rawUrl = rawButton?.href;
  } else {
    // File list: construct from link.href
    rawUrl = getRawUrl(link.href);
  }

  if (!rawUrl || rawUrl === link.href) {
    return;
  }

  const previewUrl = `https://htmlpreview.github.io/?${rawUrl}`;

  link.after(
    <a
      href={previewUrl}
      className="rgf-html-preview-link muted ml-2"
      target="_blank"
      rel="noopener noreferrer"
    >
      (preview)
    </a>,
  );
}

function addPreviewButtonToFileHeader(rawButton: Element): void {
  const container = rawButton.parentElement;
  if (!container || container.querySelector(".rgf-html-preview-button")) {
    return;
  }

  // Check if it's an HTML file
  let isHtml = false;

  // 1. Try file info tags (Single file view)
  const fileHeader = rawButton.closest(".file-header, .diff-file-header");
  const fileInfoEntries = fileHeader?.querySelectorAll(".file-info-entry");
  isHtml = Array.from(fileInfoEntries ?? []).some(entry => entry.textContent?.trim() === "HTML");

  // 2. Try file name from breadcrumbs or diff header
  if (!isHtml) {
    const fileLink = fileHeader?.querySelector("a.file-link")
      ?? document.querySelector(".breadcrumb.repo-path .active.section");
    const fileName = fileLink?.textContent?.trim() ?? fileLink?.getAttribute("title")?.trim();
    if (fileName?.endsWith(".html")) {
      isHtml = true;
    }
  }

  if (!isHtml) {
    return;
  }

  const rawUrl = (rawButton as HTMLAnchorElement).href;
  // TODO(revisit): https://codeberg.org/Codeberg/Community/issues/249
  const previewUrl = `https://htmlpreview.github.io/?${rawUrl}`;

  rawButton.before(
    <a
      href={previewUrl}
      className="ui basic mini button rgf-html-preview-button"
      target="_blank"
      rel="noopener noreferrer"
    >
      Preview
    </a>,
  );
}

function init(signal: AbortSignal): void {
  // File list and diffs
  observe(
    "#repo-files-table .entry .name a, a.muted.file-link",
    addPreviewLinkToFileList,
    { signal },
  );

  // Single file view and diff box headers
  observe(
    "a.ui.basic.button[href*='/raw/']",
    addPreviewButtonToFileHeader,
    { signal },
  );
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isRepoTree,
    pageDetect.isSingleFile,
    pageDetect.isBlame,
    pageDetect.isPRFiles,
    pageDetect.isCommit,
  ],
  init,
});

/*
Test URLs:
- https://codeberg.org/forgejo/forgejo/src/branch/forgejo/templates/base/footer_content.tmpl (Wait, this is not .html)
- Find an HTML file in some repo, e.g., a documentation repo.
*/
