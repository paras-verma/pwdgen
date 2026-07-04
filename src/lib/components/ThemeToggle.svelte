<script lang="ts">
	import { themeStore, type Theme } from '$lib/stores/themeStore.svelte';

	const themes: Theme[] = ['light', 'system', 'dark'];
</script>

<div class="theme-toggle" role="group" aria-label="Color theme">
	{#each themes as option}
		<button
			class="theme-btn"
			class:active={themeStore.value === option}
			onclick={() => themeStore.set(option)}
		>
			{option.charAt(0).toUpperCase() + option.slice(1)}
		</button>
	{/each}
</div>

<style>
	.theme-toggle {
		display: flex;
		align-items: center;
		background: var(--surface-alt);
		border: 1px solid var(--border);
		border-radius: 999px;
		padding: 3px;
	}

	.theme-btn {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.03em;
		padding: 5px 13px;
		border: none;
		border-radius: 999px;
		background: transparent;
		color: var(--muted);
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s,
			box-shadow 0.15s;
		white-space: nowrap;
	}

	.theme-btn:hover:not(.active) {
		color: var(--ink-2);
	}

	.theme-btn.active {
		background: var(--surface);
		color: var(--ink);
		box-shadow: var(--shadow-btn);
	}

	@media (max-width: 680px) {
		.theme-btn {
			padding: 5px 10px;
			font-size: 10.5px;
		}
	}
</style>
