<script lang="ts">
	import { configStore } from '$lib/stores/configStore.svelte';
	import { passphraseStore } from '$lib/stores/passphraseStore.svelte';

	let expanded = $state(false);

	const activeVendor = $derived(
		configStore.selectedVendor && !configStore.selectedVendor.locked
			? configStore.selectedVendor
			: null
	);

	async function updateSetting(field: 'length' | 'count' | 'disallowedChars' | 'version', value: string | number) {
		if (!activeVendor || !passphraseStore.configKey) return;
		await configStore.updateVendorSettings(
			activeVendor.name,
			{ [field]: value },
			passphraseStore.configKey
		);
	}
</script>

<div class="mt-3">
	<button
		type="button"
		class="inline-flex items-center gap-[7px] bg-none border-none p-0 cursor-pointer font-mono text-[11.5px] font-medium text-accent tracking-[0.02em] focus-visible:outline-2 focus-visible:outline-accent focus-visible:rounded"
		onclick={() => (expanded = !expanded)}
	>
		<svg
			class="inline-block transition-transform duration-200 {expanded ? 'rotate-90' : ''}"
			width="10"
			height="10"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
		>
			<polyline points="9 18 15 12 9 6" />
		</svg>
		Advanced options
	</button>

	{#if expanded}
		<div class="mt-[14px] p-4 bg-surface border border-border-soft rounded-[10px] flex flex-col gap-3">
			<div class="grid grid-cols-2 gap-3">
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-bold text-ink-2" for="passwordLength">Length</label>
					<input
						id="passwordLength"
						type="number"
						min="8"
						max="22"
						value={activeVendor?.length ?? 16}
						disabled={!activeVendor}
						class="w-full font-sans text-[14px] font-medium text-ink bg-surface border-[1.5px] border-border rounded-[9px] px-3 py-[9px] outline-none appearance-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-dim)] disabled:opacity-50 disabled:cursor-not-allowed"
						onchange={(e) => updateSetting('length', parseInt((e.target as HTMLInputElement).value, 10))}
					/>
				</div>
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-bold text-ink-2" for="passwordCount">Count</label>
					<input
						id="passwordCount"
						type="number"
						min="1"
						max="20"
						value={activeVendor?.count ?? 5}
						disabled={!activeVendor}
						class="w-full font-sans text-[14px] font-medium text-ink bg-surface border-[1.5px] border-border rounded-[9px] px-3 py-[9px] outline-none appearance-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-dim)] disabled:opacity-50 disabled:cursor-not-allowed"
						onchange={(e) => updateSetting('count', parseInt((e.target as HTMLInputElement).value, 10))}
					/>
				</div>
			</div>

			<div class="flex flex-col gap-1.5">
				<label class="text-xs font-bold text-ink-2" for="disallowedChars">Exclude characters</label>
				<input
					id="disallowedChars"
					type="text"
					placeholder="Characters to exclude"
					autocomplete="off"
					spellcheck="false"
					value={activeVendor?.disallowedChars ?? ''}
					disabled={!activeVendor}
					class="w-full font-sans text-[14px] font-medium text-ink bg-surface border-[1.5px] border-border rounded-[9px] px-3 py-[9px] outline-none appearance-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted placeholder:font-normal focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-dim)] disabled:opacity-50 disabled:cursor-not-allowed"
					oninput={(e) => updateSetting('disallowedChars', (e.target as HTMLInputElement).value)}
				/>
			</div>

			<div class="flex flex-col gap-1.5">
				<label class="text-xs font-bold text-ink-2" for="algorithmVersion">Algorithm</label>
				<select
					id="algorithmVersion"
					disabled={!activeVendor}
					value={activeVendor?.version ?? 'v1'}
					class="w-full font-sans text-[14px] font-medium text-ink bg-surface border-[1.5px] border-border rounded-[9px] px-3 py-[9px] outline-none appearance-none transition-[border-color,box-shadow] duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
					onchange={(e) => updateSetting('version', (e.target as HTMLSelectElement).value)}
				>
					<option value="v1">v1 — bash-compatible</option>
					<option value="v2">v2 — custom alphabet</option>
				</select>
			</div>
		</div>
	{/if}
</div>
