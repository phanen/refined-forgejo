import React from 'dom-chef';
import {$optional} from 'select-dom';

import features from '../feature-manager.js';

function init(): void {
	$optional('#js-repo-pjax-container')?.append(<has-rgh />);
	$optional('turbo-frame')?.append(<has-rgh-inner />);
}

features.add(import.meta.url, {init});
