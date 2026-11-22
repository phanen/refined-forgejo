import { css } from "code-tag";
import React from "dom-chef";
import onetime from "./onetime.js";
import type { ListenerOptions, ObserverOptions } from "./types.js";

type ObserverListener<ExpectedElement extends Element> = (
  element: ExpectedElement,
  options: ListenerOptions,
) => void;

const animation = "rgf-selector-observer";
let observerId = 0;

const registerAnimation = onetime((): void => {
  document.head.append(<style>{`@keyframes ${animation} {}`}</style>);
});

function getSeenMark(selector: string): string {
  observerId += 1;
  return `rgf-seen-${observerId}-` + selector.replace(/[^a-z\d]/gi, "_").slice(0, 50);
}

export default function observe<Selector extends string>(
  selectors: Selector | readonly Selector[],
  listener: ObserverListener<Element>,
  { signal }: ObserverOptions = {},
): void {
  if (signal?.aborted) {
    return;
  }

  const selector = typeof selectors === "string" ? selectors : selectors.join(",\n");
  const seenMark = getSeenMark(selector);

  registerAnimation();

  const rule = document.createElement("style");
  rule.textContent = css`
		:where(${selector}):not(.${seenMark}) {
			animation: 1ms ${animation};
		}
	`;
  document.body.prepend(rule);

  signal?.addEventListener("abort", () => {
    rule.remove();
  });

  globalThis.addEventListener("animationstart", (event: AnimationEvent) => {
    if (event.animationName !== animation) {
      return;
    }

    const target = event.target as Element;
    if (target.classList.contains(seenMark) || !target.matches(selector)) {
      return;
    }

    target.classList.add(seenMark);

    listener(target, { signal });
  }, { signal });
}

export async function waitForElement<Selector extends string>(
  selectors: Selector,
  { signal }: ObserverOptions = {},
): Promise<Element | void> {
  return new Promise(resolve => {
    observe(selectors, element => {
      resolve(element);
    }, { signal });

    signal?.addEventListener("abort", () => {
      resolve();
    });
  });
}
