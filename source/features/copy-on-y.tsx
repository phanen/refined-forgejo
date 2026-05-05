import features from '../feature-manager.js';

async function handler(event: KeyboardEvent): Promise<void> {
	if (event.key === 'y' && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
		const url = location.href;
		await navigator.clipboard.writeText(url);
	}
}

function init(signal: AbortSignal): void {
	globalThis.addEventListener('keyup', handler, {signal});
}

features.add(import.meta.url, {
	init,
});
