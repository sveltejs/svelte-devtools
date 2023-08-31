const listeners = [];
export function addNodeListener(listener) {
	listeners.push(listener);
}

export function removeNodeListener(listener) {
	const index = listeners.indexOf(listener);
	if (index == -1) return false;

	listeners.splice(index, 1);
	return true;
}

export function add(node, anchorNode) {
	for (const listener of listeners) listener.add(node, anchorNode);
}

export function update(node) {
	if (!node) return;

	for (const listener of listeners) listener.update(node);
}

export function remove(node) {
	for (const listener of listeners) listener.remove(node);
}

export function profile(frame) {
	for (const listener of listeners) listener.profile(frame);
}
