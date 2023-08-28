<script>
	import Component from './Component.svelte';

	let title = 'one';
	Promise.resolve().then(() => (title = 'two'));
</script>

<div>
	<ol>
		<li>Basic tree rendering</li>
		<li>Element attributes, component properties and state</li>
		<li>Text nodes / anchors</li>
	</ol>
	<Component
		object={{ one: {}, two: 'a', three: [0, NaN], four: null, five: undefined }}
		string="value"
		number={0}
		boolean={false}
		array={[]}
	/>
	<span {title} />
</div>
