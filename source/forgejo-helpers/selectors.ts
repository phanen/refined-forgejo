import {css} from 'code-tag';

export const repoUnderlineNavUl = '.repo-head-container';

export const commentsCountInLists = `
	.issue-list-item a:is(
		[href*="/issues/"],
		[href*="/pulls/"]
	)
`;

export const newCommentField = [
	'textarea[name="comment"]',
	'#comment_body',
	'.comment-form textarea',
];

export const reactionSelector = '.comment-reactions';

export const reactionAvatarList = '.comment-reactions .avatar';

export const commitHashLinkInLists = [
	'.commit .sha',
	'.commit-link a',
];

export const usernameLinksSelector = [
	'.comment-author',
	'.user-link',
	'a[href*="/user/"]',
];

export const botLinksCommitSelectors = [
	'a[href*="/apps/"]',
	'a[href*="/actions/"]',
];

export const openPrsListLink = css`
	.issue-list-item:has(.octicon-git-pull-request) a
`;
