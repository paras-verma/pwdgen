<script lang="ts">
	import { browser } from '$app/environment';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import PassphraseForm from '$lib/components/PassphraseForm.svelte';
	import VendorDropdown from '$lib/components/VendorDropdown.svelte';
	import AdvancedOptions from '$lib/components/AdvancedOptions.svelte';
	import ResultsPanel from '$lib/components/ResultsPanel.svelte';
	import ShareModal from '$lib/components/ShareModal.svelte';
	import ImportBanner from '$lib/components/ImportBanner.svelte';
	import { passphraseStore } from '$lib/stores/passphraseStore.svelte';
	import { configStore } from '$lib/stores/configStore.svelte';
	import { generatePasswords, type AlgorithmVersion } from '$lib/crypto/passwordDerivation';
	import { DEFAULT_VENDOR_SETTINGS, type VendorSettings } from '$lib/crypto/configStorage';
	import { detectImportFragment } from '$lib/crypto/configShare';

	let algorithmVersion = $state<AlgorithmVersion>('v1');
	let generatedPasswords = $state<string[]>([]);
	let isGenerating = $state(false);
	let generationError = $state<string | null>(null);
	let showShareModal = $state(false);
	let pendingImportFragment = $state<string | null>(browser ? detectImportFragment() : null);

	$effect(() => {
		if (browser && passphraseStore.confirmed && passphraseStore.configKey) {
			configStore.loadFromStorage(passphraseStore.configKey);
		}
	});

	$effect(() => {
		if (!passphraseStore.confirmed) {
			configStore.reset();
			generatedPasswords = [];
			generationError = null;
		}
	});

	const activeVendor = $derived(
		configStore.selectedVendor && !configStore.selectedVendor.locked
			? configStore.selectedVendor
			: null
	);

	const canGenerate = $derived(
		passphraseStore.confirmed &&
		!!configStore.selectedVendorName &&
		!configStore.selectedVendor?.locked &&
		!isGenerating
	);

	async function handleGenerate() {
		const vendorName = configStore.selectedVendorName;
		if (!passphraseStore.confirmed || !passphraseStore.configKey || !vendorName || isGenerating) return;

		const existingVendor = configStore.selectedVendor;
		const settings: VendorSettings =
			existingVendor && !existingVendor.locked
				? {
						count: existingVendor.count,
						length: existingVendor.length,
						disallowedChars: existingVendor.disallowedChars,
						lastCopiedIndex: existingVendor.lastCopiedIndex
					}
				: { ...DEFAULT_VENDOR_SETTINGS };

		isGenerating = true;
		generationError = null;
		generatedPasswords = [];

		try {
			generatedPasswords = await generatePasswords(
				vendorName,
				passphraseStore.passphrase,
				settings.count,
				settings.length,
				settings.disallowedChars,
				algorithmVersion
			);
			await configStore.upsertVendor(vendorName, settings, passphraseStore.configKey);
		} catch (error) {
			generationError = error instanceof Error ? error.message : 'Generation failed';
		} finally {
			isGenerating = false;
		}
	}

	function handleImported() {
		pendingImportFragment = null;
		passphraseStore.reset();
		configStore.reset();
		generatedPasswords = [];
		generationError = null;
	}

	async function handleCopyAtIndex(index: number) {
		if (!activeVendor || !passphraseStore.configKey) return;
		await configStore.updateVendorSettings(
			activeVendor.name,
			{ lastCopiedIndex: index },
			passphraseStore.configKey
		);
	}
</script>

