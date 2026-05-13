import "./ci-link.css";

import React from "dom-chef";
import CheckCircleFillIcon from "octicons-plain-react/CheckCircleFill";
import StopIcon from "octicons-plain-react/Stop";
import XCircleFillIcon from "octicons-plain-react/XCircleFill";

import features from "../feature-manager.js";
import { getRepo } from "../forgejo-helpers/index.js";
import { hasRepoHeader } from "../helpers/page-detect.js";
import observe from "../helpers/selector-observer.js";
import { getToken } from "../options-storage.js";

type RunStatus = "success" | "failure" | "cancelled" | "running" | "waiting";

async function addLink(titleArea: Element): Promise<void> {
  if (titleArea.querySelector(".rgf-ci-link")) {
    return;
  }

  const repo = getRepo();
  if (!repo) {
    return;
  }

  let status: RunStatus | undefined;
  try {
    const token = await getToken();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const headers: Record<string, string> = { accept: "application/json" };
    if (token) {
      headers.Authorization = `token ${token}`;
    }

    const response = await fetch(
      `${location.origin}/api/v1/repos/${repo.owner}/${repo.name}/actions/runs?limit=1`,
      { headers, signal: controller.signal },
    );
    clearTimeout(timer);

    if (response.ok) {
      const data = await response.json() as { workflow_runs?: Array<{ status: string }> };
      const s = data?.workflow_runs?.[0]?.status;
      if (s && ["success", "failure", "cancelled", "running", "waiting"].includes(s)) {
        status = s as RunStatus;
      }
    }
  } catch {
    // API unavailable
  }

  if (!status) {
    return;
  }

  const Icon = status === "success"
    ? CheckCircleFillIcon
    : status === "failure"
    ? XCircleFillIcon
    : status === "cancelled"
    ? StopIcon
    : CheckCircleFillIcon;

  const link = (
    <a
      className={`rgf-ci-link rgf-ci-${status}`}
      href={`/${repo.nameWithOwner}/actions`}
      title={status}
    >
      <Icon className="svg" />
    </a>
  );

  const existingInfo = titleArea.querySelector(".rgf-repo-info");
  if (existingInfo) {
    existingInfo.before(link);
  } else {
    const repoLink = titleArea.querySelector("a.muted.tw-font-semibold");
    if (repoLink) {
      repoLink.after(link);
    }
  }
}

function init(signal: AbortSignal): void {
  observe(".repo-header .flex-item-title", addLink, { signal });
}

features.add(import.meta.url, {
  include: [hasRepoHeader],
  init,
});