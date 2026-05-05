export function getConversationNumber(): number | undefined {
  const parts = location.pathname.split("/");
  const type = parts[parts.length - 2];
  const number = parts[parts.length - 1];
  return (type === "pull" || type === "issues") && Number(number) ? Number(number) : undefined;
}

export const isMac = navigator.userAgent.includes("Macintosh");

export function buildRepoUrl(...pathParts: (string | number)[]): string {
  const repo = location.pathname.split("/").slice(1, 3).join("/");
  return `${location.origin}/${repo}/${pathParts.join("/")}`;
}