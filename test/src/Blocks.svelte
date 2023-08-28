<script>
	let valueList = ['a', 'b', 'c'];

	let value = 0;
	Promise.resolve().then(() => (value = 1), 0);

	let promise = new Promise((resolve, reject) => setTimeout(() => resolve(5), 2000));
</script>

<div>
	<p>Renders &lbrace;#each&rbrace; and &lbrace;#if&rbrace; blocks with original source line</p>

	{#each valueList as value}<span>{value}</span>{/each}

	<div>
		{#if value > 10}
			Value is over 10
		{:else if value > 5}Value is over 5{:else}Value is under 5{/if}
	</div>

	<div>
		{#await promise}
			waiting for the promise to resolve...
		{:then value}
			Promise resolved to
			{value}
		{:catch error}
			Something went wrong
			{error.message}
		{/await}
	</div>
	<div>
		{#await new Promise(() => {})}
			Pending forever
		{:then value}
			Something went wrong
			{value}
		{:catch error}
			Something went wrong
			{error.message}
		{/await}
	</div>

	<div>
		{#await Promise.resolve(5)}
			Something went wrong
		{:then value}
			Promise resolved to
			{value}
		{:catch error}
			Something went wrong
			{error.message}
		{/await}
	</div>
	<div>
		{#await Promise.reject('rejected')}
			Something went wrong
		{:then value}
			Something went wrong
			{value}
		{:catch error}
			Should reject
			{error}
		{/await}
	</div>
</div>
