import features from "../feature-manager.js";
import { isConversation, isNewIssue, isPRFiles } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";

function normalizePathname(pathname: string): string {
  return pathname.replace(/\/pulls\/(\d+)(?:\/.*)?$/, "/issues/$1");
}

function underlineSelfReference(link: HTMLAnchorElement): void {
  const current = new URL(location.href);
  const target = new URL(link.href);
  const currentPathname = normalizePathname(current.pathname);
  const targetPathname = normalizePathname(target.pathname);

  if (current.origin !== target.origin || currentPathname !== targetPathname || current.search !== target.search) {
    return;
  }

  link.title = "Link is a self-reference";
  link.removeAttribute("href");
  link.removeAttribute("data-hovercard-url");
  link.style.textDecorationLine = "underline";
  link.style.textDecorationStyle = "wavy";
  link.style.textDecorationColor = "red";
}

function init(signal: AbortSignal): void {
  observe(".render-content.markup a[href]:not([href*='#'])", link => {
    if (link instanceof HTMLAnchorElement) {
      underlineSelfReference(link);
    }
  }, { signal });
}

void features.add(import.meta.url, {
  include: [
    isConversation,
    isPRFiles,
    isNewIssue,
  ],
  init,
});
