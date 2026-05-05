import './reactions-avatars.css';

import React from 'dom-chef';
import {$} from 'select-dom';

import features from '../feature-manager.js';
import api from '../forgejo-helpers/api.js';
import {getRepo} from '../forgejo-helpers/index.js';
import observe from '../helpers/selector-observer.js';

interface Reaction {
	user: {
		login: string;
		avatar_url: string;
	};
}

async function getCommentReactions(commentId: string): Promise<Reaction[]> {
	const repo = getRepo();
	if (!repo) {
		return [];
	}

	try {
		const data = await api.v3(`/repos/${repo.owner}/${repo.name}/issues/comments/${commentId}/reactions`);
		return data as Reaction[];
	} catch {
		return [];
	}
}

async function addAvatars(container: Element): Promise<void> {
	const commentId = container.closest('[data-comment-id]')?.getAttribute('data-comment-id');
	if (!commentId) {
		return;
	}

	const reactions = await getCommentReactions(commentId);
	if (reactions.length === 0) {
		return;
	}

	const existing = container.querySelector('.refined-forgejo-reactions');
	if (existing) {
		return;
	}

	const avatars = reactions.map(r => (
		<img
			className="avatar"
			src={r.user.avatar_url}
			alt={r.user.login}
			title={r.user.login}
		/>
	));

	const wrapper = (
		<div className="refined-forgejo-reactions">
			<div className="avatar-stack">
				{avatars}
			</div>
		</div>
	);

	const reactionBar = container.querySelector('.comment-reactions');
	if (reactionBar) {
		reactionBar.append(wrapper);
	} else {
		container.append(wrapper);
	}
}

async function init(signal: AbortSignal): Promise<void> {
	observe('.comment-body, .issue-comment', addAvatars, {signal});
}

features.add(import.meta.url, {
	include: [],
	init,
});
