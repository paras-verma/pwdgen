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
	<div class="error-box">{errorMessage}</div>
{:else if isGenerating || passwords.length === 0}
	<EmptyState />
{:else}
	<ul class="pw-list">
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

<style>
	.pw-list {
		list-style: none;
		display: flex;
		flex-direction: column;
	}

	.error-box {
		margin-top: 2px;
		padding: 10px 12px;
		background: var(--red-dim);
		border: 1px solid rgba(229, 72, 77, 0.22);
		border-radius: 9px;
		font-size: 12.5px;
		color: var(--red);
		line-height: 1.4;
	}
</style>
