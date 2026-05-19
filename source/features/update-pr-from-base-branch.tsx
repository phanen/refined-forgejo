import delegate, { type DelegateEvent } from "delegate-it";
import React from "dom-chef";

import features from "../feature-manager.js";
import api from "../forgejo-helpers/api.js";
import { isPR, isPRFiles } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function createButton(label: string, url: string, redirect?: string): JSX.Element {
  return (
    <button
      key={`${url}:${label}`}
      type="button"
      className="ui button rgf-update-pr-from-base-branch-button"
      data-do={url}
      data-redirect={redirect}
    >
      {label}
    </button>
  );
}

function replaceButtonGroup(group: Element): void {
  if (group.querySelector(".rgf-update-pr-from-base-branch-button")) {
    return;
  }

  const mainButton = group.querySelector<HTMLButtonElement>("button[data-do]");
  if (!mainButton) {
    return;
  }

  const dropdownItems = [...group.querySelectorAll<HTMLElement>(".menu [data-do]")]
    .filter(item => item.textContent?.trim());
  const actions = dropdownItems.length > 0
    ? dropdownItems
    : [mainButton];

  const buttons = (
    <div className="ui buttons rgf-update-pr-from-base-branch">
      {actions.map(action =>
        createButton(
          action.textContent?.trim() || mainButton.textContent?.trim() || "",
          action.getAttribute("data-do") || mainButton.getAttribute("data-do") || "",
          mainButton.getAttribute("data-redirect") || undefined,
        )
      )}
    </div>
  ) as HTMLElement;

  group.replaceWith(buttons);
}

async function handleClick(event: DelegateEvent<MouseEvent, HTMLButtonElement>): Promise<void> {
  const button = event.delegateTarget;
  const url = button.dataset.do;
  if (!url || button.classList.contains("is-loading")) {
    return;
  }

  const redirect = button.dataset.redirect;
  button.classList.add("is-loading");
  button.disabled = true;

  try {
    const data = await api.fetch(url, { method: "POST" }) as { redirect?: string };
    if (data?.redirect) {
      location.assign(data.redirect);
      return;
    }

    if (redirect) {
      location.assign(redirect);
      return;
    }

    location.reload();
  } catch (error) {
    console.error(error);
    button.disabled = false;
  } finally {
    button.classList.remove("is-loading");
  }
}

function init(signal: AbortSignal): void {
  observe(".update-button", replaceButtonGroup, { signal });
  delegate(".rgf-update-pr-from-base-branch-button", "click", handleClick, { signal });
}

void features.add(import.meta.url, {
  include: [
    isPR,
  ],
  exclude: [
    isPRFiles,
  ],
  init,
});
