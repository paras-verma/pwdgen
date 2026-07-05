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

<div class="flex flex-col gap-1.5">
	<label class="text-xs font-bold text-ink-2" for="vendorInput">Service</label>
	<div class="flex gap-1.5 items-start">
		<div class="relative flex-1">
			<input
				id="vendorInput"
				type="text"
				class="w-full font-sans text-[14.5px] font-medium text-ink bg-surface border-[1.5px] border-border rounded-[10px] px-[13px] py-[10px] outline-none appearance-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted placeholder:font-normal focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-dim)]"
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
				<div class="absolute top-[calc(100%+4px)] left-0 right-0 bg-surface border-[1.5px] border-border rounded-[10px] shadow-[var(--shadow-card)] z-50 overflow-hidden max-h-[220px] overflow-y-auto" role="listbox">
					{#each filteredVendors as vendor}
						<button
							type="button"
							class="w-full flex items-center justify-between gap-2 px-[13px] py-[9px] bg-none border-none font-sans text-[13.5px] font-medium cursor-pointer text-left transition-[background] duration-100 hover:bg-accent-dim aria-selected:bg-accent-dim {vendor.locked ? 'text-muted' : 'text-ink'}"
							role="option"
							aria-selected={vendor.name === configStore.selectedVendorName}
							onmousedown={() => handleSelect(vendor.name)}
						>
							<span class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{vendor.name}</span>
							{#if vendor.locked}
								<svg class="shrink-0 text-muted" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
							{/if}
						</button>
					{/each}

					{#if isNewVendorName}
						<button
							type="button"
							class="w-full flex items-center gap-[7px] px-[13px] py-[9px] bg-none border-none border-t border-t-border-soft font-sans text-[13.5px] font-semibold text-accent cursor-pointer text-left transition-[background] duration-100 hover:bg-accent-dim"
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
				class="w-10 h-10 flex items-center justify-center bg-none border-[1.5px] border-border rounded-[10px] text-muted cursor-pointer shrink-0 transition-[color,border-color,background] duration-[120ms] hover:text-red hover:border-red"
				title="Delete vendor"
				onclick={() => (vendorPendingDelete = configStore.selectedVendorName)}
			>
				<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
			</button>
		{/if}
	</div>

	{#if configStore.selectedVendor?.locked}
		<p class="flex items-center gap-[5px] text-[11.5px] text-muted italic" title="This vendor was saved with a different passphrase">
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
