function get(path: string | RegExp): boolean {
  if (typeof path === "string") {
    return location.pathname === path;
  }
  return path.test(location.pathname);
}

function includes(path: string | RegExp): boolean {
  if (typeof path === "string") {
    return location.pathname.includes(path);
  }
  return path.test(location.pathname);
}

function startsWith(path: string): boolean {
  return location.pathname.startsWith(path);
}

import { getRepo } from "../forgejo-helpers/index.js";

function repoPathStartsWith(segment: string): boolean {
  const repo = getRepo();
  return repo?.path.startsWith(segment) ?? false;
}

function repoPathMatch(pattern: string): boolean {
  const repo = getRepo();
  if (!repo) {
    return false;
  }

  return new RegExp(`^${pattern}$`).test(repo.path);
}

export const isDashboard = (): boolean => location.pathname === "/" || location.pathname === "/dashboard";
export const isRepoHome = (): boolean => /^\/[^/]+\/[^/]+\/?$/.test(location.pathname);
export const isRepoTree = (): boolean =>
  isRepoHome()
  || /\/[^/]+\/[^/]+\/src\/(?:branch|tag)\//.test(location.pathname);
export const isIssue = (): boolean => getRepo()?.path.startsWith("issues/") ?? false;
export const isPR = (): boolean => getRepo()?.path.startsWith("pulls/") ?? false;
export const isIssueOrPR = (): boolean => isIssue() || isPR();
export const isConversation = (): boolean => isIssueOrPR();
export const isPRCommits = (): boolean => repoPathStartsWith("pulls/") && location.pathname.endsWith("/commits");
export const isIssueOrPRList = (): boolean => getRepo()?.path === "issues" || getRepo()?.path === "pulls";
export const isIssueList = (): boolean => getRepo()?.path === "issues";
export const isPRList = (): boolean => getRepo()?.path === "pulls";
export const isRepoIssueList = isIssueList;
export const isRepoPRList = isPRList;
export const isRepoIssueOrPRList = (): boolean => isIssueOrPRList();
export const isWiki = (): boolean => /\/[^/]+\/[^/]+\/wiki/.test(location.pathname);
export const isAction = (): boolean => /\/[^/]+\/[^/]+\/actions/.test(location.pathname);
export const isActionRun = (): boolean => /\/[^/]+\/[^/]+\/actions\/runs\/\d+/.test(location.pathname);
export const isSettings = (): boolean => /\/[^/]+\/[^/]+\/settings/.test(location.pathname);
export const isRepoSettings = (): boolean => repoPathStartsWith("settings");
export const isUserProfile = (): boolean => /^\/[^/]+$/.test(location.pathname);
export const isNotifications = (): boolean => location.pathname === "/notifications";
export const isSingleFile = (): boolean => repoPathStartsWith("blob/") || repoPathStartsWith("src/");
export const isBlame = (): boolean => repoPathStartsWith("blame/");
export const isSingleCommit = (): boolean => repoPathMatch("commit/[\\da-f]{5,40}");
export const isCommit = (): boolean => isSingleCommit();
export const isCompare = (): boolean => repoPathStartsWith("compare");
export const isReleases = (): boolean => repoPathMatch("releases");
export const isTags = (): boolean => repoPathMatch("tags");
export const isSingleReleaseOrTag = (): boolean => repoPathStartsWith("releases/tag/");
export const isReleasesOrTags = (): boolean => isReleases() || isTags();
export const isMilestone = (): boolean => repoPathMatch("milestone/\\d+");
export const isMilestoneList = (): boolean => repoPathMatch("milestones");
export const isLabelList = (): boolean => repoPathMatch("labels");
export const isNewIssue = (): boolean => repoPathMatch("issues/new");
export const isNewFile = (): boolean => repoPathStartsWith("new/");
export const isEditingFile = (): boolean => repoPathStartsWith("_edit/") || repoPathStartsWith("edit/");
export const isDeletingFile = (): boolean => repoPathStartsWith("delete/");
export const hasFileEditor = (): boolean => isNewFile() || isEditingFile() || isDeletingFile();
export const isBranches = (): boolean => repoPathMatch("branches");
export const isRepoForksList = (): boolean => repoPathMatch("network/members");
export const isRepoNetworkGraph = (): boolean => repoPathMatch("network");
export const isFileFinder = (): boolean => repoPathStartsWith("find/");
export const isRepoSearch = (): boolean => repoPathMatch("search");
export const hasRepoHeader = (): boolean => !!getRepo();
export const is404 = (): boolean => document.title.startsWith("Page not found");
export const isRepoFile404 = (): boolean =>
  (isSingleFile() || isRepoTree()) && document.title.startsWith("File not found");

export const pageDetect = {
  get,
  includes,
  startsWith,
  isBranches,
  isBlame,
  isCommit,
  isCompare,
  isConversation,
  isDashboard,
  isDeletingFile,
  isEditingFile,
  hasFileEditor,
  isFileFinder,
  isIssue,
  isIssueList,
  isIssueOrPR,
  isIssueOrPRList,
  isLabelList,
  isMilestone,
  isMilestoneList,
  isNewFile,
  isNewIssue,
  isNotifications,
  isPR,
  isPRCommits,
  isPRList,
  isReleases,
  isReleasesOrTags,
  isRepoForksList,
  isRepoHome,
  hasRepoHeader,
  isRepoIssueList,
  isRepoNetworkGraph,
  isRepoPRList,
  isRepoIssueOrPRList,
  isRepoFile404,
  isRepoSearch,
  isRepoSettings,
  isRepoTree,
  isSettings,
  isSingleCommit,
  isSingleFile,
  isSingleReleaseOrTag,
  isTags,
  isUserProfile,
  isWiki,
  isAction,
  isActionRun,
  is404,
};

export default pageDetect;
