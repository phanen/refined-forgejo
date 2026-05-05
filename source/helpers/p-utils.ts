export async function pEveryFunction<Item>(
	array: Item[],
	predicate: (item: Item) => Promise<boolean>,
): Promise<boolean> {
	for (const item of array) {
		if (!await predicate(item)) {
			return false;
		}
	}
	return true;
}

export async function pSomeFunction<Item>(
	array: Item[],
	predicate: (item: Item) => Promise<boolean>,
): Promise<boolean> {
	for (const item of array) {
		if (await predicate(item)) {
			return true;
		}
	}
	return false;
}
