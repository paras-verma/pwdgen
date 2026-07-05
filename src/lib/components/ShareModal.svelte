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

<div
	class="fixed inset-0 bg-black/45 flex items-center justify-center z-[100] backdrop-blur-[2px]"
	role="dialog"
	aria-modal="true"
	aria-label="Share config"
	tabindex="-1"
	onmousedown={handleBackdrop}
>
	<div class="bg-surface border-[1.5px] border-border rounded-2xl shadow-[var(--shadow-card)] w-[360px] max-w-[calc(100vw-32px)] overflow-hidden">
		<div class="flex items-center justify-between px-5 pt-[18px] pb-4 border-b border-b-border-soft">
			<h2 class="text-[15px] font-bold text-ink">Share config</h2>
			<button
				type="button"
				class="w-7 h-7 flex items-center justify-center bg-none border-none rounded-[6px] text-muted cursor-pointer transition-[background,color] duration-[120ms] hover:bg-surface-alt hover:text-ink"
				onclick={onClose}
				aria-label="Close"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
			</button>
		</div>

		<div class="p-5 flex flex-col gap-4">
			{#if exportError}
				<p class="text-[13.5px] text-muted text-center py-3">{exportError}</p>
			{:else}
				<p class="text-[13px] text-muted leading-[1.5]">
					Your encrypted vendor config is embedded in the URL. Only someone with the same passphrase can decrypt it.
				</p>

				{#if qrDataUrl}
					<div class="flex justify-center p-3 bg-surface-alt rounded-[10px] border border-border-soft">
						<img src={qrDataUrl} alt="QR code" width="240" height="240" class="rounded-[6px] block" />
					</div>
				{/if}

				<div class="flex gap-2">
					<input
						type="text"
						class="flex-1 font-mono text-[11px] text-ink-2 bg-surface-alt border-[1.5px] border-border rounded-lg px-3 py-[9px] outline-none overflow-hidden text-ellipsis whitespace-nowrap cursor-text transition-[border-color] duration-150 focus:border-accent"
						readonly
						value={shareUrl}
						onclick={(e) => (e.target as HTMLInputElement).select()}
					/>
					<button
						type="button"
						class="w-[38px] h-[38px] flex items-center justify-center bg-surface-alt border-[1.5px] rounded-lg shrink-0 cursor-pointer transition-[background,color,border-color] duration-[120ms] hover:border-accent hover:text-accent {copied ? 'border-green text-green' : 'border-border text-muted'}"
						onclick={copyUrl}
					>
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
