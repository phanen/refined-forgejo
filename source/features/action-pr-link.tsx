import features from "../feature-manager.js";
import observe from "../helpers/selector-observer.js";

function getConversationNumber(): number | undefined {
  const parts = location.pathname.split("/");
  const type = parts[parts.length - 2];
  const number = parts[parts.length - 1];
  return (type === "pull" || type === "issues") && Number(number) ? Number(number) : undefined;
}

function setSearchParameter(anchorElement: HTMLAnchorElement, name: string, value: string): void {
  const url = new URL(anchorElement.href);
  url.searchParams.set(name, value);
  anchorElement.href = url.href;
}

function addForRepositoryActions(prLink: Element): void {
  const anchor = prLink as HTMLAnchorElement;
  const prNumber = anchor.textContent?.trim().slice(1);
  if (!prNumber) {
    return;
  }

  const row = anchor.closest(".job, .run, .box-row, [class*='row']");
  if (!row) {
    return;
  }

  const runLink = row.querySelector("a[href*='/actions/runs/']") as HTMLAnchorElement | null;
  if (runLink) {
    setSearchParameter(runLink, "pr", prNumber);
  }
}

function addForPr(actionLink: Element): void {
  const anchor = actionLink as HTMLAnchorElement;
  const prNumber = getConversationNumber();
  if (prNumber) {
    setSearchParameter(anchor, "pr", String(prNumber));
  }
}

async function initForRepositoryActionsPage(signal: AbortSignal): Promise<void> {
  observe(
    "a:has([class*='pull'], [class*='PR']), a[href*='/pull/']",
    addForRepositoryActions,
    { signal },
  );
}

async function initForPrPage(signal: AbortSignal): Promise<void> {
  observe("a[href*='/actions/runs/']", addForPr, { signal });
}

features.add(import.meta.url, {
  include: [() => location.pathname.includes("/actions/")],
  init: initForRepositoryActionsPage,
});

features.add(import.meta.url, {
  include: [() => /\/pull\/\d+/.test(location.pathname)],
  init: initForPrPage,
});
