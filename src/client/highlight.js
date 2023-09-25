const dom = {
	area: document.createElement('div'),
	x: document.createElement('div'),
	y: document.createElement('div'),
};

/** @param {Pick<SvelteBlockDetail, 'type' | 'detail'>} [node] */
export function highlight(node) {
	if (!node || node.type !== 'element' || !node.detail) {
		dom.area.remove();
		dom.x.remove();
		dom.y.remove();
		return;
	}

	const { clientWidth, scrollHeight } = document.documentElement;
	const style = window.getComputedStyle(node.detail);
	const rect = node.detail.getBoundingClientRect();

	// TODO: handle sticky position
	const position = style.position === 'fixed' ? 'fixed' : 'absolute';
	const offset = style.position !== 'fixed' ? window.scrollY : 0;

	dom.area.style.setProperty('z-index', '65536');
	dom.area.style.setProperty('background-color', 'rgba(0, 136, 204, 0.2)');
	dom.area.style.setProperty('position', position);
	dom.area.style.setProperty('top', `${offset + rect.top}px`);
	dom.area.style.setProperty('left', `${rect.left}px`);
	dom.area.style.setProperty('width', `${rect.width}px`);
	dom.area.style.setProperty('height', `${rect.height}px`);

	dom.x.style.setProperty('z-index', '65536');
	dom.x.style.setProperty('border', '0px dashed rgb(0, 136, 204)');
	dom.x.style.setProperty('border-width', '1px 0px');
	dom.x.style.setProperty('position', position);
	dom.x.style.setProperty('top', `${offset + rect.top}px`);
	dom.x.style.setProperty('width', `${clientWidth}px`);
	dom.x.style.setProperty('height', `${rect.height}px`);

	dom.y.style.setProperty('z-index', '65536');
	dom.y.style.setProperty('border', '0px dashed rgb(0, 136, 204)');
	dom.y.style.setProperty('border-width', '0px 1px');
	dom.y.style.setProperty('position', 'absolute');
	dom.y.style.setProperty('left', `${rect.left}px`);
	dom.y.style.setProperty('width', `${rect.width}px`);
	dom.y.style.setProperty('height', `${scrollHeight}px`);

	document.body.appendChild(dom.area);
	document.body.appendChild(dom.x);
	document.body.appendChild(dom.y);
}
