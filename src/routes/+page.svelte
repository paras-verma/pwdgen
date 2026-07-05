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
	import { generatePasswords } from '$lib/crypto/passwordDerivation';
	import { DEFAULT_VENDOR_SETTINGS, type VendorSettings } from '$lib/crypto/configStorage';
	import { detectImportFragment } from '$lib/crypto/configShare';

	let generatedPasswords = $state<string[]>([]);
	let isGenerating = $state(false);
	let generationError = $state<string | null>(null);
	let showShareModal = $state(false);
	let pendingImportFragment = $state<string | null>(browser ? detectImportFragment() : null);
	let resultsPanelEl = $state<HTMLElement | null>(null);

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
						lastCopiedIndex: existingVendor.lastCopiedIndex,
						version: existingVendor.version
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
				settings.version
			);
			await configStore.upsertVendor(vendorName, settings, passphraseStore.configKey);
			resultsPanelEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

<div class="w-full max-w-[920px] bg-surface border border-border rounded-[22px] shadow-[var(--shadow-card)] overflow-hidden transition-[background,border-color,box-shadow] duration-[250ms] max-[680px]:rounded-none max-[680px]:shadow-none max-[680px]:border-l-0 max-[680px]:border-r-0 max-[680px]:border-t-0 max-[680px]:min-h-svh">
	<header class="flex items-center justify-between px-7 py-4 border-b border-b-border max-[680px]:px-[18px] max-[680px]:py-[14px]">
		<div class="flex items-center gap-2">
			<div class="w-[26px] h-[26px] flex items-center justify-center bg-accent-dim rounded-[7px] text-accent">
				<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
			</div>
			<span class="font-mono text-[13px] font-semibold text-ink-2 tracking-[0.03em]">
				pwdgen<em class="not-italic text-muted font-normal max-[680px]:hidden"> · deterministic</em>
			</span>
		</div>
		<div class="flex items-center gap-2">
			{#if passphraseStore.confirmed && configStore.vendors.length > 0}
				<button
					type="button"
					class="flex items-center gap-1.5 font-sans text-[12.5px] font-semibold text-muted bg-none border-[1.5px] border-border rounded-lg py-[5px] px-[11px] cursor-pointer transition-[color,border-color] duration-[120ms] hover:text-accent hover:border-accent max-[680px]:px-2"
					title="Share / export config"
					onclick={() => (showShareModal = true)}
				>
					<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
					<span class="max-[680px]:hidden">Share</span>
				</button>
			{/if}
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

	<div class="grid [grid-template-columns:7fr_5fr] min-h-[520px] max-[680px]:grid-cols-1 max-[680px]:min-h-auto">
		<section class="order-1 px-11 py-10 flex flex-col gap-0 border-r border-r-border max-[680px]:order-1 max-[680px]:px-[22px] max-[680px]:py-7 max-[680px]:border-r-0 max-[680px]:border-b max-[680px]:border-b-border">
			<p class="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent mb-[10px]">Generator</p>
			<h1 class="text-[27px] font-extrabold tracking-[-0.035em] leading-[1.1] text-ink text-balance mb-[10px] max-[680px]:text-[22px]">Derive passwords<br />from a passphrase</h1>
			<p class="text-[13.5px] text-muted leading-[1.6] mb-7">Same inputs always produce the same passwords. Nothing is stored or sent anywhere.</p>

			<PassphraseForm />

			{#if passphraseStore.confirmed}
				<div class="mt-6 flex flex-col gap-0">
					<VendorDropdown configKey={passphraseStore.configKey} />
					<AdvancedOptions />
				</div>
				<button
					type="button"
					class="block w-full mt-4 font-sans text-[14.5px] font-bold text-white bg-accent border-none rounded-[10px] px-5 py-3 cursor-pointer tracking-[0.01em] transition-[background,transform,opacity] duration-150 hover:not-disabled:bg-accent-hi active:not-disabled:translate-y-px disabled:opacity-55 disabled:cursor-default focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[3px]"
					disabled={!canGenerate}
					onclick={handleGenerate}
				>
					{isGenerating ? 'Generating…' : 'Generate passwords'}
				</button>
			{/if}
		</section>

		<section
			class="results-section order-2 bg-surface-alt px-7 py-8 flex flex-col transition-[background,border-color] duration-[250ms] max-[680px]:order-2 max-[680px]:px-[22px] max-[680px]:py-6 max-[680px]:min-h-[260px]"
			class:loading={isGenerating}
			aria-live="polite"
			bind:this={resultsPanelEl}
		>
			<span class="font-mono text-[10.5px] font-semibold uppercase tracking-[0.15em] text-muted">Results</span>
			<div class="divider h-px my-[14px] bg-border relative overflow-hidden"></div>

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
	.divider::after {
		content: '';
		position: absolute;
		inset-block: 0;
		left: -50%;
		width: 40%;
		background: var(--accent);
		opacity: 0;
		border-radius: 1px;
	}

	.loading .divider::after {
		opacity: 1;
		animation: progress-bar 1.4s ease-in-out infinite;
	}
</style>
