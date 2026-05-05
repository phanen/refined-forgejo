import sucrase from '@rollup/plugin-sucrase';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
import styles from 'rollup-plugin-styles';
import {string} from 'rollup-plugin-string';
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import lightning from 'unplugin-lightningcss/rollup';
import {Features, browserslistToTargets} from 'lightningcss';
import browserslist from 'browserslist';

const noise = new Set(['index', 'dist', 'src', 'source', 'distribution', 'node_modules', 'main', 'esm', 'cjs', 'build']);

const rollup = {
	input: {
		options: './source/options.tsx',
		background: './source/background.ts',
		'refined-forgejo': './source/refined-forgejo.ts',
		'content-script': './source/content-script.ts',
	},
	output: {
		dir: 'distribution/assets',
		preserveModules: true,
		preserveModulesRoot: 'source',
		assetFileNames: '[name][extname]',
		entryFileNames(chunkInfo) {
			if (chunkInfo.name.includes('node_modules')) {
				const cleanName = chunkInfo.name
					.split('/')
					.filter(part => !noise.has(part))
					.join('-');
				return `npm/${cleanName}.js`;
			}
			return chunkInfo.name + '.js';
		},
	},
	watch: {
		clearScreen: false,
	},
	context: 'globalThis',
	plugins: [
		del({
			targets: ['distribution/assets'],
			runOnce: true,
		}),
		lightning({
			options: {
				include: Features.Nesting,
				targets: browserslistToTargets(browserslist('chrome 123, firefox 126, iOS 17.5')),
			},
		}),
		json(),
		styles({
			mode: 'extract',
			url: false,
		}),
		alias({
			entries: [
				{find: 'react', replacement: 'dom-chef'},
			],
		}),
		sucrase({
			transforms: ['typescript', 'jsx'],
			disableESTransforms: true,
			production: true,
		}),
		resolve({browser: true}),
		commonjs(),
		copy({
			targets: [
				{src: './source/manifest.json', dest: 'distribution'},
				{src: './source/*.png', dest: 'distribution/assets'},
			],
		}),
		cleanup(),
	],
};

export default rollup;
