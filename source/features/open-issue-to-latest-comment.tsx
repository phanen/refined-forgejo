import features from '../feature-manager.js';
import {isIssueOrPRList} from '../helpers/page-detect.js';

function init(): void {
	const links = document.querySelectorAll<HTMLAnchorElement>(
		'.issue-list-item a[href*="/issues/"], .issue-list-item a[href*="/pulls/"]',
	);
	for (const link of links) {
		link.hash = '#issue-comment-box';
	}
}

features.add(import.meta.url, {
	include: [
		isIssueOrPRList,
	],
	awaitDomReady: true,
	init,
});
