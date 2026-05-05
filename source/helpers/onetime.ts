export default function onetime<T extends (...args: unknown[]) => unknown>(fn: T): T {
	let called = false;
	let cache: unknown;
	const wrapper = ((...args: unknown[]) => {
		if (called) {
			return cache;
		}
		called = true;
		cache = fn(...args);
		return cache;
	}) as T;
	return wrapper;
}
