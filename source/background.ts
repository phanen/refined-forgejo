chrome.action.onClicked.addListener(async () => {
	await chrome.runtime.openOptionsPage();
});

console.log('Refined Forgejo background script loaded');
