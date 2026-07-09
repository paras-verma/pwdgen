<script lang="ts">
	import { browser } from '$app/environment';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import PassphraseForm from '$lib/components/PassphraseForm.svelte';
	import VendorDropdown from '$lib/components/VendorDropdown.svelte';
	import AdvancedOptions from '$lib/components/AdvancedOptions.svelte';
	import ResultsPanel from '$lib/components/ResultsPanel.svelte';
	import ShareModal from '$lib/components/ShareModal.svelte';
	import ImportBanner from '$lib/components/ImportBanner.svelte';
	import InfoPanel from '$lib/components/InfoPanel.svelte';
	import { slide } from 'svelte/transition';
	import { tick } from 'svelte';
	import { passphraseStore } from '$lib/stores/passphraseStore.svelte';
	import { configStore } from '$lib/stores/configStore.svelte';
	import { trustStore } from '$lib/stores/trustStore.svelte';
	import { sessionSettingsStore } from '$lib/stores/sessionSettingsStore.svelte';
	import { generatePasswords } from '$lib/crypto/passwordDerivation';
	import { detectImportFragment } from '$lib/crypto/configShare';

	const appVersion: string = import.meta.env.VITE_APP_VERSION;
	const releaseUrl = `https://github.com/paras-verma/pwdgen/releases/tag/v${appVersion}`;
	const attestationUrl: string = import.meta.env.VITE_ATTESTATION_URL;
	const versionUrl = attestationUrl || releaseUrl;

	let showInfo = $state(false);
	let generatedPasswords = $state<string[]>([]);
	let isGenerating = $state(false);
	let generationError = $state<string | null>(null);
	let showShareModal = $state(false);
	let pendingImportFragment = $state<string | null>(browser ? detectImportFragment() : null);
	let siteName = $state('');
	let baseOffset = $state(0);
	let nextOffset = $state(0);
	let scrollContainer: HTMLDivElement | null = null;

	$effect(() => {
		if (browser && passphraseStore.confirmed && passphraseStore.configKey) {
			configStore.loadFromStorage(passphraseStore.configKey, passphraseStore.passphrase);
		}
	});

	$effect(() => {
		if (!passphraseStore.confirmed) {
			configStore.reset();
			sessionSettingsStore.reset();
			generatedPasswords = [];
			generationError = null;
			baseOffset = 0;
			nextOffset = 0;
		}
	});

	const activeVendor = $derived(
		trustStore.trusted && configStore.selectedVendor && !configStore.selectedVendor.locked
			? configStore.selectedVendor
			: null
	);

	const effectiveVendorName = $derived(
		trustStore.trusted ? (configStore.selectedVendorName ?? '') : siteName.trim()
	);

	const canGenerate = $derived(
		passphraseStore.confirmed &&
		effectiveVendorName.length > 0 &&
		!(trustStore.trusted && configStore.selectedVendor?.locked) &&
		!isGenerating
	);

	const settings = $derived(
		activeVendor
			? { length: activeVendor.length, disallowedChars: activeVendor.disallowedChars, version: activeVendor.version }
			: { length: sessionSettingsStore.length, disallowedChars: sessionSettingsStore.disallowedChars, version: sessionSettingsStore.version }
	);

	const lastCopiedDisplayIndex = $derived(
		activeVendor?.lastCopiedIndex != null
			? activeVendor.lastCopiedIndex - baseOffset
			: null
	);

	async function handleGenerate() {
		if (!passphraseStore.confirmed || !effectiveVendorName || isGenerating) return;

		const start = activeVendor?.lastCopiedIndex != null
			? Math.max(0, activeVendor.lastCopiedIndex - 3)
			: 0;

		baseOffset = start;
		nextOffset = start + 5;
		isGenerating = true;
		generationError = null;
		generatedPasswords = [];

		try {
			generatedPasswords = await generatePasswords(
				effectiveVendorName,
				passphraseStore.passphrase,
				settings.length,
				settings.disallowedChars,
				settings.version,
				start
			);
			if (trustStore.trusted && passphraseStore.configKey) {
				await configStore.upsertVendor(effectiveVendorName, { ...settings, lastCopiedIndex: activeVendor?.lastCopiedIndex ?? null }, passphraseStore.configKey);
			}
		} catch (error) {
			generationError = error instanceof Error ? error.message : 'Generation failed';
		} finally {
			isGenerating = false;
		}
	}

	async function handleGenerateMore() {
		if (!passphraseStore.confirmed || !effectiveVendorName || isGenerating) return;
		const prevCount = generatedPasswords.length;
		isGenerating = true;
		try {
			const more = await generatePasswords(
				effectiveVendorName,
				passphraseStore.passphrase,
				settings.length,
				settings.disallowedChars,
				settings.version,
				nextOffset
			);
			generatedPasswords = [...generatedPasswords, ...more];
			nextOffset += 5;
			await tick();
			if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
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

	async function handleCopyAtIndex(displayIndex: number) {
		const absoluteIndex = baseOffset + displayIndex;
		if (trustStore.trusted && activeVendor && passphraseStore.configKey) {
			await configStore.updateVendorSettings(
				activeVendor.name,
				{ lastCopiedIndex: absoluteIndex },
				passphraseStore.configKey
			);
		}
	}
</script>

<div class="w-full max-w-[920px] bg-surface border border-border rounded-[22px] shadow-[var(--shadow-card)] overflow-hidden transition-[background,border-color,box-shadow] duration-[250ms] max-[680px]:rounded-none max-[680px]:shadow-none max-[680px]:border-l-0 max-[680px]:border-r-0 max-[680px]:border-t-0 max-[680px]:min-h-svh">
	<header class="flex items-center justify-between px-7 py-4 border-b border-b-border max-[680px]:px-[18px] max-[680px]:py-[14px]">
		<div class="flex items-center gap-2">
			<div class="w-[26px] h-[26px] flex items-center justify-center bg-accent-dim rounded-[7px] text-accent">
				<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
			</div>
			<span class="font-mono text-[13px] font-semibold text-ink-2 tracking-[0.03em]">pwdgen</span>
			<a
				href={versionUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center gap-[5px] font-mono text-[11px] font-medium text-muted bg-surface-alt border border-border rounded-full px-[8px] py-[3px] leading-none transition-[color,border-color] duration-[120ms] hover:text-green hover:border-green"
				title="{attestationUrl ? 'View build attestation' : 'View release'} v{appVersion}"
			>
				<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
				v{appVersion}
			</a>
		</div>
		<div class="flex items-center gap-2">
			{#if passphraseStore.confirmed && trustStore.trusted && configStore.vendors.length > 0}
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
			<button
				type="button"
				class="flex items-center justify-center w-[30px] h-[30px] font-sans font-semibold border-[1.5px] rounded-lg cursor-pointer transition-[color,border-color,background] duration-[120ms] {showInfo ? 'text-accent border-accent bg-accent-dim' : 'text-muted border-border bg-none hover:text-accent hover:border-accent'}"
				title="About pwdgen"
				aria-pressed={showInfo}
				onclick={() => (showInfo = !showInfo)}
			>
				<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
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

	{#if showInfo}
		<InfoPanel />
	{:else}
		<div class="grid [grid-template-columns:7fr_5fr] min-h-[520px] max-[680px]:grid-cols-1 max-[680px]:min-h-auto">
			<section class="order-1 px-11 py-10 flex flex-col gap-0 border-r border-r-border max-[680px]:order-1 max-[680px]:px-[22px] max-[680px]:py-7 max-[680px]:border-r-0 max-[680px]:border-b max-[680px]:border-b-border">
				<p class="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent mb-[10px]">Generator</p>
				<h1 class="text-[27px] font-extrabold tracking-[-0.035em] leading-[1.1] text-ink text-balance mb-[10px] max-[680px]:text-[22px]">Derive passwords<br />from a passphrase</h1>
				<p class="text-[13.5px] text-muted leading-[1.6] mb-7">Same inputs always produce the same passwords. Nothing is stored or sent anywhere.</p>

				<PassphraseForm />

				{#if passphraseStore.confirmed}
					<div transition:slide={{ duration: 200 }}>
						<div class="mt-6 flex flex-col gap-0">
							{#if trustStore.trusted}
								<VendorDropdown configKey={passphraseStore.configKey} />
								<AdvancedOptions />
							{:else}
								<div class="flex flex-col gap-1.5 mb-3">
									<label class="text-xs font-bold text-ink-2" for="siteName">Site / service</label>
									<input
										id="siteName"
										type="text"
										placeholder="e.g. github.com"
										autocomplete="off"
										spellcheck="false"
										bind:value={siteName}
										class="w-full font-sans text-[14px] font-medium text-ink bg-surface border-[1.5px] border-border rounded-[10px] px-[13px] py-[10px] outline-none appearance-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted placeholder:font-normal focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-dim)]"
										onkeydown={(e) => e.key === 'Enter' && canGenerate && handleGenerate()}
									/>
								</div>
								<AdvancedOptions />
							{/if}
						</div>
						<button
							type="button"
							class="block w-full mt-4 font-sans text-[14.5px] font-bold text-white bg-accent border-none rounded-[10px] px-5 py-3 cursor-pointer tracking-[0.01em] transition-[background,transform,opacity] duration-150 hover:not-disabled:bg-accent-hi active:not-disabled:translate-y-px disabled:opacity-55 disabled:cursor-default focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[3px]"
							disabled={!canGenerate}
							onclick={handleGenerate}
						>
							{isGenerating ? 'Generating…' : 'Generate passwords'}
						</button>
					</div>
				{/if}
			</section>

			<section
				class="results-section order-2 bg-surface-alt relative transition-[background,border-color] duration-[250ms] max-[680px]:order-2 max-[680px]:min-h-[260px]"
				class:loading={isGenerating}
				aria-live="polite"
			>
				<div class="absolute inset-0 px-7 py-10 flex flex-col max-[680px]:px-[22px] max-[680px]:py-6">
					<span class="font-mono text-[10.5px] font-semibold uppercase tracking-[0.15em] text-muted">Results</span>
					<div class="divider h-px my-[14px] bg-border relative overflow-hidden"></div>

					<div bind:this={scrollContainer} class="flex-1 min-h-0 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent]">
						<ResultsPanel
							passwords={generatedPasswords}
							{isGenerating}
							errorMessage={generationError}
							lastCopiedIndex={lastCopiedDisplayIndex}
							onCopy={handleCopyAtIndex}
						/>
					</div>

					{#if generatedPasswords.length > 0}
						<button
							type="button"
							class="mt-3 w-full font-sans text-[14px] font-bold text-ink-2 bg-surface border-[1.5px] border-border rounded-[10px] px-5 py-3 cursor-pointer tracking-[0.01em] transition-[background,border-color,color,transform,opacity] duration-150 hover:not-disabled:border-accent hover:not-disabled:text-accent active:not-disabled:translate-y-px disabled:opacity-55 disabled:cursor-default focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[3px]"
							disabled={isGenerating}
							onclick={handleGenerateMore}
						>
							{isGenerating ? 'Generating…' : '+ 5 more'}
						</button>
					{/if}
				</div>
			</section>
		</div>
	{/if}
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
