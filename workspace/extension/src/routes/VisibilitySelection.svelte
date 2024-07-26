<script>
	import Button from '$lib/components/Button.svelte';
	import Relative from '$lib/components/Relative.svelte';

	import { visibility } from '$lib/state.svelte';

	let opened = $state(false);
</script>

<Relative>
	<Button onclick={() => (opened = !opened)}>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
			<path
				d="M8 2C4.36364 2 1.25818 4.28067 0 7.5 1.25818 10.71933 4.36364 13 8 13s6.74182-2.28067 8-5.5C14.74182 4.28067 11.63636 2 8 2zm0 9.16667c-2.00727 0-3.63636-1.64267-3.63636-3.66667S5.99273 3.83333 8 3.83333 11.63636 5.476 11.63636 7.5 10.00727 11.16667 8 11.16667zM8 5.3c-1.20727 0-2.18182.98267-2.18182 2.2S6.79273 9.7 8 9.7s2.18182-.98267 2.18182-2.2S9.20727 5.3 8 5.3z"
			/>
		</svg>
	</Button>

	{#if opened}
		<section>
			{#each Object.keys(visibility) as key}
				<label>
					<input type="checkbox" bind:checked={visibility[key]} />
					<span>{key}s</span>
				</label>
			{/each}
		</section>
	{/if}
</Relative>

<style>
	section {
		z-index: 9;
		position: absolute;
		top: 100%;
		left: 0;
		padding: 0.5rem 0;
		border: 1px solid rgb(224, 224, 226);
		border-radius: 0.25rem;

		transform: translate3d(0, 0.375rem, 0);
		background-color: #ffffff;
		font-size: 0.875rem;
		text-align: left;

		&::before {
			content: '';
			z-index: -1;
			position: absolute;
			top: 0;
			left: 0;
			width: 1rem;
			height: 1rem;
			background-color: inherit;
			transform: translate(50%, -30%) rotate(45deg);
		}
	}

	label {
		display: flex;
		align-items: center;
		padding: 0.25rem 0.5rem;

		& > span {
			margin-left: 0.5rem;
			text-transform: capitalize;
		}
	}
	input {
		margin: 0;
	}

	:global(.dark) {
		section {
			border: none;
			background-color: #4a4a4f;
			color: #f9f9fa;
		}
	}
</style>
