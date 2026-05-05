import {css} from 'code-tag';
import React from 'dom-chef';
import domLoaded from 'dom-loaded';

import delay from './delay.js';
import onetime from './onetime.js';

type ObserverListener<ExpectedElement extends Element> = (element: ExpectedElement, options: {signal?: AbortSignal}) => void;

type Options = {
	once?: boolean;
	signal?: AbortSignal;
	ancestor?: number;
};

const animation = 'rgf-selector-observer';

const registerAnimation = onetime((): void => {
	document.head.append(<style>{`@keyframes ${animation} {}`}</style>);
});

function getSeenMark(selector: string): string {
	return 'rgf-seen-' + selector.replace(/[^a-z\d]/gi, '_').slice(0, 50);
}

export default function observe<Selector extends string>(
	selectors: Selector | readonly Selector[],
	listener: ObserverListener<Element>,
	{signal}: Options = {},
): void {
	if (signal?.aborted) {
		return;
	}

	const selector = typeof selectors === 'string' ? selectors : selectors.join(',\n');
	const seenMark = getSeenMark(selector);

	registerAnimation();

	const rule = document.createElement('style');
	rule.textContent = css`
		:where(${selector}):not(.${seenMark}) {
			animation: 1ms ${animation};
		}
	`;
	document.body.prepend(rule);

	signal?.addEventListener('abort', () => {
		rule.remove();
	});

	let called = false;

	async function checkLogging(): Promise<void> {
		await domLoaded;
		await delay(1000);
		if (!called && !signal?.aborted) {
			console.warn('Selector not found on page:', selector);
		}
	}

	void checkLogging();

	globalThis.addEventListener('animationstart', (event: AnimationEvent) => {
		if (event.animationName !== animation) {
			return;
		}

		const target = event.target as Element;
		if (target.classList.contains(seenMark) || !target.matches(selector)) {
			return;
		}

		called = true;
		target.classList.add(seenMark);

		listener(target, {signal});
	}, {signal});
}

export async function waitForElement<Selector extends string>(
	selectors: Selector,
	{signal}: Options = {},
): Promise<Element | void> {
	return new Promise(resolve => {
		observe(selectors, element => {
			resolve(element);
		}, {signal});

		signal?.addEventListener('abort', () => {
			resolve();
		});
	});
}
