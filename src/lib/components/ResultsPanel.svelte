<script lang="ts">
	import EmptyState from './EmptyState.svelte';
	import PasswordRow from './PasswordRow.svelte';

	interface Props {
		passwords: string[];
		isGenerating: boolean;
		errorMessage: string | null;
		lastCopiedIndex: number | null;
		onCopy: (index: number) => void;
	}

	let { passwords, isGenerating, errorMessage, lastCopiedIndex, onCopy }: Props = $props();
</script>

{#if errorMessage}
	<div class="mt-[2px] px-3 py-[10px] bg-red-dim border border-[rgba(229,72,77,0.22)] rounded-[9px] text-[12.5px] text-red leading-[1.4]">{errorMessage}</div>
{:else if isGenerating || passwords.length === 0}
	<EmptyState />
{:else}
	<ul class="list-none flex flex-col">
		{#each passwords as password, index}
			<PasswordRow
				{index}
				{password}
				isLastCopied={lastCopiedIndex === index}
				{onCopy}
			/>
		{/each}
	</ul>
{/if}
