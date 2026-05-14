import "./suggest-commit-title-limit.css";

import delegate from "delegate-it";

import features from "../feature-manager.js";
import { getRepo } from "../forgejo-helpers/index.js";
import { pageDetect } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

const limit = 72;

function getPrNumber(): number | undefined {
  const repo = getRepo();
  if (!repo) return undefined;
  const match = repo.path.match(/^pulls\/(\d+)/);
  if (match) {
    return Number.parseInt(match[1], 10);
  }
  return undefined;
}

function formatPrCommitTitle(title: string, prNumber?: number): string {
  if (prNumber) {
    return `${title} (#${prNumber})`;
  }
  return title;
}

function validateCommitTitle(field: HTMLInputElement | HTMLTextAreaElement): void {
  const isOverLimit = field.value.length > limit;
  field.classList.toggle("rgf-title-over-limit", isOverLimit);
  field.style.outline = isOverLimit ? "2px solid #db2828" : "";
  field.style.outlineOffset = isOverLimit ? "-2px" : "";
}

function validatePrTitle(field: HTMLInputElement): void {
  const prNumber = getPrNumber();
  const prTitle = formatPrCommitTitle(field.value, prNumber);
  const isOverLimit = prTitle.length > limit;
  field.classList.toggle("rgf-title-over-limit", isOverLimit);
  field.style.outline = isOverLimit ? "2px solid #db2828" : "";
  field.style.outlineOffset = isOverLimit ? "-2px" : "";
}

const commitTitleSelectors = [
  "input[name=\"commit_summary\"]",
  "input[name=\"merge_title_field\"]",
];

const prTitleSelectors = [
  "input#issue_title",
  "#issue-title-editor input",
  ".js-quick-submit[data-old-title]",
];

async function init(signal: AbortSignal): Promise<void> {
  // Commit titles
  delegate(commitTitleSelectors, "input", (event) => {
    validateCommitTitle(event.delegateTarget as HTMLInputElement);
  }, { signal });
  observe(commitTitleSelectors, (el) => {
    validateCommitTitle(el as HTMLInputElement);
  }, { signal });

  // PR titles
  delegate(prTitleSelectors, "input", (event) => {
    validatePrTitle(event.delegateTarget as HTMLInputElement);
  }, {
    signal,
  });
  observe(prTitleSelectors, (el) => {
    validatePrTitle(el as HTMLInputElement);
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    pageDetect.isCommit,
    pageDetect.isPR,
    pageDetect.isCompare,
    pageDetect.isEditingFile,
    pageDetect.isNewFile,
  ],
  init,
});
