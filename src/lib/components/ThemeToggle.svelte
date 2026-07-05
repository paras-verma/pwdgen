<script lang="ts">
	import { themeStore, type Theme } from '$lib/stores/themeStore.svelte';

	const themes: Theme[] = ['light', 'system', 'dark'];
</script>

<div class="flex items-center bg-surface-alt border border-border rounded-full p-[3px]" role="group" aria-label="Color theme">
	{#each themes as option}
		<button
			class="font-mono text-[11px] font-medium tracking-[0.03em] px-[13px] py-[5px] border-none rounded-full cursor-pointer transition-[background,color,box-shadow] duration-150 whitespace-nowrap max-[680px]:px-[10px] max-[680px]:text-[10.5px] {themeStore.value === option ? 'bg-surface text-ink shadow-[var(--shadow-btn)]' : 'bg-transparent text-muted hover:text-ink-2'}"
			onclick={() => themeStore.set(option)}
		>
			{option.charAt(0).toUpperCase() + option.slice(1)}
		</button>
	{/each}
</div>
