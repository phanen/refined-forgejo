import { setFieldText } from "text-field-edit";

import features from "../feature-manager.js";
import * as pageDetect from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

let firstCommit: { title: string; body?: string } | undefined;

function getFirstCommit(commitSummary: HTMLElement): { title: string; body?: string } {
  const row = commitSummary.closest("tr");
  const body = row?.querySelector<HTMLElement>("pre.commit-body")?.textContent?.trim() || undefined;
  return {
    title: commitSummary.textContent?.trim() || "",
    body,
  };
}

function tryFillCommitTitle(): void {
  const requestedContent = new URL(location.href).searchParams;
  if (requestedContent.has("title") || requestedContent.has("body")) {
    return;
  }

  const form = document.querySelector<HTMLFormElement>("#new-issue");
  const titleField = form?.querySelector<HTMLInputElement>("#issue_title");
  const bodyField = form?.querySelector<HTMLTextAreaElement>("textarea[name='content']");
  if (!titleField || !bodyField || !firstCommit) {
    return;
  }

  if (titleField && titleField.value === titleField.defaultValue) {
    setFieldText(titleField, firstCommit.title);
  }

  if (bodyField && firstCommit.body && bodyField.value === bodyField.defaultValue) {
    setFieldText(bodyField, firstCommit.body);
  }
}

function init(signal: AbortSignal): void {
  observe("#commits-table tbody.commit-list tr:last-child .commit-summary", element => {
    if (!(element instanceof HTMLElement) || firstCommit) {
      return;
    }

    firstCommit = getFirstCommit(element);
    tryFillCommitTitle();
  }, { signal });

  observe("#new-issue #issue_title, #new-issue textarea[name='content']", tryFillCommitTitle, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isCompare,
  ],
  init,
});
