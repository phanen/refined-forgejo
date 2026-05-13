import "./clean-conversation-sidebar.css";

import features from "../feature-manager.js";
import { isConversation } from "../helpers/page-detect.js";

void features.addCssFeature(import.meta.url);

features.add(import.meta.url, {
  include: [isConversation],
  awaitDomReady: true,
  init() {},
});
