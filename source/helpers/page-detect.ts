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

export function startsWith(path: string): boolean {
  return location.pathname.startsWith(path);
}

import { getRepo } from "../forgejo-helpers/index.js";

export const isDashboard = (): boolean => location.pathname === "/" || location.pathname === "/dashboard";
export const isRepoHome = (): boolean => /^\/[^/]+\/[^/]+\/?$/.test(location.pathname);
export const isRepoTree = (): boolean =>
  isRepoHome()
  || /\/[^/]+\/[^/]+\/src\/(?:branch|tag)\//.test(location.pathname);
export const isIssue = (): boolean => /^issues\/\d+/.test(getRepo()?.path ?? "");
export const isPR = (): boolean => /^pulls\/\d+/.test(getRepo()?.path ?? "");
export const isIssueOrPR = (): boolean => isIssue() || isPR();
export const isConversation = (): boolean => isIssueOrPR();
export const isRepoIssueList = (): boolean => /^issues(?!\/(\d+|new|templates)($|\/))/.test(getRepo()?.path ?? "");
export const isRepoPRList = (): boolean => getRepo()?.path === "pulls";
export const isGlobalIssueList = (): boolean => /^issues(\/|$)/.test(location.pathname.replace(/^\//, ""));
export const isGlobalPRList = (): boolean => /^pulls(\/|$)/.test(location.pathname.replace(/^\//, ""));
export const isIssueList = (): boolean => isRepoIssueList() || isGlobalIssueList();
export const isPRList = (): boolean => isRepoPRList() || isGlobalPRList();
export const isIssueOrPRList = (): boolean => isIssueList() || isPRList();
export const isRepoIssueOrPRList = (): boolean => isRepoIssueList() || isRepoPRList();
export const isWiki = (): boolean => /\/[^/]+\/[^/]+\/wiki/.test(location.pathname);
export const isAction = (): boolean => /\/[^/]+\/[^/]+\/actions/.test(location.pathname);
export const isActionRun = (): boolean => /\/[^/]+\/[^/]+\/actions\/runs\/\d+/.test(location.pathname);
export const isSettings = (): boolean => /\/[^/]+\/[^/]+\/settings/.test(location.pathname);
export const isRepoSettings = (): boolean => /^settings/.test(getRepo()?.path ?? "");
export const isUserProfile = (): boolean => /^\/[^/]+$/.test(location.pathname);
export const isNotifications = (): boolean => location.pathname === "/notifications";
export const isSingleFile = (): boolean => /^(blob|src)\//.test(getRepo()?.path ?? "");
export const isBlame = (): boolean => /^blame\//.test(getRepo()?.path ?? "");
export const isSingleCommit = (): boolean => /^commit\/[\da-f]{5,40}$/.test(getRepo()?.path ?? "");
export const isPRFiles = (): boolean => /^pulls\/\d+\/files/.test(getRepo()?.path ?? "");
export const isPRCommitList = (): boolean => /^pulls\/\d+\/commits/.test(getRepo()?.path ?? "");
export const isRepoCommitList = (): boolean => /^commits\//.test(getRepo()?.path ?? "");
export const isRepoCommitListRoot = (): boolean => isRepoCommitList() && document.title.startsWith("Commits");
export const isCommitList = (): boolean => isRepoCommitList() || isPRCommitList();
export const isPRCommit = (): boolean => /^pulls\/\d+\/commits\/[\da-f]{7,40}$/.test(getRepo()?.path ?? "");
export const isCommit = (): boolean => isSingleCommit() || isPRCommit();
export const isCompare = (): boolean => /^compare/.test(getRepo()?.path ?? "");
export const isReleases = (): boolean => /^releases$/.test(getRepo()?.path ?? "");
export const isNewRelease = (): boolean => /^releases\/new$/.test(getRepo()?.path ?? "");
export const isEditingRelease = (): boolean => /^releases\/edit\//.test(getRepo()?.path ?? "");
export const isTags = (): boolean => /^tags$/.test(getRepo()?.path ?? "");
export const isSingleReleaseOrTag = (): boolean => /^releases\/tag\//.test(getRepo()?.path ?? "");
export const isReleasesOrTags = (): boolean => isReleases() || isTags();
export const isMilestone = (): boolean => /^milestone\/\d+/.test(getRepo()?.path ?? "");
export const isMilestoneList = (): boolean => /^milestones$/.test(getRepo()?.path ?? "");
export const isLabelList = (): boolean => /^labels$/.test(getRepo()?.path ?? "");
export const isNewIssue = (): boolean => /^issues\/new$/.test(getRepo()?.path ?? "");
export const isNewFile = (): boolean => /^new\//.test(getRepo()?.path ?? "");
export const isEditingFile = (): boolean => /^(_)?edit\//.test(getRepo()?.path ?? "");
export const isDeletingFile = (): boolean => /^delete\//.test(getRepo()?.path ?? "");
export const hasFileEditor = (): boolean => isNewFile() || isEditingFile() || isDeletingFile();
export const isBranches = (): boolean => /^branches$/.test(getRepo()?.path ?? "");
export const isRepoForksList = (): boolean => /^network\/members$/.test(getRepo()?.path ?? "");
export const isRepoNetworkGraph = (): boolean => /^network$/.test(getRepo()?.path ?? "");
export const isFileFinder = (): boolean => /^find\//.test(getRepo()?.path ?? "");
export const isRepoSearch = (): boolean => /^search(\/|$)/.test(getRepo()?.path ?? "");
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
  isCommitList,
  isRepoCommitList,
  isRepoCommitListRoot,
  isPRCommitList,
  isCompare,
  isConversation,
  isDashboard,
  isDeletingFile,
  isEditingFile,
  hasFileEditor,
  isFileFinder,
  isGlobalIssueList,
  isGlobalPRList,
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
  isPRCommit,
  isPRFiles,
  isPRList,
  isReleases,
  isNewRelease,
  isEditingRelease,
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
