<script lang="ts">
	interface Props {
		index: number;
		password: string;
		isLastCopied: boolean;
		onCopy: (index: number) => void;
	}

	const VISIBLE_PREFIX_LENGTH = 4;

	let { index, password, isLastCopied, onCopy }: Props = $props();

	let revealed = $state(false);
	let copied = $state(false);

	const prefix = $derived(password.slice(0, VISIBLE_PREFIX_LENGTH));
	const dots = $derived('•'.repeat(Math.max(0, password.length - VISIBLE_PREFIX_LENGTH)));

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(password);
			copied = true;
			onCopy(index);
			setTimeout(() => {
				copied = false;
			}, 1800);
		} catch {
			// clipboard denied in non-secure context
		}
	}

	function toggleReveal() {
		revealed = !revealed;
	}
</script>

<li
	class="flex items-center gap-[9px] py-[10px] border-b border-b-border-soft transition-[background] duration-100 first:pt-[2px] last:border-b-0 last:pb-[2px] {isLastCopied ? 'bg-accent-dim rounded-[6px] px-[6px] mx-[-6px]' : ''}"
>
	<span class="font-mono text-[10.5px] text-muted min-w-[18px] text-right shrink-0 tabular-nums select-none">{String(index + 1).padStart(2, '0')}</span>

	<div class="flex-1 min-w-0 font-mono text-[13px] overflow-hidden whitespace-nowrap">
		{#if revealed}
			<span class="text-ink">{password}</span>
		{:else}
			<span class="text-ink">{prefix}</span><span class="text-muted tracking-[0.07em]">{dots}</span>
		{/if}
	</div>

	<div class="flex gap-[2px] shrink-0">
		<button
			class="w-7 h-7 flex items-center justify-center bg-none border-none rounded-[7px] cursor-pointer transition-[color,background] duration-[120ms] hover:bg-border-soft focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[1px] {revealed ? 'text-accent' : 'text-muted hover:text-ink-2'}"
			title="Show / hide"
			aria-pressed={revealed}
			onclick={toggleReveal}
		>
			{#if revealed}
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
			{:else}
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
			{/if}
		</button>

		<button
			class="w-7 h-7 flex items-center justify-center bg-none border-none rounded-[7px] cursor-pointer transition-[color,background] duration-[120ms] hover:bg-border-soft focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[1px] {copied ? 'text-green' : 'text-muted hover:text-ink-2'}"
			title="Copy to clipboard"
			onclick={handleCopy}
		>
			{#if copied}
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
			{:else}
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
			{/if}
		</button>
	</div>
</li>
