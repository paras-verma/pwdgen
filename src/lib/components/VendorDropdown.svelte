<script lang="ts">
	import { configStore } from '$lib/stores/configStore.svelte';
	import DeleteVendorModal from './DeleteVendorModal.svelte';

	interface Props {
		configKey: CryptoKey | null;
	}

	let { configKey }: Props = $props();

	let inputValue = $state(configStore.selectedVendorName ?? '');
	let dropdownOpen = $state(false);
	let vendorPendingDelete = $state<string | null>(null);

	const filteredVendors = $derived(
		inputValue.trim().length === 0
			? configStore.vendors
			: configStore.vendors.filter((v) =>
					v.name.toLowerCase().includes(inputValue.toLowerCase())
				)
	);

	const isNewVendorName = $derived(
		inputValue.trim().length > 0 &&
		!configStore.vendors.some((v) => v.name === inputValue.trim())
	);

	$effect(() => {
		inputValue = configStore.selectedVendorName ?? '';
	});

	function handleSelect(name: string) {
		configStore.selectVendor(name);
		inputValue = name;
		dropdownOpen = false;
	}

	async function handleAddNew() {
		const trimmed = inputValue.trim();
		if (!trimmed) return;
		if (configKey) {
			await configStore.addVendor(trimmed, configKey);
		}
		configStore.selectVendor(trimmed);
		dropdownOpen = false;
	}

	function handleBlur() {
		setTimeout(() => {
			dropdownOpen = false;
		}, 150);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			if (isNewVendorName) {
				handleAddNew();
			} else if (filteredVendors.length === 1) {
				handleSelect(filteredVendors[0].name);
			}
		}
		if (e.key === 'Escape') {
			dropdownOpen = false;
		}
	}

	async function confirmDelete() {
		if (!vendorPendingDelete) return;
		await configStore.removeVendor(vendorPendingDelete);
		vendorPendingDelete = null;
	}

	export function currentVendorName(): string {
		return inputValue.trim();
	}
</script>

<div class="vendor-section">
	<label class="vendor-label" for="vendorInput">Vendor</label>
	<div class="vendor-row">
		<div class="combobox">
			<input
				id="vendorInput"
				type="text"
				class="vendor-input"
				placeholder="e.g. github"
				autocomplete="off"
				spellcheck="false"
				bind:value={inputValue}
				onfocus={() => (dropdownOpen = true)}
				onblur={handleBlur}
				onkeydown={handleKeydown}
				oninput={() => (dropdownOpen = true)}
			/>

			{#if dropdownOpen && (filteredVendors.length > 0 || isNewVendorName)}
				<div class="dropdown" role="listbox">
					{#each filteredVendors as vendor}
						<button
							type="button"
							class="dropdown-item"
							class:locked={vendor.locked}
							role="option"
							aria-selected={vendor.name === configStore.selectedVendorName}
							onmousedown={() => handleSelect(vendor.name)}
						>
							<span class="item-name">{vendor.name}</span>
							{#if vendor.locked}
								<svg class="lock-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
							{/if}
						</button>
					{/each}

					{#if isNewVendorName}
						<button
							type="button"
							class="dropdown-item add-new"
							role="option"
							aria-selected={false}
							onmousedown={handleAddNew}
						>
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
							Add "{inputValue.trim()}"
						</button>
					{/if}
				</div>
			{/if}
		</div>

		{#if configStore.selectedVendorName}
			<button
				type="button"
				class="delete-btn"
				title="Delete vendor"
				onclick={() => (vendorPendingDelete = configStore.selectedVendorName)}
			>
				<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
			</button>
		{/if}
	</div>

	{#if configStore.selectedVendor?.locked}
		<p class="locked-hint" title="This vendor was saved with a different passphrase">
			<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
			Saved with a different passphrase
		</p>
	{/if}
</div>

{#if vendorPendingDelete}
	<DeleteVendorModal
		vendorName={vendorPendingDelete}
		onConfirm={confirmDelete}
		onCancel={() => (vendorPendingDelete = null)}
	/>
{/if}

<style>
	.vendor-section {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.vendor-label {
		display: block;
		font-size: 12px;
		font-weight: 700;
		color: var(--ink-2);
	}

	.vendor-row {
		display: flex;
		gap: 6px;
		align-items: flex-start;
	}

	.combobox {
		position: relative;
		flex: 1;
	}

	.vendor-input {
		width: 100%;
		font-family: 'Manrope', system-ui, sans-serif;
		font-size: 14.5px;
		font-weight: 500;
		color: var(--ink);
		background: var(--surface);
		border: 1.5px solid var(--border);
		border-radius: 10px;
		padding: 10px 13px;
		outline: none;
		transition:
			border-color 0.15s,
			box-shadow 0.15s;
		-webkit-appearance: none;
		appearance: none;
	}

	.vendor-input::placeholder {
		color: var(--muted);
		font-weight: 400;
	}

	.vendor-input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-dim);
	}

	.dropdown {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		background: var(--surface);
		border: 1.5px solid var(--border);
		border-radius: 10px;
		box-shadow: var(--shadow-card);
		z-index: 50;
		overflow: hidden;
		max-height: 220px;
		overflow-y: auto;
	}

	.dropdown-item {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 9px 13px;
		background: none;
		border: none;
		font-family: 'Manrope', system-ui, sans-serif;
		font-size: 13.5px;
		font-weight: 500;
		color: var(--ink);
		cursor: pointer;
		text-align: left;
		transition: background 0.1s;
	}

	.dropdown-item:hover,
	.dropdown-item[aria-selected='true'] {
		background: var(--accent-dim);
	}

	.dropdown-item.locked {
		color: var(--muted);
	}

	.dropdown-item.add-new {
		color: var(--accent);
		gap: 7px;
		font-weight: 600;
		border-top: 1px solid var(--border-soft);
	}

	.item-name {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.lock-icon {
		flex-shrink: 0;
		color: var(--muted);
	}

	.delete-btn {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: 1.5px solid var(--border);
		border-radius: 10px;
		color: var(--muted);
		cursor: pointer;
		flex-shrink: 0;
		transition:
			color 0.12s,
			border-color 0.12s,
			background 0.12s;
	}

	.delete-btn:hover {
		color: var(--red);
		border-color: var(--red);
	}

	.locked-hint {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 11.5px;
		color: var(--muted);
		font-style: italic;
	}
</style>