<div class="card">
	<header class="card-header">
		<div class="brand">
			<div class="brand-icon">
				<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
			</div>
			<span class="brand-text">pwdgen<em> · deterministic</em></span>
		</div>
		<div class="header-actions">
			<button
				type="button"
				class="share-btn"
				title="Share / export config"
				onclick={() => (showShareModal = true)}
			>
				<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
				<span>Share</span>
			</button>
			<ThemeToggle />
		</div>
	</header>

	{#if pendingImportFragment}
		<ImportBanner
			encoded={pendingImportFragment}
			onImported={handleImported}
			onDismiss={() => (pendingImportFragment = null)}
		/>
	{/if}

	<div class="card-body">
		<section class="form-panel">
			<p class="form-eyebrow">Generator</p>
			<h1 class="form-title">Derive passwords<br />from a passphrase</h1>
			<p class="form-lede">Same inputs always produce the same passwords. Nothing is stored or sent anywhere.</p>

			<PassphraseForm />

			{#if passphraseStore.confirmed}
				<div class="vendor-advanced">
					<VendorDropdown configKey={passphraseStore.configKey} />
					<AdvancedOptions
						{algorithmVersion}
						onAlgorithmVersionChange={(version) => (algorithmVersion = version)}
					/>
				</div>
				<button
					type="button"
					class="generate-btn"
					disabled={!canGenerate}
					onclick={handleGenerate}
				>
					{isGenerating ? 'Generating…' : 'Generate passwords'}
				</button>
			{/if}
		</section>

		<section class="results-panel" class:loading={isGenerating} aria-live="polite">
			<span class="panel-label">Results</span>
			<div class="panel-divider"></div>

			<ResultsPanel
				passwords={generatedPasswords}
				{isGenerating}
				errorMessage={generationError}
				lastCopiedIndex={activeVendor?.lastCopiedIndex ?? null}
				onCopy={handleCopyAtIndex}
			/>
		</section>
	</div>
</div>

{#if showShareModal}
	<ShareModal onClose={() => (showShareModal = false)} />
{/if}

<style>
	.card {
		width: 100%;
		max-width: 920px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 22px;
		box-shadow: var(--shadow-card);
		overflow: hidden;
		transition:
			background 0.25s,
			border-color 0.25s,
			box-shadow 0.25s;
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 28px;
		border-bottom: 1px solid var(--border);
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.share-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		font-family: 'Manrope', system-ui, sans-serif;
		font-size: 12.5px;
		font-weight: 600;
		color: var(--muted);
		background: none;
		border: 1.5px solid var(--border);
		border-radius: 8px;
		padding: 5px 11px;
		cursor: pointer;
		transition: color 0.12s, border-color 0.12s;
	}

	.share-btn:hover {
		color: var(--accent);
		border-color: var(--accent);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.brand-icon {
		width: 26px;
		height: 26px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--accent-dim);
		border-radius: 7px;
		color: var(--accent);
	}

	.brand-text {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 13px;
		font-weight: 600;
		color: var(--ink-2);
		letter-spacing: 0.03em;
	}

	.brand-text em {
		font-style: normal;
		color: var(--muted);
		font-weight: 400;
	}

	.card-body {
		display: grid;
		grid-template-columns: 7fr 5fr;
		min-height: 520px;
	}

	.form-panel {
		order: 1;
		padding: 40px 44px;
		display: flex;
		flex-direction: column;
		gap: 0;
		border-right: 1px solid var(--border);
	}

	.form-eyebrow {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.16em;
		color: var(--accent);
		margin-bottom: 10px;
	}

	.form-title {
		font-size: 27px;
		font-weight: 800;
		letter-spacing: -0.035em;
		line-height: 1.1;
		color: var(--ink);
		text-wrap: balance;
		margin-bottom: 10px;
	}

	.form-lede {
		font-size: 13.5px;
		color: var(--muted);
		line-height: 1.6;
		margin-bottom: 28px;
	}

	.vendor-advanced {
		margin-top: 24px;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.generate-btn {
		display: block;
		width: 100%;
		margin-top: 16px;
		font-family: 'Manrope', system-ui, sans-serif;
		font-size: 14.5px;
		font-weight: 700;
		color: #fff;
		background: var(--accent);
		border: none;
		border-radius: 10px;
		padding: 12px 20px;
		cursor: pointer;
		letter-spacing: 0.01em;
		transition:
			background 0.15s,
			transform 0.08s,
			opacity 0.15s;
	}

	.generate-btn:hover:not(:disabled) {
		background: var(--accent-hi);
	}

	.generate-btn:active:not(:disabled) {
		transform: translateY(1px);
	}

	.generate-btn:disabled {
		opacity: 0.55;
		cursor: default;
	}

	.generate-btn:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 3px;
	}

	.results-panel {
		order: 2;
		background: var(--surface-alt);
		padding: 32px 28px;
		display: flex;
		flex-direction: column;
		transition:
			background 0.25s,
			border-color 0.25s;
	}

	.panel-label {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 10.5px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: var(--muted);
	}

	.panel-divider {
		height: 1px;
		margin: 14px 0;
		background: var(--border);
		position: relative;
		overflow: hidden;
	}

	.panel-divider::after {
		content: '';
		position: absolute;
		inset-block: 0;
		left: -50%;
		width: 40%;
		background: var(--accent);
		opacity: 0;
		border-radius: 1px;
	}

	.results-panel.loading .panel-divider::after {
		opacity: 1;
		animation: progress-bar 1.4s ease-in-out infinite;
	}

	@keyframes progress-bar {
		0% {
			left: -45%;
		}
		100% {
			left: 120%;
		}
	}

	@media (max-width: 680px) {
		.card {
			border-radius: 0;
			box-shadow: none;
			border-left: none;
			border-right: none;
			border-top: none;
			min-height: 100svh;
		}

		.card-body {
			grid-template-columns: 1fr;
			min-height: auto;
		}

		.form-panel {
			order: 1;
			padding: 28px 22px 24px;
			border-right: none;
			border-bottom: 1px solid var(--border);
		}

		.results-panel {
			order: 2;
			padding: 24px 22px 28px;
			min-height: 260px;
		}

		.card-header {
			padding: 14px 18px;
		}

		.form-title {
			font-size: 22px;
		}

		.brand-text em {
			display: none;
		}

		.share-btn span {
			display: none;
		}

		.share-btn {
			padding: 6px 8px;
		}
	}
</style>
