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

function getRepoPath(segment: string): boolean {
  return new RegExp(`/[^/]+/[^/]+/${segment}`).test(location.pathname);
}

export const isDashboard = (): boolean => location.pathname === "/" || location.pathname === "/dashboard";
export const isRepoHome = (): boolean => /^\/[^/]+\/[^/]+\/?$/.test(location.pathname);
export const isRepoTree = (): boolean =>
  isRepoHome()
  || /\/[^/]+\/[^/]+\/src\/(?:branch|tag)\//.test(location.pathname);
export const isIssue = (): boolean => getRepoPath("issues/\\d+");
export const isPR = (): boolean => getRepoPath("pull/\\d+");
export const isIssueOrPR = (): boolean => isIssue() || isPR();
export const isConversation = (): boolean => isIssueOrPR();
export const isPRCommits = (): boolean => getRepoPath("pull/\\d+/commits");
export const isIssueOrPRList = (): boolean => /\/[^/]+\/[^/]+\/(issues|pulls)$/.test(location.pathname);
export const isIssueList = (): boolean => /\/[^/]+\/[^/]+\/issues$/.test(location.pathname);
export const isPRList = (): boolean => /\/[^/]+\/[^/]+\/pulls$/.test(location.pathname);
export const isRepoIssueList = isIssueList;
export const isRepoPRList = isPRList;
export const isWiki = (): boolean => /\/[^/]+\/[^/]+\/wiki/.test(location.pathname);
export const isAction = (): boolean => /\/[^/]+\/[^/]+\/actions/.test(location.pathname);
export const isActionRun = (): boolean => /\/[^/]+\/[^/]+\/actions\/runs\/\d+/.test(location.pathname);
export const isSettings = (): boolean => /\/[^/]+\/[^/]+\/settings/.test(location.pathname);
export const isRepoSettings = (): boolean => /\/[^/]+\/[^/]+\/settings/.test(location.pathname);
export const isUserProfile = (): boolean => /^\/[^/]+$/.test(location.pathname);
export const isNotifications = (): boolean => location.pathname === "/notifications";
export const isSingleFile = (): boolean => getRepoPath("blob/");
export const isBlame = (): boolean => getRepoPath("blame/");
export const isSingleCommit = (): boolean => getRepoPath("commit/[\\da-f]{5,40}$");
export const isCommit = (): boolean => isSingleCommit();
export const isCompare = (): boolean => getRepoPath("compare");
export const isReleases = (): boolean => getRepoPath("releases$");
export const isTags = (): boolean => getRepoPath("tags$");
export const isSingleReleaseOrTag = (): boolean => getRepoPath("releases/tag/");
export const isReleasesOrTags = (): boolean => isReleases() || isTags();
export const isMilestone = (): boolean => getRepoPath("milestone/\\d+");
export const isMilestoneList = (): boolean => getRepoPath("milestones$");
export const isLabelList = (): boolean => getRepoPath("labels$");
export const isNewIssue = (): boolean => getRepoPath("issues/new");
export const isNewFile = (): boolean => getRepoPath("new/");
export const isEditingFile = (): boolean => getRepoPath("edit/");
export const isDeletingFile = (): boolean => getRepoPath("delete/");
export const hasFileEditor = (): boolean => isNewFile() || isEditingFile() || isDeletingFile();
export const isBranches = (): boolean => getRepoPath("branches");
export const isRepoForksList = (): boolean => getRepoPath("network/members");
export const isRepoNetworkGraph = (): boolean => getRepoPath("network$");
export const isFileFinder = (): boolean => getRepoPath("find/");
export const isRepoSearch = (): boolean => getRepoPath("search$");
export const isRepoFile404 = (): boolean =>
  (isSingleFile() || isRepoTree()) && document.title.startsWith("File not found");
export const hasRepoHeader = (): boolean => !isRepoSearch() && /\/[^/]+\/[^/]+/.test(location.pathname);

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
};

export default pageDetect;
