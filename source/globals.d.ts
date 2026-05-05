import type JSX from 'react';

declare global {
	namespace JSX {
		interface IntrinsicElements {
			'has-rgh': IntrinsicElements.div;
			'has-rgh-inner': IntrinsicElements.div;
			'has-rgf': IntrinsicElements.div;
			'has-rgf-inner': IntrinsicElements.div;
		}
	}
}

declare module '*/package.json' {
	export const version: string;
}
