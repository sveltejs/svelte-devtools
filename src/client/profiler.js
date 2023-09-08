// import { listeners } from './listener.js';

let main = {
	type: 'top',
	start: -1,
	end: -1,
	children: /** @type {any[]} */ ([]),
};
let current = main;

export const profiler = {
	enabled: false,

	start() {
		main = {
			type: 'top',
			start: performance.now(),
			end: -1,
			children: [],
		};
		current = main;
		this.enabled = true;
	},

	stop() {
		main.end = performance.now();
		this.enabled = false;
	},

	clear() {
		main.children = [];
		main.start = performance.now();
	},

	// update(node, type, fn, ...args) {
	// 	if (!this.enabled) return fn(...args);

	// 	const parentFrame = current;
	// 	current = {
	// 		type,
	// 		node: node.id,
	// 		start: performance.now(),
	// 		children: [],
	// 	};
	// 	parentFrame.children.push(current);
	// 	fn(...args);
	// 	current.end = performance.now();
	// 	current.duration = current.end - current.start;
	// 	current = parentFrame;

	// 	if (current.type === 'top') {
	// 		main.duration = main.children[main.children.length - 1].end - main.children[0].start;
	// 	}

	// 	listeners.profile(main);
	// },
};
