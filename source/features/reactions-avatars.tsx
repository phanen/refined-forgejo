import './reactions-avatars.css';

import React from 'dom-chef';

import features from '../feature-manager.js';
import api from '../forgejo-helpers/api.js';
import {getRepo} from '../forgejo-helpers/index.js';
import observe from '../helpers/selector-observer.js';

interface ReactionUser {
	login: string;
	avatar_url: string;
}

interface Reaction {
	user: ReactionUser;
	content: string;
}

async function getCommentReactions(commentId: string): Promise<Reaction[]> {
	try {
		const data = await api.v3(`/repos/${getRepo()!.owner}/${getRepo()!.name}/issues/comments/${commentId}/reactions`);
		return data as Reaction[];
	} catch {
		return [];
	}
}

function addAvatars(reactionButton: Element): void {
	if (reactionButton.querySelector('.rgh-reaction-avatars')) {
		return;
	}

	const comment = reactionButton.closest('.comment') || reactionButton.closest('.timeline-item');
	if (!comment) {
		return;
	}

	const commentId = comment.id.match(/issuecomment-(\d+)/)?.[1];
	if (!commentId) {
		return;
	}

	getCommentReactions(commentId).then(reactions => {
		if (reactions.length === 0) {
			return;
		}

		const existing = reactionButton.querySelector('.rgh-reaction-avatars');
		if (existing) {
			return;
		}

		const avatars = reactions.slice(0, 10).map(r => (
			<img
				className="avatar"
				src={r.user.avatar_url}
				alt={r.user.login}
				title={r.user.login}
			/>
		));

		const wrapper = (
			<span className="rgh-reaction-avatars" style={{display: 'inline-flex', gap: '2px', marginLeft: '4px'}}>
				{avatars}
			</span>
		);

		reactionButton.append(wrapper);
	});
}

async function init(signal: AbortSignal): Promise<void> {
	observe('.comment .reactions .emoji-button, .timeline-item .reactions .emoji-button', addAvatars, {signal});
}

features.add(import.meta.url, {
	include: [],
	init,
});
