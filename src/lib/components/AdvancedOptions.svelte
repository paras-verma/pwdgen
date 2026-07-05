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

<div class="advanced-section">
	<button
		type="button"
		class="advanced-toggle"
		class:open={expanded}
		onclick={() => (expanded = !expanded)}
	>
		<svg
			class="chev"
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
		<div class="advanced-body">
			<div class="adv-grid">
				<div class="field">
					<label for="passwordLength">Length</label>
					<input
						id="passwordLength"
						type="number"
						min="8"
						max="22"
						value={activeVendor?.length ?? 16}
						disabled={!activeVendor}
						onchange={(e) => updateSetting('length', parseInt((e.target as HTMLInputElement).value, 10))}
					/>
				</div>
				<div class="field">
					<label for="passwordCount">Count</label>
					<input
						id="passwordCount"
						type="number"
						min="1"
						max="20"
						value={activeVendor?.count ?? 5}
						disabled={!activeVendor}
						onchange={(e) => updateSetting('count', parseInt((e.target as HTMLInputElement).value, 10))}
					/>
				</div>
			</div>

			<div class="field">
				<label for="disallowedChars">Exclude characters</label>
				<input
					id="disallowedChars"
					type="text"
					placeholder="Characters to exclude"
					autocomplete="off"
					spellcheck="false"
					value={activeVendor?.disallowedChars ?? ''}
					disabled={!activeVendor}
					oninput={(e) => updateSetting('disallowedChars', (e.target as HTMLInputElement).value)}
				/>
			</div>

			<div class="field">
				<label for="algorithmVersion">Algorithm</label>
				<select
					id="algorithmVersion"
					disabled={!activeVendor}
					value={activeVendor?.version ?? 'v1'}
					onchange={(e) => updateSetting('version', (e.target as HTMLSelectElement).value)}
				>
					<option value="v1">v1 — bash-compatible</option>
					<option value="v2">v2 — custom alphabet</option>
				</select>
			</div>
		</div>
	{/if}
</div>

<style>
	.advanced-section {
		margin-top: 12px;
	}

	.advanced-toggle {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11.5px;
		font-weight: 500;
		color: var(--accent);
		letter-spacing: 0.02em;
	}

	.chev {
		display: inline-block;
		transition: transform 0.2s;
	}

	.advanced-toggle.open .chev {
		transform: rotate(90deg);
	}

	.advanced-toggle:focus-visible {
		outline: 2px solid var(--accent);
		border-radius: 4px;
	}

	.advanced-body {
		margin-top: 14px;
		padding: 16px;
		background: var(--surface);
		border: 1px solid var(--border-soft);
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.adv-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	label {
		font-size: 12px;
		font-weight: 700;
		color: var(--ink-2);
	}

	select,
	input[type='text'],
	input[type='number'] {
		width: 100%;
		font-family: 'Manrope', system-ui, sans-serif;
		font-size: 14px;
		font-weight: 500;
		color: var(--ink);
		background: var(--surface);
		border: 1.5px solid var(--border);
		border-radius: 9px;
		padding: 9px 12px;
		outline: none;
		transition:
			border-color 0.15s,
			box-shadow 0.15s;
		-webkit-appearance: none;
		appearance: none;
	}

	input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-dim);
	}

	input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

</style>
