export default async function asyncForEach<Item>(
	array: Item[],
	callback: (item: Item, index: number) => Promise<void>,
): Promise<void> {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index);
	}
}
