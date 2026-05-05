export function getRepo(): {nameWithOwner: string; owner: string; name: string} | undefined {
	const match = location.pathname.match(/\/(?:repo)?\/([^\/]+)\/([^\/]+)/);
	if (!match) {
		return undefined;
	}
	return {
		nameWithOwner: `${match[1]}/${match[2]}`,
		owner: match[1],
		name: match[2],
	};
}

export function buildRepoUrl(...parts: string[]): string {
	const repo = getRepo();
	if (!repo) {
		return location.href;
	}
	return `/${repo.nameWithOwner}/${parts.join('/')}`;
}

export function getUser(): string | undefined {
	const match = location.pathname.match(/\/([^\/]+)\/?$/);
	return match?.[1];
}
