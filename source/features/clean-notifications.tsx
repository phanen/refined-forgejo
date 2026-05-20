import "./clean-notifications.css";

import features from "../feature-manager.js";
import { isNotifications } from "../helpers/page-detect.js";

function getRepoName(item: HTMLElement): string {
  const topRow = item.querySelector<HTMLElement>(".notifications-top-row");
  const prefix = topRow?.firstChild;
  if (prefix?.nodeType === Node.TEXT_NODE) {
    return prefix.textContent?.replace(/\s+/g, " ").trim() ?? "";
  }

  return item.dataset.repo ?? "";
}

function normalizeRepoName(item: HTMLElement, repoName: string): void {
  const topRow = item.querySelector<HTMLElement>(".notifications-top-row");
  if (!topRow || topRow.querySelector(".rgf-notification-repo-name")) {
    return;
  }

  const prefix = topRow.firstChild;
  if (prefix?.nodeType !== Node.TEXT_NODE) {
    return;
  }

  const repo = document.createElement("span");
  repo.className = "rgf-notification-repo-name";
  repo.textContent = repoName;
  topRow.insertBefore(repo, prefix);
  topRow.insertBefore(document.createTextNode(" "), prefix);
  prefix.textContent = "";
}

function unwrapGroups(table: HTMLElement): void {
  for (const group of table.querySelectorAll<HTMLElement>(":scope > .rgf-notification-group")) {
    const items = [...group.querySelectorAll<HTMLElement>(":scope > .notifications-item")];
    group.replaceWith(...items);
  }
}

function buildRepoGroup(repoName: string, items: HTMLElement[]): HTMLElement {
  const group = document.createElement("div");
  group.className = "rgf-notification-group";
  group.dataset.repo = repoName;

  const header = document.createElement("div");
  header.className = "rgf-notification-group-header";
  header.textContent = repoName;
  group.append(header);

  for (const item of items) {
    item.dataset.repo = repoName;
    normalizeRepoName(item, repoName);
    group.append(item);
  }

  return group;
}

function regroupNotifications(): void {
  const table = document.getElementById("notification_table");
  if (!(table instanceof HTMLElement)) {
    return;
  }

  unwrapGroups(table);

  const items = [...table.children].filter((child): child is HTMLElement =>
    child instanceof HTMLElement && child.classList.contains("notifications-item")
  );
  if (items.length === 0) {
    return;
  }

  const groups = new Map<string, HTMLElement[]>();
  const order: string[] = [];

  for (const item of items) {
    const repoName = getRepoName(item);
    if (!repoName) {
      continue;
    }

    if (!groups.has(repoName)) {
      groups.set(repoName, []);
      order.push(repoName);
    }

    groups.get(repoName)!.push(item);
  }

  if (order.length === 0) {
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const repoName of order) {
    fragment.append(buildRepoGroup(repoName, groups.get(repoName) ?? []));
  }

  table.replaceChildren(fragment);
}

function init(): void {
  regroupNotifications();
}

void features.add(import.meta.url, {
  include: [
    isNotifications,
  ],
  awaitDomReady: true,
  init,
});
