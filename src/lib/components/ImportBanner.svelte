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

<div class="flex items-center justify-between gap-3 px-7 py-3 bg-accent-dim border-b border-b-border flex-wrap" role="alert">
	<div class="flex items-center gap-[10px]">
		<svg class="text-accent shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
		<div class="flex flex-col gap-[1px]">
			<span class="text-[13px] font-bold text-ink">Config found in URL</span>
			<span class="text-xs text-muted">Replace your saved config with the imported one?</span>
		</div>
	</div>
	<div class="flex items-center gap-2">
		{#if importError}
			<span class="text-xs text-red">{importError}</span>
		{/if}
		<button
			type="button"
			class="font-sans text-[13px] font-semibold text-muted bg-none border-[1.5px] border-border rounded-lg px-[14px] py-[6px] cursor-pointer transition-[color,border-color] duration-[120ms] hover:text-ink hover:border-ink-2"
			onclick={handleDismiss}
		>Dismiss</button>
		<button
			type="button"
			class="font-sans text-[13px] font-bold text-white bg-accent border-none rounded-lg px-[14px] py-[6px] cursor-pointer transition-[background,opacity] duration-[120ms] hover:not-disabled:bg-accent-hi disabled:opacity-60 disabled:cursor-default"
			disabled={importing}
			onclick={handleImport}
		>
			{importing ? 'Importing…' : 'Import'}
		</button>
	</div>
</div>
