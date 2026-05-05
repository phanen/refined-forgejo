import React from 'dom-chef';
import {$optional} from 'select-dom';

import features from '../feature-manager.js';

void features.add('rgf-deduplicator', {
	awaitDomReady: true,
	async init() {
		await Promise.resolve();
		$optional('has-rgf')?.remove();
		$optional('#js-repo-pjax-container, turbo-frame')?.append(<has-rgf />);
	},
});

features.add(import.meta.url, {
	awaitDomReady: true,
	async init() {
		await Promise.resolve();
		$optional('has-rgf-inner')?.remove();
		$optional('turbo-frame')?.append(<has-rgf-inner />);
	},
});
