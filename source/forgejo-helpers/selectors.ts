import { css } from "code-tag";

export const repoUnderlineNavUl = ".repo-head-container";

export const commentsCountInLists = ".flex-item-trailing .text.grey a:has(.octicon-comment-discussion)";

export const newCommentField = [
  "textarea[name=\"comment\"]",
  "#comment_body",
  ".comment-form textarea",
];

export const reactionSelector = ".comment-reactions";

export const reactionAvatarList = ".comment-reactions .avatar";

export const commitHashLinkInLists = [
  ".commit .sha",
  ".commit-link a",
];

export const usernameLinksSelector = [
  ".comment-author",
  ".user-link",
  "a[href*=\"/user/\"]",
];

export const botLinksCommitSelectors = [
  "a[href*=\"/apps/\"]",
  // "a[href*=\"/actions/\"]",
  "a[href$=\"-bot\"]",
  "a[href*=\"/bot-\"]",
  "a[href*=\"-bot/\"]",
  "img[title*=\"bot\"]",
  "img[title*=\"Bot\"]",
  "span.bot",
];

export const openPrsListLink = css`
	.flex-item:has(.octicon-git-pull-request) a.issue-title
`;
