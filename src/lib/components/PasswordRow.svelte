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

<li class="pw-row" class:last-copied={isLastCopied}>
	<span class="pw-num">{String(index + 1).padStart(2, '0')}</span>

	<div class="pw-value-wrap">
		{#if revealed}
			<span class="pw-full">{password}</span>
		{:else}
			<span class="pw-prefix">{prefix}</span><span class="pw-dots">{dots}</span>
		{/if}
	</div>

	<div class="pw-actions">
		<button
			class="icon-btn"
			class:active={revealed}
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
			class="icon-btn"
			class:copied
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

<style>
	.pw-row {
		display: flex;
		align-items: center;
		gap: 9px;
		padding: 10px 0;
		border-bottom: 1px solid var(--border-soft);
		transition: background 0.1s;
	}

	.pw-row:first-child {
		padding-top: 2px;
	}

	.pw-row:last-child {
		border-bottom: none;
		padding-bottom: 2px;
	}

	.pw-row.last-copied {
		background: var(--accent-dim);
		border-radius: 6px;
		padding-inline: 6px;
		margin-inline: -6px;
	}

	.pw-num {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 10.5px;
		color: var(--muted);
		min-width: 18px;
		text-align: right;
		flex-shrink: 0;
		font-variant-numeric: tabular-nums;
		user-select: none;
	}

	.pw-value-wrap {
		flex: 1;
		min-width: 0;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 13px;
		overflow: hidden;
		white-space: nowrap;
	}

	.pw-prefix {
		color: var(--ink);
	}

	.pw-dots {
		color: var(--muted);
		letter-spacing: 0.07em;
	}

	.pw-full {
		color: var(--ink);
	}

	.pw-actions {
		display: flex;
		gap: 2px;
		flex-shrink: 0;
	}

	.icon-btn {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		border-radius: 7px;
		color: var(--muted);
		cursor: pointer;
		transition:
			color 0.12s,
			background 0.12s;
	}

	.icon-btn:hover {
		color: var(--ink-2);
		background: var(--border-soft);
	}

	.icon-btn.active {
		color: var(--accent);
	}

	.icon-btn.copied {
		color: var(--green);
	}

	.icon-btn:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 1px;
	}
</style>
