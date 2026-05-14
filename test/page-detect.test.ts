import { beforeAll, describe, expect, it, vi } from "vitest";

// Mock location and document before importing page-detect (module evaluates at import time)
beforeAll(() => {
  vi.stubGlobal("location", { pathname: "/" });
  vi.stubGlobal("document", { title: "" });
});

// Dynamic import so the mock is set before module evaluation
async function getDetect() {
  return import("../source/helpers/page-detect.js");
}

function testTrue(fn: () => boolean, pathname: string): void {
  it(`${fn.name} → true  ${pathname}`, () => {
    vi.stubGlobal("location", { pathname });
    expect(fn()).toBe(true);
  });
}

function testFalse(fn: () => boolean, pathname: string): void {
  it(`${fn.name} → false ${pathname}`, () => {
    vi.stubGlobal("location", { pathname });
    expect(fn()).toBe(false);
  });
}

function testWithTitle(
  fn: () => boolean,
  pathname: string,
  title: string,
  expected: boolean,
): void {
  it(`${fn.name} → ${expected ? "true " : "false"} ${pathname} [title: ${title}]`, () => {
    vi.stubGlobal("location", { pathname });
    vi.stubGlobal("document", { title });
    expect(fn()).toBe(expected);
  });
}

describe("page-detect", async () => {
  const pageDetect = await getDetect();

  describe("isRepoHome", () => {
    testTrue(pageDetect.isRepoHome, "/ziglang/zig");
    testTrue(pageDetect.isRepoHome, "/ziglang/zig/");
    testFalse(pageDetect.isRepoHome, "/ziglang/zig/issues");
    testFalse(pageDetect.isRepoHome, "/");
    testFalse(pageDetect.isRepoHome, "/ziglang");
  });

  describe("isRepoTree", () => {
    testTrue(pageDetect.isRepoTree, "/ziglang/zig");
    testTrue(pageDetect.isRepoTree, "/ziglang/zig/src/branch/main");
    testTrue(pageDetect.isRepoTree, "/ziglang/zig/src/branch/main/src");
    testFalse(pageDetect.isRepoTree, "/ziglang/zig/issues");
  });

  describe("isIssue", () => {
    testTrue(pageDetect.isIssue, "/ziglang/zig/issues/123");
    testTrue(pageDetect.isIssue, "/ziglang/zig/issues/31844");
    testFalse(pageDetect.isIssue, "/ziglang/zig/issues");
    testFalse(pageDetect.isIssue, "/ziglang/zig/pulls/123");
  });

  describe("isPR", () => {
    testTrue(pageDetect.isPR, "/ziglang/zig/pulls/123");
    testTrue(pageDetect.isPR, "/ziglang/zig/pulls/456");
    testFalse(pageDetect.isPR, "/ziglang/zig/issues");
    testFalse(pageDetect.isPR, "/ziglang/zig/pulls");
  });

  describe("isIssueOrPR", () => {
    testTrue(pageDetect.isIssueOrPR, "/ziglang/zig/issues/123");
    testTrue(pageDetect.isIssueOrPR, "/ziglang/zig/pulls/123");
  });

  describe("isPRCommits", () => {
    testTrue(pageDetect.isPRCommits, "/ziglang/zig/pulls/123/commits");
    testFalse(pageDetect.isPRCommits, "/ziglang/zig/pulls/123");
  });

  describe("isIssueOrPRList", () => {
    testTrue(pageDetect.isIssueOrPRList, "/ziglang/zig/issues");
    testTrue(pageDetect.isIssueOrPRList, "/ziglang/zig/pulls");
    testTrue(pageDetect.isIssueOrPRList, "/ziglang/zig/issues");
    testFalse(pageDetect.isIssueOrPRList, "/ziglang/zig/issues/123");
    testFalse(pageDetect.isIssueOrPRList, "/ziglang/zig");
  });

  describe("isIssueList", () => {
    testTrue(pageDetect.isIssueList, "/ziglang/zig/issues");
    testFalse(pageDetect.isIssueList, "/ziglang/zig/issues/123");
    testFalse(pageDetect.isIssueList, "/ziglang/zig/pulls");
  });

  describe("isPRList", () => {
    testTrue(pageDetect.isPRList, "/ziglang/zig/pulls");
    testFalse(pageDetect.isPRList, "/ziglang/zig/pulls/123");
  });

  describe("isRepoIssueList", () => {
    testTrue(pageDetect.isRepoIssueList, "/ziglang/zig/issues");
    testFalse(pageDetect.isRepoIssueList, "/ziglang/zig/issues/123");
    testFalse(pageDetect.isRepoIssueList, "/ziglang/zig/labels");
    testFalse(pageDetect.isRepoIssueList, "/ziglang/zig/pulls");
  });

  describe("isRepoPRList", () => {
    testTrue(pageDetect.isRepoPRList, "/ziglang/zig/pulls");
    testFalse(pageDetect.isRepoPRList, "/ziglang/zig/pulls/123");
    testFalse(pageDetect.isRepoPRList, "/ziglang/zig/issues");
  });

  describe("isRepoIssueOrPRList", () => {
    testTrue(pageDetect.isRepoIssueOrPRList, "/ziglang/zig/issues");
    testTrue(pageDetect.isRepoIssueOrPRList, "/ziglang/zig/pulls");
    testFalse(pageDetect.isRepoIssueOrPRList, "/ziglang/zig/issues/123");
    testFalse(pageDetect.isRepoIssueOrPRList, "/ziglang/zig/pulls/123");
    testFalse(pageDetect.isRepoIssueOrPRList, "/ziglang/zig");
  });

  describe("isGlobalIssueList", () => {
    testTrue(pageDetect.isGlobalIssueList, "/issues");
    testTrue(pageDetect.isGlobalIssueList, "/issues/assigned");
    testFalse(pageDetect.isGlobalIssueList, "/ziglang/zig/issues");
  });

  describe("isGlobalPRList", () => {
    testTrue(pageDetect.isGlobalPRList, "/pulls");
    testTrue(pageDetect.isGlobalPRList, "/pulls/assigned");
    testFalse(pageDetect.isGlobalPRList, "/ziglang/zig/pulls");
  });

  describe("isWiki", () => {
    testTrue(pageDetect.isWiki, "/ziglang/zig/wiki");
    testTrue(pageDetect.isWiki, "/ziglang/zig/wiki/Home");
    testFalse(pageDetect.isWiki, "/ziglang/zig/issues");
  });

  describe("isAction", () => {
    testTrue(pageDetect.isAction, "/ziglang/zig/actions");
    testTrue(pageDetect.isAction, "/ziglang/zig/actions/runs/123");
    testFalse(pageDetect.isAction, "/ziglang/zig/issues");
  });

  describe("isActionRun", () => {
    testTrue(pageDetect.isActionRun, "/ziglang/zig/actions/runs/123");
    testFalse(pageDetect.isActionRun, "/ziglang/zig/actions");
    testFalse(pageDetect.isActionRun, "/ziglang/zig/issues");
  });

  describe("isSettings / isRepoSettings", () => {
    testTrue(pageDetect.isSettings, "/ziglang/zig/settings");
    testTrue(pageDetect.isSettings, "/ziglang/zig/settings/branches");
    testTrue(pageDetect.isRepoSettings, "/ziglang/zig/settings");
    testFalse(pageDetect.isSettings, "/ziglang/zig/issues");
  });

  describe("isUserProfile", () => {
    testTrue(pageDetect.isUserProfile, "/ziglang");
    testTrue(pageDetect.isUserProfile, "/username");
    testFalse(pageDetect.isUserProfile, "/ziglang/zig");
  });

  describe("isNotifications", () => {
    testTrue(pageDetect.isNotifications, "/notifications");
    testFalse(pageDetect.isNotifications, "/ziglang/zig/issues");
  });

  describe("isDashboard", () => {
    testTrue(pageDetect.isDashboard, "/");
    testTrue(pageDetect.isDashboard, "/dashboard");
    testFalse(pageDetect.isDashboard, "/ziglang/zig");
  });

  describe("isSingleFile", () => {
    testTrue(pageDetect.isSingleFile, "/ziglang/zig/blob/main/README.md");
    testTrue(pageDetect.isSingleFile, "/ziglang/zig/blob/main/src/main.zig");
    testFalse(pageDetect.isSingleFile, "/ziglang/zig/tree/main");
  });

  describe("isBlame", () => {
    testTrue(pageDetect.isBlame, "/ziglang/zig/blame/main/README.md");
    testFalse(pageDetect.isBlame, "/ziglang/zig/blob/main/README.md");
  });

  describe("isSingleCommit", () => {
    testTrue(pageDetect.isSingleCommit, "/ziglang/zig/commit/a1b2c3d4e5f6");
    testTrue(pageDetect.isSingleCommit, "/ziglang/zig/commit/a1b2c");
    testFalse(pageDetect.isSingleCommit, "/ziglang/zig/commits/main");
  });

  describe("isCompare", () => {
    testTrue(pageDetect.isCompare, "/ziglang/zig/compare/main...branch");
    testTrue(pageDetect.isCompare, "/ziglang/zig/compare");
    testFalse(pageDetect.isCompare, "/ziglang/zig/issues");
  });

  describe("isReleases", () => {
    testTrue(pageDetect.isReleases, "/ziglang/zig/releases");
    testFalse(pageDetect.isReleases, "/ziglang/zig/releases/tag/1.0");
  });

  describe("isTags", () => {
    testTrue(pageDetect.isTags, "/ziglang/zig/tags");
    testFalse(pageDetect.isTags, "/ziglang/zig/releases");
  });

  describe("isSingleReleaseOrTag", () => {
    testTrue(pageDetect.isSingleReleaseOrTag, "/ziglang/zig/releases/tag/1.0");
    testTrue(pageDetect.isSingleReleaseOrTag, "/ziglang/zig/releases/tag/v0.1.0");
    testFalse(pageDetect.isSingleReleaseOrTag, "/ziglang/zig/releases");
  });

  describe("isMilestone", () => {
    testTrue(pageDetect.isMilestone, "/ziglang/zig/milestone/1");
    testFalse(pageDetect.isMilestone, "/ziglang/zig/milestones");
  });

  describe("isMilestoneList", () => {
    testTrue(pageDetect.isMilestoneList, "/ziglang/zig/milestones");
    testFalse(pageDetect.isMilestoneList, "/ziglang/zig/milestone/1");
  });

  describe("isLabelList", () => {
    testTrue(pageDetect.isLabelList, "/ziglang/zig/labels");
    testFalse(pageDetect.isLabelList, "/ziglang/zig/issues");
  });

  describe("isNewIssue", () => {
    testTrue(pageDetect.isNewIssue, "/ziglang/zig/issues/new");
    testFalse(pageDetect.isNewIssue, "/ziglang/zig/issues");
  });

  describe("isNewFile", () => {
    testTrue(pageDetect.isNewFile, "/ziglang/zig/new/main/test.zig");
    testFalse(pageDetect.isNewFile, "/ziglang/zig");
  });

  describe("isEditingFile", () => {
    testTrue(pageDetect.isEditingFile, "/ziglang/zig/edit/main/README.md");
    testFalse(pageDetect.isEditingFile, "/ziglang/zig/blob/main/README.md");
  });

  describe("isDeletingFile", () => {
    testTrue(pageDetect.isDeletingFile, "/ziglang/zig/delete/main/test.zig");
    testFalse(pageDetect.isDeletingFile, "/ziglang/zig");
  });

  describe("isBranches", () => {
    testTrue(pageDetect.isBranches, "/ziglang/zig/branches");
    testFalse(pageDetect.isBranches, "/ziglang/zig");
  });

  describe("isRepoForksList", () => {
    testTrue(pageDetect.isRepoForksList, "/ziglang/zig/network/members");
    testFalse(pageDetect.isRepoForksList, "/ziglang/zig/network");
  });

  describe("isRepoNetworkGraph", () => {
    testTrue(pageDetect.isRepoNetworkGraph, "/ziglang/zig/network");
    testFalse(pageDetect.isRepoNetworkGraph, "/ziglang/zig/network/members");
  });

  describe("isFileFinder", () => {
    testTrue(pageDetect.isFileFinder, "/ziglang/zig/find/main");
    testFalse(pageDetect.isFileFinder, "/ziglang/zig");
  });

  describe("isRepoSearch", () => {
    testTrue(pageDetect.isRepoSearch, "/ziglang/zig/search");
    testTrue(pageDetect.isRepoSearch, "/ziglang/zig/search/branch/main");
    testFalse(pageDetect.isRepoSearch, "/ziglang/zig");
  });

  describe("is404", () => {
    testWithTitle(pageDetect.is404, "/any/page", "Page not found — Forgejo", true);
    testWithTitle(pageDetect.is404, "/any/page", "Dashboard", false);
  });

  describe("isCommit", () => {
    testTrue(pageDetect.isCommit, "/ziglang/zig/commit/a1b2c3d4e5f6");
    testTrue(pageDetect.isCommit, "/ziglang/zig/commit/a1b2c");
    testTrue(pageDetect.isCommit, "/ziglang/zig/pulls/123/commits/a1b2c3d4e5f6");
    testTrue(pageDetect.isCommit, "/ziglang/zig/pulls/123/commits/a1b2c3d");
    testFalse(pageDetect.isCommit, "/ziglang/zig/commits/main");
  });

  describe("isPRCommit", () => {
    testTrue(pageDetect.isPRCommit, "/ziglang/zig/pulls/123/commits/a1b2c3d4e5f6");
    testTrue(pageDetect.isPRCommit, "/ziglang/zig/pulls/123/commits/a1b2c3d");
    testFalse(pageDetect.isPRCommit, "/ziglang/zig/pulls/123/commits");
    testFalse(pageDetect.isPRCommit, "/ziglang/zig/commit/a1b2c3d4e5f6");
  });

  describe("isConversation", () => {
    testTrue(pageDetect.isConversation, "/ziglang/zig/issues/123");
    testTrue(pageDetect.isConversation, "/ziglang/zig/pulls/123");
    testFalse(pageDetect.isConversation, "/ziglang/zig/issues");
  });

  describe("isNewFile", () => {
    testTrue(pageDetect.isNewFile, "/ziglang/zig/new/main/test.zig");
    testFalse(pageDetect.isNewFile, "/ziglang/zig");
  });

  describe("isEditingFile", () => {
    testTrue(pageDetect.isEditingFile, "/ziglang/zig/_edit/main/README.md");
    testTrue(pageDetect.isEditingFile, "/ziglang/zig/edit/main/README.md");
    testFalse(pageDetect.isEditingFile, "/ziglang/zig/blob/main/README.md");
  });

  describe("isDeletingFile", () => {
    testTrue(pageDetect.isDeletingFile, "/ziglang/zig/delete/main/test.zig");
    testFalse(pageDetect.isDeletingFile, "/ziglang/zig");
  });

  describe("hasFileEditor", () => {
    testTrue(pageDetect.hasFileEditor, "/ziglang/zig/new/main/test.zig");
    testTrue(pageDetect.hasFileEditor, "/ziglang/zig/_edit/main/README.md");
    testTrue(pageDetect.hasFileEditor, "/ziglang/zig/delete/main/test.zig");
    testFalse(pageDetect.hasFileEditor, "/ziglang/zig");
  });

  describe("isReleasesOrTags", () => {
    testTrue(pageDetect.isReleasesOrTags, "/ziglang/zig/releases");
    testTrue(pageDetect.isReleasesOrTags, "/ziglang/zig/tags");
    testFalse(pageDetect.isReleasesOrTags, "/ziglang/zig/issues");
  });

  describe("isRepoFile404", () => {
    testWithTitle(pageDetect.isRepoFile404, "/ziglang/zig/blob/main/nonexistent.ts", "File not found", true);
    testWithTitle(pageDetect.isRepoFile404, "/ziglang/zig/blob/main/README.md", "README.md", false);
  });

  describe("hasRepoHeader", () => {
    testTrue(pageDetect.hasRepoHeader, "/ziglang/zig");
    testTrue(pageDetect.hasRepoHeader, "/ziglang/zig/issues");
    testFalse(pageDetect.hasRepoHeader, "/");
    testFalse(pageDetect.hasRepoHeader, "/issues");
  });
});
