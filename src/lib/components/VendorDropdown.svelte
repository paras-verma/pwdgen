<script lang="ts">
	import { configStore } from '$lib/stores/configStore.svelte';
	import { passphraseStore } from '$lib/stores/passphraseStore.svelte';
	import DeleteVendorModal from './DeleteVendorModal.svelte';

	let addingNew = $state(false);
	let newVendorName = $state('');
	let vendorPendingDelete = $state<string | null>(null);

	async function submitNewVendor() {
		const trimmed = newVendorName.trim();
		if (!trimmed || !passphraseStore.configKey) return;
		await configStore.addVendor(trimmed, passphraseStore.configKey);
		newVendorName = '';
		addingNew = false;
	}

	function cancelNew() {
		newVendorName = '';
		addingNew = false;
	}

	async function confirmDelete() {
		if (!vendorPendingDelete) return;
		await configStore.removeVendor(vendorPendingDelete);
		vendorPendingDelete = null;
	}
</script>

<div class="vendor-section">
	<label class="vendor-label" for="vendorSelect">Vendor</label>

	{#if addingNew}
		<div class="new-vendor-row">
			<input
				id="vendorSelect"
				type="text"
				class="vendor-input"
				placeholder="e.g. github"
				autocomplete="off"
				spellcheck="false"
				bind:value={newVendorName}
				onkeydown={(e) => {
					if (e.key === 'Enter') submitNewVendor();
					if (e.key === 'Escape') cancelNew();
				}}
			/>
			<button type="button" class="action-btn confirm" aria-label="Save vendor" onclick={submitNewVendor} disabled={!newVendorName.trim()}>
				<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
			</button>
			<button type="button" class="action-btn cancel" aria-label="Cancel" onclick={cancelNew}>
				<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
			</button>
		</div>
	{:else}
		<div class="select-row">
			<select
				id="vendorSelect"
				class="vendor-select"
				value={configStore.selectedVendorName}
				onchange={(e) => {
					const val = (e.target as HTMLSelectElement).value;
					if (val === '__add__') {
						addingNew = true;
					} else {
						configStore.selectVendor(val);
					}
				}}
			>
				{#if configStore.vendors.length === 0}
					<option value="" disabled selected>No vendors yet</option>
				{/if}
				{#each configStore.vendors as vendor}
					<option value={vendor.name}>
						{vendor.name}{vendor.locked ? ' 🔒' : ''}
					</option>
				{/each}
				<option value="__add__">+ Add new vendor</option>
			</select>

			{#if configStore.selectedVendorName}
				<button
					type="button"
					class="action-btn delete"
					title="Delete vendor"
					onclick={() => (vendorPendingDelete = configStore.selectedVendorName)}
				>
					<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
				</button>
			{/if}
		</div>
	{/if}

	{#if configStore.selectedVendor?.locked}
		<p class="locked-hint" title="This vendor's settings were saved with a different passphrase">
			<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
			Settings locked — saved with a different passphrase
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
		font-size: 12px;
		font-weight: 700;
		color: var(--ink-2);
	}

	.select-row,
	.new-vendor-row {
		display: flex;
		gap: 6px;
		align-items: center;
	}

	.vendor-select,
	.vendor-input {
		flex: 1;
		font-family: 'Manrope', system-ui, sans-serif;
		font-size: 14px;
		font-weight: 500;
		color: var(--ink);
		background: var(--surface);
		border: 1.5px solid var(--border);
		border-radius: 10px;
		padding: 9px 13px;
		outline: none;
		cursor: pointer;
		transition:
			border-color 0.15s,
			box-shadow 0.15s;
		-webkit-appearance: none;
		appearance: none;
	}

	.vendor-select {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238792a2' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 12px center;
		padding-right: 32px;
	}

	.vendor-select:focus,
	.vendor-input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-dim);
		cursor: auto;
	}

	.vendor-input::placeholder {
		color: var(--muted);
		font-weight: 400;
	}

	.action-btn {
		width: 34px;
		height: 34px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1.5px solid var(--border);
		border-radius: 9px;
		background: var(--surface);
		color: var(--muted);
		cursor: pointer;
		flex-shrink: 0;
		transition:
			color 0.12s,
			background 0.12s,
			border-color 0.12s;
	}

	.action-btn:hover {
		color: var(--ink-2);
		background: var(--surface-alt);
	}

	.action-btn.confirm:not(:disabled) {
		color: var(--green);
		border-color: var(--green);
	}

	.action-btn.delete:hover {
		color: var(--red);
		border-color: var(--red);
	}

	.action-btn:disabled {
		opacity: 0.4;
		cursor: default;
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
