const dom = {
	area: document.createElement('div'),
	x: document.createElement('div'),
	y: document.createElement('div'),
};

Object.assign(dom.area.style, {
	position: 'fixed',
	backgroundColor: 'rgba(0, 136, 204, 0.2)',
	zIndex: '2147483647',
	pointerEvents: 'none',
});

Object.assign(dom.x.style, {
	position: 'fixed',
	borderStyle: 'dashed',
	borderColor: 'rgb(0, 136, 204)',
	borderWidth: '1px 0',
	zIndex: '2147483647',
	left: '0',
	width: '100vw',
	pointerEvents: 'none',
});

Object.assign(dom.y.style, {
	position: 'fixed',
	borderStyle: 'dashed',
	borderColor: 'rgb(0, 136, 204)',
	borderWidth: '0 1px',
	zIndex: '2147483647',
	top: '0',
	height: '100vh',
	pointerEvents: 'none',
});

function getOffset(element) {
	const styles = getComputedStyle(element);
	const margin = {
		top: Math.max(parseInt(styles.marginTop), 0),
		right: Math.max(parseInt(styles.marginRight), 0),
		bottom: Math.max(parseInt(styles.marginBottom), 0),
		left: Math.max(parseInt(styles.marginLeft), 0),
	};

	const rect = {
		width: element.offsetWidth + margin.right + margin.left,
		height: element.offsetHeight + margin.top + margin.bottom,
		top: element.offsetTop - margin.top,
		left: element.offsetLeft - margin.left,
	};

	let parent = element;
	while ((parent = parent.offsetParent || parent.ownerDocument.defaultView.frameElement)) {
		rect.top += parent.offsetTop;
		rect.left += parent.offsetLeft;
	}

	parent = element;
	while ((parent = parent.parentElement || parent.ownerDocument.defaultView.frameElement)) {
		rect.top -= parent.scrollTop;
		rect.left -= parent.scrollLeft;
	}

	rect.right = rect.left + rect.width;
	rect.bottom = rect.top + rect.height;

	return rect;
}

function getBoundingRect(node) {
	if (node.type == 'element') return getOffset(node.detail);

	const union = {
		top: Infinity,
		left: Infinity,
		bottom: -Infinity,
		right: -Infinity,
	};

	for (const child of node.children) {
		const rect = getBoundingRect(child);
		if (rect.top < union.top) union.top = rect.top;
		if (rect.left < union.left) union.left = rect.left;
		if (rect.bottom > union.bottom) union.bottom = rect.bottom;
		if (rect.right > union.right) union.right = rect.right;
	}

	union.width = union.right - union.left;
	union.height = union.bottom - union.top;

	return union;
}

export function highlight(node) {
	if (!node) {
		dom.area.remove();
		dom.x.remove();
		dom.y.remove();
		return;
	}

	const box = getBoundingRect(node);
	Object.assign(dom.area.style, {
		top: box.top + 'px',
		left: box.left + 'px',
		width: box.width + 'px',
		height: box.height + 'px',
	});
	document.body.append(dom.area);

	Object.assign(dom.x.style, {
		top: box.top + 'px',
		height: box.height - 2 + 'px',
	});
	document.body.append(dom.x);

	Object.assign(dom.y.style, {
		left: box.left + 'px',
		width: box.width - 2 + 'px',
	});
	document.body.append(dom.y);
}

let target = null;
function handleMousemove(e) {
	target = e.target;
	highlight({ type: 'element', detail: target });
}

function handleClick() {
	stopPicker();
	window.__svelte_devtools_select_element(target);
}

export function stopPicker() {
	document.removeEventListener('mousemove', handleMousemove, true);
	highlight(null);
}

export function startPicker() {
	document.addEventListener('mousemove', handleMousemove, true);
	document.addEventListener('click', handleClick, {
		capture: true,
		once: true,
	});
}
