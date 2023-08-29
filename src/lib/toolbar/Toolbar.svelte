<nav>
	<slot />
</nav>

<style>
	nav {
		display: flex;
		align-items: stretch;
		padding: 0 0.5rem;
		border-bottom: 1px solid rgb(224, 224, 226);
		background-color: rgb(249, 249, 250);
	}

	:global(.dark) nav {
		border-bottom-color: rgb(60, 60, 61);
		background-color: rgb(36, 36, 36);
	}
</style>
