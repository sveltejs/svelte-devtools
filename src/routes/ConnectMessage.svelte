<script>
	// import { reload } from '$lib/store.js';
</script>

<div class="root">
	<p>
		<span>To connect to</span>
		<strong>Svelte</strong>
		<span>perform a hard refresh (ctrl+F5) or</span>

		<button on:click={() => {}}>click here</button>
	</p>

	<h1>Not working? Did you...</h1>
	<ul>
		<li>Use Svelte version 3.12.0 or above?</li>
		<li>Build with dev mode enabled?</li>
	</ul>
</div>

<style>
	.root {
		position: absolute;
		top: 40%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	button {
		color: blue;
		cursor: pointer;
	}

	button:hover {
		opacity: 0.6;
	}

	h1 {
		margin-top: 2.5rem;
		margin-bottom: 0.5rem;
		font-size: 1.4rem;
	}

	ul {
		padding-left: 1.5rem;
		list-style-type: disc;
	}

	li {
		margin-bottom: 0.5rem;
	}

	:global(.dark) button {
		color: rgb(117, 191, 255);
	}
</style>
