<script>
	import { background } from '$lib/runtime.svelte';
</script>

<main>
	<h1 style:font-size="3rem">Svelte DevTools</h1>
	<p style:display="inline-flex" style:font-size="1.25rem">
		<span>No Svelte app detected</span>

		<button onclick={() => background.send('bypass::ext/page->refresh')}>reload</button>
	</p>

	<footer>
		<p style:font-size="1rem">Not working? Did you...</p>
		<ul>
			<li>Build with dev mode enabled?</li>
			<li>Use Svelte version ^4.0.0?</li>
		</ul>
	</footer>
</main>

<style>
	main {
		width: 100%;
		display: grid;
		gap: 1rem;
		justify-items: center;
		align-content: center;
		justify-content: center;

		* {
			margin: 0;
		}
	}

	button {
		cursor: pointer;
		margin-left: 1rem;
		border-radius: 0.2rem;
		outline: 2px solid transparent;
		color: #040d14;
		font-family: monospace;
		transition-duration: var(--t-duration);

		&:hover {
			outline-color: rgba(208, 212, 215, 0.8);
		}
	}

	footer {
		width: 100%;
		display: grid;
		gap: 0.75rem;
		padding-top: 3rem;

		ul {
			padding-left: 1.5rem;
			list-style-type: disc;
			font-size: 0.875rem;

			li:not(:first-child) {
				margin-top: 0.5rem;
			}
		}
	}
</style>
