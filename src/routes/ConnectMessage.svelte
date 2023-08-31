<script>
	import { reload } from '$lib/runtime';
</script>

<div>
	<h1 style:font-size="4rem">Svelte DevTools</h1>
	<p style:display="inline-flex" style:font-size="1.75rem">
		<span>No Svelte app detected</span>

		<button style:margin-left="1rem" on:click={reload}>reload</button>
	</p>

	<footer>
		<p style:font-size="1.5rem">Not working? Did you...</p>
		<ul>
			<li>Use Svelte version 4.0.0 or above?</li>
			<li>Build with dev mode enabled?</li>
		</ul>
	</footer>
</div>

<style>
	div {
		width: 100%;
		display: grid;
		gap: 1rem;
		justify-items: center;
		align-content: center;
		justify-content: center;
	}
	div * {
		margin: 0;
	}

	button {
		cursor: pointer;
		border-radius: 0.2rem;
		outline: 2px solid transparent;
		color: #040d14;
		font-family: monospace;
		transition-duration: var(--t-duration);
	}
	button:hover {
		outline-color: rgba(208, 212, 215, 0.8);
	}

	footer {
		width: 100%;
		display: grid;
		gap: 0.75rem;
		padding-top: 3rem;
	}
	ul {
		padding-left: 1.5rem;
		list-style-type: disc;
		font-size: 1.25rem;
	}
	li:not(:first-child) {
		margin-top: 0.5rem;
	}
</style>
