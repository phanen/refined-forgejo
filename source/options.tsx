import './options.css';
import optionsStorage, {type RGHOptions} from './options-storage.js';

const features = [
	{id: 'reactions-avatars', description: 'Show user avatars on reaction buttons'},
	{id: 'rgf-deduplicator', description: 'Handle browser navigation deduplication'},
];

async function loadOptions(): Promise<void> {
	const form = document.querySelector('form') as HTMLFormElement;
	const options = await optionsStorage.getAll();

	for (const [key, value] of Object.entries(options)) {
		const input = form.elements.namedItem(key);
		if (input instanceof HTMLInputElement) {
			if (input.type === 'checkbox') {
				input.checked = value === true;
			} else {
				input.value = String(value);
			}
		} else if (input instanceof HTMLTextAreaElement) {
			input.value = String(value);
		}
	}
}

async function saveOptions(): Promise<void> {
	const form = document.querySelector('form') as HTMLFormElement;
	const formData = new FormData(form);
	const options: Partial<RGHOptions> = {};

	for (const [key, value] of formData.entries()) {
		options[key as keyof RGHOptions] = value as never;
	}

	await chrome.storage.sync.set(options);
}

function buildFeatureList(): void {
	const container = document.querySelector('.js-features');
	if (!container) {
		return;
	}

	for (const feature of features) {
		const id = `feature:${feature.id}`;
		const featureElement = document.createElement('div');
		featureElement.className = 'feature';
		featureElement.dataset.text = `${feature.id} ${feature.description}`.toLowerCase();

		featureElement.innerHTML = `
			<input type="checkbox" name="${id}" id="${feature.id}" class="feature-checkbox">
			<div class="info">
				<label class="feature-name" for="${feature.id}">${feature.id}</label>
				<p class="description">${feature.description}</p>
			</div>
		`;

		container.append(featureElement);
	}
}

function featuresFilterHandler(this: HTMLInputElement): void {
	const keywords = this.value.toLowerCase().split(/\s+/).filter(Boolean);
	for (const feature of document.querySelectorAll('.feature') as NodeListOf<HTMLElement>) {
		const text = feature.dataset.text || '';
		feature.classList.toggle('hidden', !keywords.every(word => text.includes(word)));
	}
}

async function clearCache(): Promise<void> {
	await chrome.storage.local.clear();
	alert('Cache cleared');
}

function handleExport(): void {
	optionsStorage.getAll().then(options => {
		const blob = new Blob([JSON.stringify(options, null, 2)], {type: 'application/json'});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'refined-forgejo-options.json';
		a.click();
		URL.revokeObjectURL(url);
	});
}

function handleImport(): void {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = '.json';
	input.onchange = async () => {
		const file = input.files?.[0];
		if (!file) {
			return;
		}
		const text = await file.text();
		try {
			const options = JSON.parse(text);
			await chrome.storage.sync.set(options);
			alert('Options imported. Reload the page to see changes.');
		} catch {
			alert('Invalid JSON file');
		}
	};
	input.click();
}

async function validateToken(): Promise<void> {
	const input = document.querySelector('input[name="personalToken"]') as HTMLInputElement;
	const validation = document.getElementById('validation');
	if (!input || !validation) {
		return;
	}

	const token = input.value.trim();
	if (!token) {
		validation.textContent = '';
		return;
	}

	try {
		const response = await fetch('https://codeberg.org/api/v1/user', {
			headers: {Authorization: `token ${token}`},
		});
		if (response.ok) {
			validation.textContent = '✓ Token valid';
			validation.style.color = 'green';
		} else {
			validation.textContent = '✗ Token invalid';
			validation.style.color = 'red';
		}
	} catch {
		validation.textContent = '';
	}
}

function init(): void {
	buildFeatureList();
	void loadOptions();

	document.querySelector('form')?.addEventListener('change', () => {
		void saveOptions();
	});

	document.querySelector('input#filter-features')?.addEventListener('input', featuresFilterHandler);
	document.querySelector('#clear-cache')?.addEventListener('click', clearCache);
	document.querySelector('.js-export')?.addEventListener('click', handleExport);
	document.querySelector('.js-import')?.addEventListener('click', handleImport);
	document.querySelector('input[name="personalToken"]')?.addEventListener('blur', validateToken);

	document.getElementById('js-failed')?.remove();
}

void init();
