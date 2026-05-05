/* eslint-disable no-await-in-loop */
import React from 'dom-chef';
import domLoaded from 'dom-loaded';
import oneEvent from 'one-event';
import {elementExists} from 'select-dom';
import type {Promisable} from 'type-fest';
import {isWebPage} from 'webext-detect';

import asyncForEach from './helpers/async-for-each.js';
import {catchErrors, disableErrorLogging} from './helpers/errors.js';
import {getFeatureId, listenToAjaxedLoad, log, shortcutMap} from './helpers/feature-helpers.js';
import {isFeaturePrivate, type RunConditions, shouldFeatureRun} from './helpers/feature-utils.js';
import {getLocalHotfixesAsOptions} from './helpers/hotfix.js';
import ArrayMap from './helpers/map-of-arrays.js';
import waitFor from './helpers/wait-for.js';
import optionsStorage, {isFeatureDisabled, type RGHOptions} from './options-storage.js';

type Arrayable<T> = T | T[];

type FeatureInitResult = void | false;
type FeatureInit = (signal: AbortSignal) => Promisable<FeatureInitResult>;

type FeatureLoader = RunConditions & {
	shortcuts?: Record<string, string>;
	awaitDomReady?: true;
	deduplicate?: string;
	init: Arrayable<FeatureInit>;
};

const currentFeatureControllers = new ArrayMap<string, AbortController>();

const globalReady = new Promise<RGHOptions>(async resolve => {
	if (!isWebPage()) {
		throw new Error('This script should only be run on web pages');
	}

	listenToAjaxedLoad();

	const [options, localHotfixes] = await Promise.all([
		optionsStorage.getAll(),
		getLocalHotfixesAsOptions(),
	]);

	log.setup(options);

	await waitFor(() => document.body);

	document.documentElement.setAttribute('refined-forgejo', '');

	if (options.customCss.trim().length > 0) {
		document.head.append(<style>{options.customCss}</style>);
	}

	Object.assign(options, localHotfixes);

	if (elementExists('body.logged-out')) {
		console.warn('Refined Forgejo is only expected to work when you are logged in to Forgejo. Errors will not be shown.');
		disableErrorLogging();
	} else {
		catchErrors();
	}

	document.addEventListener('turbo:visit', unloadAll);
	document.addEventListener('turbo:before-fetch-request', unloadAll);

	resolve(options);
});

function castArray<T>(value: Arrayable<T>): T[] {
	return Array.isArray(value) ? value : [value];
}

async function add(url: string, ...loaders: FeatureLoader[]): Promise<void> {
	const id = getFeatureId(url);
	const options = await globalReady;

	if (isFeatureDisabled(options, id) && !isFeaturePrivate(id)) {
		if (loaders.length === 0) {
			do {
				document.documentElement.setAttribute('rgf-OFF-' + id, '');
				log.info('Skipping', id);
			} while (await oneEvent(document, 'turbo:render'));
		} else {
			log.info('Skipping', id);
		}
		return;
	}

	if (loaders.length === 0) {
		return;
	}

	void asyncForEach(loaders, async loader => {
		const {
			shortcuts = {},
			asLongAs,
			include,
			exclude,
			init,
			awaitDomReady = false,
			deduplicate = false,
		} = loader;

		if (include?.length === 0) {
			throw new Error(`${id}: \`include\` cannot be an empty array`);
		}

		let firstLoop = true;
		do {
			if (awaitDomReady) {
				await domLoaded;
			}

			if (firstLoop) {
				firstLoop = false;
			} else if (deduplicate && elementExists(deduplicate)) {
				continue;
			}

			if (!await shouldFeatureRun({asLongAs, include, exclude})) {
				continue;
			}

			const featureController = new AbortController();
			currentFeatureControllers.append(id, featureController);

			void asyncForEach(castArray(init), async (init) => {
				const result = await init(featureController.signal);
				if (result !== false && !isFeaturePrivate(id)) {
					log.info('Running', id);
					for (const [hotkey, description] of Object.entries(shortcuts)) {
						shortcutMap.set(hotkey, description);
					}
				}
			});
		} while (await oneEvent(document, 'turbo:render'));
	});
}

async function addCssFeature(url: string): Promise<void> {
	void add(url);
}

function unload(featureUrl: string): void {
	const id = getFeatureId(featureUrl);
	for (const controller of currentFeatureControllers.get(id) ?? []) {
		controller.abort();
	}
}

function unloadAll(): void {
	for (const feature of currentFeatureControllers.values()) {
		for (const controller of feature) {
			controller.abort();
		}
	}
	currentFeatureControllers.clear();
}

const features = {
	add,
	unload,
	addCssFeature,
};

export default features;
