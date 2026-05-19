import delegate, { type DelegateEvent } from "delegate-it";
import features from "../feature-manager.js";

function clickAllExcept(selector: string, except: HTMLElement): void {
  for (const item of document.querySelectorAll<HTMLElement>(selector)) {
    if (item !== except) {
      item.click();
    }
  }
}

function getConversationRoot(target: EventTarget | null): HTMLElement | undefined {
  if (!(target instanceof Element)) {
    return undefined;
  }

  return target.closest<HTMLElement>(".conversation-holder") ?? undefined;
}

function isNativeConversationHidden(holder: HTMLElement): boolean {
  return !!holder.querySelector(".comment-code-cloud.tw-hidden");
}

function toggleAllCheckboxes(event: DelegateEvent<MouseEvent, HTMLInputElement>): void {
  if (!event.altKey) {
    return;
  }

  const checkbox = event.delegateTarget;
  const isChecked = checkbox.checked;

  // Find other checkboxes in the same container or list
  const list = checkbox.closest(".flex-list, .ui.list, table, .issue-list, #repo-files-table");
  if (!list) {
    return;
  }

  const otherCheckboxes = list.querySelectorAll<HTMLInputElement>("input[type=\"checkbox\"]");
  for (const other of otherCheckboxes) {
    if (other !== checkbox && !other.disabled) {
      other.checked = isChecked;
      other.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }
}

function toggleAllFoldButtons(event: DelegateEvent<MouseEvent, HTMLButtonElement>): void {
  if (!event.altKey) {
    return;
  }

  const button = event.delegateTarget;
  const folded = button.closest(".diff-file-box")?.getAttribute("data-folded") === "true";
  clickAllExcept(`.fold-file${folded ? ":not(.active)" : ""}`, button);
}

function isInteractiveElement(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  return !!target.closest("button, a, input, textarea, select, .dropdown, .menu, [role='menuitem']");
}

function isInteractiveElementExceptConversationToggle(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  if (target.closest(".show-outdated, .hide-outdated")) {
    return false;
  }

  return isInteractiveElement(target);
}

function toggleConversationHolder(holder: HTMLElement, hiddenBefore?: boolean): void {
  const hidden = hiddenBefore ?? isNativeConversationHidden(holder);
  const selector = hidden
    ? ".show-outdated:not(.tw-hidden)"
    : ".hide-outdated:not(.tw-hidden)";
  holder.querySelector<HTMLButtonElement>(selector)?.click();
}

function toggleAllHiddenComments(event: DelegateEvent<MouseEvent, HTMLElement>): void {
  if (!event.altKey) {
    return;
  }

  const target = event.delegateTarget;
  const holder = getConversationRoot(target);
  if (holder) {
    if (isInteractiveElementExceptConversationToggle(event.target)) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    const hidden = isNativeConversationHidden(holder);
    const holders = [...document.querySelectorAll<HTMLElement>(".conversation-holder")]
      .filter(item => isNativeConversationHidden(item) === hidden);

    toggleConversationHolder(holder, hidden);
    for (const item of holders) {
      if (item !== holder) {
        toggleConversationHolder(item, hidden);
      }
    }
  }
}

function init(signal: AbortSignal): void {
  delegate("input[type=\"checkbox\"]", "click", toggleAllCheckboxes, { signal });
  delegate(".fold-file", "click", toggleAllFoldButtons, { signal });
  delegate(
    ".rgf-preview-hidden-comments-action, .conversation-holder",
    "click",
    toggleAllHiddenComments,
    { signal, capture: true },
  );
}

void features.add(import.meta.url, {
  init,
});
