const currentPage: string = location.pathname;

function get(path: string | RegExp): boolean {
  if (typeof path === "string") {
    return currentPage === path;
  }
  return path.test(currentPage);
}

function includes(path: string | RegExp): boolean {
  if (typeof path === "string") {
    return currentPage.includes(path);
  }
  return path.test(currentPage);
}

function startsWith(path: string): boolean {
  return currentPage.startsWith(path);
}

export const isDashboard = (): boolean => currentPage === "/" || currentPage === "/dashboard";
export const isRepoHome = (): boolean => /\/(?:repo)?\/[^\/]+\/[^\/]+$/.test(currentPage);
export const isRepoTree = (): boolean => isRepoHome() && includes("/src/");
export const isIssue = (): boolean => /\/(?:repo)?\/[^\/]+\/[^\/]+\/issues\/\d+/.test(currentPage);
export const isPR = (): boolean => /\/(?:repo)?\/[^\/]+\/[^\/]+\/pull\/\d+/.test(currentPage);
export const isIssueOrPRList = (): boolean => /\/(?:repo)?\/[^\/]+\/[^\/]+\/(issues|pulls)$/.test(currentPage);
export const isIssueList = (): boolean => /\/(?:repo)?\/[^\/]+\/[^\/]+\/issues$/.test(currentPage);
export const isPRList = (): boolean => /\/(?:repo)?\/[^\/]+\/[^\/]+\/pulls$/.test(currentPage);
export const isWiki = (): boolean => includes("/wiki/");
export const isAction = (): boolean => includes("/actions/");
export const isActionRun = (): boolean => /\/(?:repo)?\/[^\/]+\/[^\/]+\/actions\/runs\/\d+/.test(currentPage);
export const isSettings = (): boolean => includes("/settings/");
export const isUserProfile = (): boolean => /^\/[^\/]+$/.test(currentPage);
export const isNotifications = (): boolean => currentPage === "/notifications";

export const pageDetect = {
  get,
  includes,
  startsWith,
  isDashboard,
  isRepoHome,
  isRepoTree,
  isIssue,
  isPR,
  isIssueOrPRList,
  isIssueList,
  isPRList,
  isWiki,
  isAction,
  isActionRun,
  isSettings,
  isUserProfile,
  isNotifications,
};

export default pageDetect;
