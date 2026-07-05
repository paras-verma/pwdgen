<script lang="ts">
	interface Props {
		vendorName: string;
		onConfirm: () => void;
		onCancel: () => void;
	}

	let { vendorName, onConfirm, onCancel }: Props = $props();

	let typedName = $state('');

	const canConfirm = $derived(typedName === vendorName);
</script>

<div
	class="fixed inset-0 bg-black/45 flex items-center justify-center z-[100] p-5"
	role="button"
	tabindex="-1"
	aria-label="Close modal"
	onclick={onCancel}
	onkeydown={(e) => e.key === 'Escape' && onCancel()}
>
	<div
		class="bg-surface border border-border rounded-2xl p-7 w-full max-w-[400px] shadow-[var(--shadow-card)]"
		onclick={(e) => e.stopPropagation()}
		onkeydown={() => {}}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		tabindex="-1"
	>
		<h2 id="modal-title" class="text-[17px] font-extrabold text-ink mb-[10px]">Delete vendor</h2>
		<p class="text-[13.5px] text-ink-2 leading-[1.5] mb-5">
			This will remove <strong>{vendorName}</strong> and its saved settings. Type the vendor name to confirm.
		</p>

		<div class="mb-5">
			<input
				type="text"
				placeholder={vendorName}
				autocomplete="off"
				spellcheck="false"
				class="w-full font-mono text-[14px] text-ink bg-surface border-[1.5px] border-border rounded-[9px] px-[13px] py-[10px] outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-dim)]"
				bind:value={typedName}
				onkeydown={(e) => e.key === 'Enter' && canConfirm && onConfirm()}
			/>
		</div>

		<div class="flex gap-[10px] justify-end">
			<button
				type="button"
				class="font-sans text-[13.5px] font-semibold text-ink-2 bg-surface-alt border border-border rounded-lg px-[18px] py-[9px] cursor-pointer transition-[background] duration-[120ms] hover:bg-border-soft"
				onclick={onCancel}
			>Cancel</button>
			<button
				type="button"
				class="font-sans text-[13.5px] font-bold text-white bg-red border-none rounded-lg px-[18px] py-[9px] cursor-pointer transition-[opacity,filter] duration-150 hover:not-disabled:brightness-110 disabled:opacity-40 disabled:cursor-default"
				disabled={!canConfirm}
				onclick={onConfirm}
			>Delete</button>
		</div>
	</div>
</div>
