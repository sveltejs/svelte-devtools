import { profile } from './listener.js';

let topFrame = {};
let currentFrame = topFrame;
let profilerEnabled = false;

export function startProfiler() {
	topFrame = {
		type: 'top',
		start: performance.now(),
		children: [],
	};
	currentFrame = topFrame;
	profilerEnabled = true;
}

export function stopProfiler() {
	(topFrame.end = performance.now()), (profilerEnabled = false);
}

export function clearProfiler() {
	topFrame.children = [];
	topFrame.start = performance.now();
}

export function updateProfile(node, type, fn, ...args) {
	if (!profilerEnabled) {
		fn(...args);
		return;
	}

	const parentFrame = currentFrame;
	currentFrame = {
		type,
		node: node.id,
		start: performance.now(),
		children: [],
	};
	parentFrame.children.push(currentFrame);
	fn(...args);
	currentFrame.end = performance.now();
	currentFrame.duration = currentFrame.end - currentFrame.start;
	currentFrame = parentFrame;

	if (currentFrame.type == 'top')
		topFrame.duration =
			topFrame.children[topFrame.children.length - 1].end - topFrame.children[0].start;

	profile(topFrame);
}
