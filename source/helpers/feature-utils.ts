import type {Promisable} from 'type-fest';

import {pEveryFunction, pSomeFunction} from './p-utils.js';

export type BooleanFunction = () => boolean;
type PromisableBooleanFunction = () => Promisable<boolean>;

export type RunConditions = {
	asLongAs?: PromisableBooleanFunction[];
	include?: PromisableBooleanFunction[];
	exclude?: PromisableBooleanFunction[];
};

export function isFeaturePrivate(id: string): boolean {
	return id.startsWith('rgh-');
}

export async function shouldFeatureRun({
	asLongAs = [() => true],
	include = [() => true],
	exclude = [() => false],
}: RunConditions): Promise<boolean> {
	return await pEveryFunction(asLongAs, c => c())
		&& await pSomeFunction(include, c => c())
		&& pEveryFunction(exclude, async c => !await c());
}
