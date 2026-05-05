import './reactions-avatars.css';

import React from 'dom-chef';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

async function getAvatarUrl(username: string): Promise<string | undefined> {
	try {
		const response = await fetch(`https://codeberg.org/api/v1/users/${username}`);
		if (!response.ok) {
			return undefined;
		}
		const data = await response.json();
		return data.avatar_url;
	} catch {
		return undefined;
	}
}

async function addAvatars(reactionButton: Element): Promise<void> {
	if (reactionButton.querySelector('.rgf-reaction-avatar')) {
		return;
	}

	const title = reactionButton.getAttribute('title')?.trim();
	if (!title) {
		return;
	}

	const usernames = title.split(',').map(u => u.trim()).filter(Boolean);
	if (usernames.length === 0) {
		return;
	}

	for (const username of usernames) {
		const avatarUrl = await getAvatarUrl(username);
		if (!avatarUrl) {
			continue;
		}

		const avatar = (
			<img
				className="rgf-reaction-avatar"
				src={avatarUrl}
				alt={username}
				title={username}
				style={{width: '16px', height: '16px', borderRadius: '50%', marginLeft: '4px', verticalAlign: 'middle'}}
			/>
		);

		reactionButton.append(avatar);
	}
}

async function init(signal: AbortSignal): Promise<void> {
	observe('.comment-reaction-button', addAvatars, {signal});
}

features.add(import.meta.url, {
	init,
});
