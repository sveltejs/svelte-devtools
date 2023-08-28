<script>
	export let string;
	export let number;
	export let array;
	export let object;
	export let boolean;

	let value = 0;
	Promise.resolve().then(() => (value = 1), 0);
</script>

<div>
	A component with string, number, array, and object attributes. The value is
	{value}
</div>
