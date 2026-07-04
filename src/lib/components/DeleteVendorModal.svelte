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
	class="modal-backdrop"
	role="button"
	tabindex="-1"
	aria-label="Close modal"
	onclick={onCancel}
	onkeydown={(e) => e.key === 'Escape' && onCancel()}
>
	<div class="modal" onclick={(e) => e.stopPropagation()} onkeydown={() => {}} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">
		<h2 id="modal-title" class="modal-title">Delete vendor</h2>
		<p class="modal-body">
			This will remove <strong>{vendorName}</strong> and its saved settings. Type the vendor name to confirm.
		</p>

		<div class="field">
			<input
				type="text"
				placeholder={vendorName}
				autocomplete="off"
				spellcheck="false"
				bind:value={typedName}
				onkeydown={(e) => e.key === 'Enter' && canConfirm && onConfirm()}
			/>
		</div>

		<div class="modal-actions">
			<button type="button" class="cancel-btn" onclick={onCancel}>Cancel</button>
			<button type="button" class="delete-btn" disabled={!canConfirm} onclick={onConfirm}>
				Delete
			</button>
		</div>
	</div>
</div>

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.45);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		padding: 20px;
	}

	.modal {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 28px;
		width: 100%;
		max-width: 400px;
		box-shadow: var(--shadow-card);
	}

	.modal-title {
		font-size: 17px;
		font-weight: 800;
		color: var(--ink);
		margin-bottom: 10px;
	}

	.modal-body {
		font-size: 13.5px;
		color: var(--ink-2);
		line-height: 1.5;
		margin-bottom: 20px;
	}

	.field {
		margin-bottom: 20px;
	}

	input {
		width: 100%;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 14px;
		color: var(--ink);
		background: var(--surface);
		border: 1.5px solid var(--border);
		border-radius: 9px;
		padding: 10px 13px;
		outline: none;
		transition:
			border-color 0.15s,
			box-shadow 0.15s;
	}

	input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-dim);
	}

	.modal-actions {
		display: flex;
		gap: 10px;
		justify-content: flex-end;
	}

	.cancel-btn {
		font-family: 'Manrope', system-ui, sans-serif;
		font-size: 13.5px;
		font-weight: 600;
		color: var(--ink-2);
		background: var(--surface-alt);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 9px 18px;
		cursor: pointer;
		transition: background 0.12s;
	}

	.cancel-btn:hover {
		background: var(--border-soft);
	}

	.delete-btn {
		font-family: 'Manrope', system-ui, sans-serif;
		font-size: 13.5px;
		font-weight: 700;
		color: #fff;
		background: var(--red);
		border: none;
		border-radius: 8px;
		padding: 9px 18px;
		cursor: pointer;
		transition:
			opacity 0.15s,
			filter 0.15s;
	}

	.delete-btn:hover:not(:disabled) {
		filter: brightness(1.1);
	}

	.delete-btn:disabled {
		opacity: 0.4;
		cursor: default;
	}
</style>
