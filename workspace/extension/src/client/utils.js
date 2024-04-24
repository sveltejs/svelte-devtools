/**
 * @param {unknown} value
 * @returns {any}
 */
function clone(value, seen = new Map()) {
	switch (typeof value) {
		case 'function':
			return { __is: 'function', source: value.toString(), name: value.name };
		case 'symbol':
			return { __is: 'symbol', name: value.toString() };
		case 'object': {
			if (value === window || value === null) return null;
			if (Array.isArray(value)) {
				return value.map((o, i) => ({ key: i, value: clone(o, seen) }));
			}
			if (seen.has(value)) return {};

			/** @type {Record<string, any>} */
			const o = {};
			seen.set(value, o);
			for (const [key, v] of Object.entries(value)) {
				const readonly = Object.getOwnPropertyDescriptor(value, key)?.get !== undefined;
				o[key] = { key, value: clone(v, seen), readonly };
			}
			return o;
		}
		default:
			return value;
	}
}

/** @param {SvelteBlockDetail} node  */
export function serialize(node) {
	const res = /** @type {SvelteBlockDetail} */ ({
		id: node.id,
		type: node.type,
		tagName: node.tagName,
		detail: {},
	});
	switch (node.type) {
		case 'component': {
			const { $$: internal = {} } = node.detail;
			const captured = node.detail.$capture_state?.() || {};
			const bindings = Object.values(internal.bound || {}).map(
				/** @param {Function} f */ (f) => f.name,
			);
			const props = Object.keys(internal.props || {}).flatMap((key) => {
				const value = clone(captured[key]);
				delete captured[key]; // deduplicate for ctx
				if (value === undefined) return [];

				const bounded = bindings.some((f) => f.includes(key));
				return { key, value, bounded };
			});

			res.detail = {
				attributes: props,
				listeners: Object.entries(internal.callbacks || {}).flatMap(([event, value]) =>
					value.map(/** @param {Function} f */ (f) => ({ event, handler: f.toString() })),
				),
				ctx: Object.entries(clone(captured)).map(([key, value]) => ({ key, value })),
			};
			break;
		}

		case 'element': {
			/** @type {Attr[]} from {NamedNodeMap} */
			const attributes = Array.from(node.detail.attributes || []);

			/** @type {NonNullable<SvelteListenerDetail['node']['__listeners']>} */
			const listeners = node.detail.__listeners || [];

			res.detail = {
				attributes: attributes.map(({ name: key, value }) => ({ key, value, readonly: true })),
				listeners: listeners.map((o) => ({ ...o, handler: o.handler.toString() })),
			};
			break;
		}

		case 'text': {
			res.detail = {
				nodeValue: node.detail.nodeValue,
			};
			break;
		}

		case 'iteration':
		case 'block': {
			const { ctx, source } = node.detail;
			const cloned = Object.entries(clone(ctx));
			res.detail = {
				ctx: cloned.map(([key, value]) => ({ key, value, readonly: true })),
				source: source.slice(source.indexOf('{'), source.indexOf('}') + 1),
			};
			break;
		}
	}

	return res;
}
