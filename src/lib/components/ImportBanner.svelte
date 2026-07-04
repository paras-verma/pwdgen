<script lang="ts">
	import { importEncodedConfig, clearShareFragment } from '$lib/crypto/configShare';

	interface Props {
		encoded: string;
		onImported: () => void;
		onDismiss: () => void;
	}
	let { encoded, onImported, onDismiss }: Props = $props();

	let importing = $state(false);
	let importError = $state('');

	async function handleImport() {
		importing = true;
		importError = '';
		try {
			importEncodedConfig(encoded);
			clearShareFragment();
			onImported();
		} catch (e) {
			importError = e instanceof Error ? e.message : 'Import failed';
		} finally {
			importing = false;
		}
	}

	function handleDismiss() {
		clearShareFragment();
		onDismiss();
	}
</script>

<div class="import-banner" role="alert">
	<div class="banner-content">
		<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="banner-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
		<div class="banner-text">
			<span class="banner-title">Config found in URL</span>
			<span class="banner-sub">Replace your current vendor config with the imported one?</span>
		</div>
	</div>
	<div class="banner-actions">
		{#if importError}
			<span class="banner-error">{importError}</span>
		{/if}
		<button type="button" class="dismiss-btn" onclick={handleDismiss}>Dismiss</button>
		<button type="button" class="import-btn" disabled={importing} onclick={handleImport}>
			{importing ? 'Importing…' : 'Import'}
		</button>
	</div>
</div>

<style>
	.import-banner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 28px;
		background: var(--accent-dim);
		border-bottom: 1px solid var(--border);
		flex-wrap: wrap;
	}

	.banner-content {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.banner-icon {
		color: var(--accent);
		flex-shrink: 0;
	}

	.banner-text {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.banner-title {
		font-size: 13px;
		font-weight: 700;
		color: var(--ink);
	}

	.banner-sub {
		font-size: 12px;
		color: var(--muted);
	}

	.banner-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.banner-error {
		font-size: 12px;
		color: var(--red, #dc2626);
	}

	.dismiss-btn {
		font-family: 'Manrope', system-ui, sans-serif;
		font-size: 13px;
		font-weight: 600;
		color: var(--muted);
		background: none;
		border: 1.5px solid var(--border);
		border-radius: 8px;
		padding: 6px 14px;
		cursor: pointer;
		transition: color 0.12s, border-color 0.12s;
	}

	.dismiss-btn:hover {
		color: var(--ink);
		border-color: var(--ink-2);
	}

	.import-btn {
		font-family: 'Manrope', system-ui, sans-serif;
		font-size: 13px;
		font-weight: 700;
		color: #fff;
		background: var(--accent);
		border: none;
		border-radius: 8px;
		padding: 6px 14px;
		cursor: pointer;
		transition: background 0.12s, opacity 0.12s;
	}

	.import-btn:hover:not(:disabled) {
		background: var(--accent-hi);
	}

	.import-btn:disabled {
		opacity: 0.6;
		cursor: default;
	}
</style>
