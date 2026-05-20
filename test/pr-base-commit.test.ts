import { parseHTML } from "linkedom";
import { describe, expect, it } from "vitest";

import { getHeadBranch } from "../source/helpers/pr-base-commit.js";

describe("pr-base-commit", () => {
  it("gets the head branch even when the cleaned header puts base branch first", () => {
    const { document } = parseHTML(`
      <div class="issue-title-meta">
        <span id="pull-desc-display" class="pull-desc">
          <code id="branch_target"><a href="/repo/ziglang/zig/src/branch/main">ziglang:main</a></code>
          <code><a href="/repo/ziglang/zig/src/branch/topic">ziglang:topic</a></code>
        </span>
      </div>
    `);

    expect(getHeadBranch(document)).toEqual({
      owner: "ziglang",
      repo: "zig",
      branch: "topic",
    });
  });
});
