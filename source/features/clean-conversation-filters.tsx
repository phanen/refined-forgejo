import "./clean-conversation-filters.css";

import features from "../feature-manager.js";
import { isRepoIssueOrPRList } from "../helpers/page-detect.js";

void features.addCssFeature(import.meta.url);
features.add(import.meta.url, {
  include: [isRepoIssueOrPRList],
  init() {},
});

/*
Test URLs:

- https://codeberg.org/ziglang/zig/issues
- https://codeberg.org/ziglang/zig/labels
*/
