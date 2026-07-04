<script lang="ts">
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';
	import { encodeConfigForShare, getShareUrl } from '$lib/crypto/configShare';

	interface Props {
		onClose: () => void;
	}
	let { onClose }: Props = $props();

	let shareUrl = $state('');
	let copied = $state(false);
	let qrDataUrl = $state('');
	let exportError = $state('');

	onMount(async () => {
		const encoded = encodeConfigForShare();
		if (!encoded) {
			exportError = 'No config to export — generate at least one password first.';
			return;
		}
		shareUrl = getShareUrl(encoded);
		try {
			qrDataUrl = await QRCode.toDataURL(shareUrl, {
				width: 240,
				margin: 1,
				color: { dark: '#1e293b', light: '#f8fafc' }
			});
		} catch {
			exportError = 'Could not generate QR code.';
		}
	});

	async function copyUrl() {
		await navigator.clipboard.writeText(shareUrl);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function handleBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) onClose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="backdrop" role="dialog" aria-modal="true" aria-label="Share config" tabindex="-1" onmousedown={handleBackdrop}>
	<div class="modal">
		<div class="modal-header">
			<h2 class="modal-title">Share config</h2>
			<button type="button" class="close-btn" onclick={onClose} aria-label="Close">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
			</button>
		</div>

		<div class="modal-body">
			{#if exportError}
				<p class="export-error">{exportError}</p>
			{:else}
				<p class="share-note">
					Your encrypted vendor config is embedded in the URL. Only someone with the same passphrase can decrypt it.
				</p>

				{#if qrDataUrl}
					<div class="qr-wrap">
						<img src={qrDataUrl} alt="QR code" width="240" height="240" />
					</div>
				{/if}

				<div class="url-row">
					<input
						type="text"
						class="url-input"
						readonly
						value={shareUrl}
						onclick={(e) => (e.target as HTMLInputElement).select()}
					/>
					<button type="button" class="copy-btn" class:copied onclick={copyUrl}>
						{#if copied}
							<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
						{:else}
							<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
						{/if}
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.45);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		backdrop-filter: blur(2px);
	}

	.modal {
		background: var(--surface);
		border: 1.5px solid var(--border);
		border-radius: 16px;
		box-shadow: var(--shadow-card);
		width: 360px;
		max-width: calc(100vw - 32px);
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 18px 20px 16px;
		border-bottom: 1px solid var(--border-soft);
	}

	.modal-title {
		font-size: 15px;
		font-weight: 700;
		color: var(--ink);
	}

	.close-btn {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		border-radius: 6px;
		color: var(--muted);
		cursor: pointer;
		transition: background 0.12s, color 0.12s;
	}

	.close-btn:hover {
		background: var(--surface-alt);
		color: var(--ink);
	}

	.modal-body {
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.share-note {
		font-size: 13px;
		color: var(--muted);
		line-height: 1.5;
	}

	.qr-wrap {
		display: flex;
		justify-content: center;
		padding: 12px;
		background: var(--surface-alt);
		border-radius: 10px;
		border: 1px solid var(--border-soft);
	}

	.qr-wrap img {
		border-radius: 6px;
		display: block;
	}

	.url-row {
		display: flex;
		gap: 8px;
	}

	.url-input {
		flex: 1;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11px;
		color: var(--ink-2);
		background: var(--surface-alt);
		border: 1.5px solid var(--border);
		border-radius: 8px;
		padding: 9px 12px;
		outline: none;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		cursor: text;
	}

	.url-input:focus {
		border-color: var(--accent);
	}

	.copy-btn {
		width: 38px;
		height: 38px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--surface-alt);
		border: 1.5px solid var(--border);
		border-radius: 8px;
		color: var(--muted);
		cursor: pointer;
		flex-shrink: 0;
		transition: background 0.12s, color 0.12s, border-color 0.12s;
	}

	.copy-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.copy-btn.copied {
		border-color: var(--green, #16a34a);
		color: var(--green, #16a34a);
	}

	.export-error {
		font-size: 13.5px;
		color: var(--muted);
		text-align: center;
		padding: 12px 0;
	}
</style>
