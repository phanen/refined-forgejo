import {messageBg} from 'webext-msg';

chrome.action.onClicked.addListener(async tab => {
	await chrome.runtime.openOptionsPage();
});

console.log('Refined Forgejo background script loaded');
