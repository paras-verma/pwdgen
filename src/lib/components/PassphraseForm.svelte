<script lang="ts">
	import { slide } from 'svelte/transition';
	import zxcvbn from 'zxcvbn';
	import { passphraseStore } from '$lib/stores/passphraseStore.svelte';
	import { trustStore } from '$lib/stores/trustStore.svelte';

	let passphraseVisible = $state(false);
	let confirmVisible = $state(false);
	let shakingPassphrase = $state(false);
	let shakingConfirm = $state(false);

	const matched = $derived(
		passphraseStore.passphrase.length > 0 &&
		passphraseStore.confirm.length > 0 &&
		!passphraseStore.mismatch
	);

	const strength = $derived(
		passphraseStore.passphrase.length > 0 ? zxcvbn(passphraseStore.passphrase) : null
	);

	const strengthScore = $derived(strength?.score ?? -1);

	const strengthMeta = $derived.by(() => {
		switch (strengthScore) {
			case 0: return { label: 'Too weak', color: 'var(--red)', bars: 1 };
			case 1: return { label: 'Weak', color: 'var(--red)', bars: 2 };
			case 2: return { label: 'Fair', color: 'var(--red)', bars: 3 };
			case 3: return { label: 'Strong', color: '#f59e0b', bars: 4 };
			case 4: return { label: 'Very strong', color: 'var(--green)', bars: 5 };
			default: return null;
		}
	});

	const tooWeak = $derived(strengthScore >= 0 && strengthScore < 3);

	function shake(which: 'passphrase' | 'confirm') {
		if (which === 'passphrase') {
			shakingPassphrase = true;
			setTimeout(() => (shakingPassphrase = false), 400);
		} else {
			shakingConfirm = true;
			setTimeout(() => (shakingConfirm = false), 400);
		}
	}

	function handlePassphraseEnter() {
		if (tooWeak || !passphraseStore.passphrase) {
			shake('passphrase');
		} else {
			document.getElementById('confirmPassphrase')?.focus();
		}
	}

	function handleConfirmEnter() {
		if (tooWeak || !matched) {
			shake('confirm');
		} else {
			passphraseStore.confirmPassphrase();
		}
	}
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col gap-1.5">
		<label class="text-xs font-bold text-ink-2" for="masterPassphrase">Master passphrase</label>
		<div class="relative" class:shake={shakingPassphrase}>
			<input
				id="masterPassphrase"
				type={passphraseVisible ? 'text' : 'password'}
				placeholder="Your passphrase"
				autocomplete="off"
				class="w-full font-sans text-[14.5px] font-medium text-ink bg-surface border-[1.5px] border-border rounded-[10px] px-[13px] py-[10px] pr-10 outline-none appearance-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted placeholder:font-normal focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-dim)]"
				bind:value={passphraseStore.passphrase}
				onkeydown={(e) => e.key === 'Enter' && handlePassphraseEnter()}
			/>
			<button
				type="button"
				class="absolute right-[10px] top-1/2 -translate-y-1/2 bg-none border-none text-muted cursor-pointer p-1 flex items-center transition-colors duration-[120ms] hover:text-ink-2"
				aria-label={passphraseVisible ? 'Hide passphrase' : 'Show passphrase'}
				onclick={() => (passphraseVisible = !passphraseVisible)}
			>
				{#if passphraseVisible}
					<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
				{:else}
					<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
				{/if}
			</button>
		</div>

		{#if strengthMeta}
			<div transition:slide={{ duration: 150 }} class="flex items-center gap-2">
				<div class="flex gap-[3px] flex-1">
					{#each { length: 5 } as _, i}
						<div
							class="h-[3px] flex-1 rounded-full transition-[background] duration-200"
							style="background: {i < strengthMeta.bars ? strengthMeta.color : 'var(--border)'}"
						></div>
					{/each}
				</div>
				<span class="text-[11px] font-semibold" style="color: {strengthMeta.color}">{strengthMeta.label}</span>
			</div>
		{/if}
	</div>

	{#if !passphraseStore.confirmed}
		<div transition:slide={{ duration: 200 }} class="flex flex-col gap-4">
			<div class="flex flex-col gap-1.5">
				<label class="text-xs font-bold text-ink-2" for="confirmPassphrase">Confirm passphrase</label>
				<div class="relative" class:shake={shakingConfirm}>
					<input
						id="confirmPassphrase"
						type={confirmVisible ? 'text' : 'password'}
						placeholder="Repeat your passphrase"
						autocomplete="off"
						class="w-full font-sans text-[14.5px] font-medium text-ink bg-surface border-[1.5px] rounded-[10px] px-[13px] py-[10px] pr-10 outline-none appearance-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted placeholder:font-normal {passphraseStore.mismatch ? 'border-red shadow-[0_0_0_3px_var(--red-dim)] focus:border-red' : 'border-border focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-dim)]'}"
						bind:value={passphraseStore.confirm}
						onkeydown={(e) => e.key === 'Enter' && handleConfirmEnter()}
					/>
					<button
						type="button"
						class="absolute right-[10px] top-1/2 -translate-y-1/2 bg-none border-none text-muted cursor-pointer p-1 flex items-center transition-colors duration-[120ms] hover:text-ink-2"
						aria-label={confirmVisible ? 'Hide passphrase' : 'Show passphrase'}
						onclick={() => (confirmVisible = !confirmVisible)}
					>
						{#if confirmVisible}
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
						{:else}
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
						{/if}
					</button>
				</div>
				{#if passphraseStore.mismatch}
					<p class="text-xs text-red">Passphrases don't match</p>
				{/if}
			</div>

			<label class="flex items-center gap-2.5 cursor-pointer select-none group">
				<div class="relative flex-shrink-0">
					<input
						type="checkbox"
						class="sr-only peer"
						bind:checked={trustStore.trusted}
					/>
					<div class="w-[34px] h-[18px] rounded-full border border-border bg-surface-alt transition-[background,border-color] duration-150 peer-checked:bg-accent peer-checked:border-accent"></div>
					<div class="absolute top-[3px] left-[3px] w-3 h-3 rounded-full bg-muted transition-[transform,background] duration-150 peer-checked:translate-x-4 peer-checked:bg-white"></div>
				</div>
				<span class="flex items-center gap-1.5 text-[12.5px] font-medium text-muted transition-colors duration-[120ms] group-hover:text-ink-2">
					<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
					Remember on this device
				</span>
			</label>

			<button
				type="button"
				class="w-full font-sans text-[14px] font-bold text-white bg-accent border-none rounded-[10px] px-5 py-[11px] cursor-pointer transition-[background,opacity] duration-150 hover:not-disabled:bg-accent-hi disabled:opacity-50 disabled:cursor-default focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[3px]"
				disabled={!passphraseStore.passphrase || !passphraseStore.confirm || passphraseStore.mismatch || passphraseStore.isDerivingKey || tooWeak}
				onclick={passphraseStore.confirmPassphrase}
			>
				{passphraseStore.isDerivingKey ? 'Unlocking…' : tooWeak ? 'Passphrase too weak' : 'Confirm passphrase'}
			</button>
		</div>
	{/if}
</div>

<style>
	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		20%       { transform: translateX(-5px); }
		40%       { transform: translateX(5px); }
		60%       { transform: translateX(-3px); }
		80%       { transform: translateX(3px); }
	}

	.shake {
		animation: shake 0.4s ease-in-out;
	}
</style>
