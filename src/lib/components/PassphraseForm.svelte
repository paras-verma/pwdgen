<script lang="ts">
	import { slide } from 'svelte/transition';
	import { passphraseStore } from '$lib/stores/passphraseStore.svelte';

	let passphraseVisible = $state(false);
	let confirmVisible = $state(false);

	const matched = $derived(
		passphraseStore.passphrase.length > 0 &&
		passphraseStore.confirm.length > 0 &&
		!passphraseStore.mismatch
	);
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col gap-1.5">
		<label class="text-xs font-bold text-ink-2" for="masterPassphrase">Master passphrase</label>
		<div class="relative">
			<input
				id="masterPassphrase"
				type={passphraseVisible ? 'text' : 'password'}
				placeholder="Your passphrase"
				autocomplete="off"
				class="w-full font-sans text-[14.5px] font-medium text-ink bg-surface border-[1.5px] border-border rounded-[10px] px-[13px] py-[10px] pr-10 outline-none appearance-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted placeholder:font-normal focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-dim)]"
				bind:value={passphraseStore.passphrase}
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
	</div>

	{#if !passphraseStore.confirmed}
		<div transition:slide={{ duration: 200 }} class="flex flex-col gap-4">
			<div class="flex flex-col gap-1.5">
				<label class="text-xs font-bold text-ink-2" for="confirmPassphrase">Confirm passphrase</label>
				<div class="relative">
					<input
						id="confirmPassphrase"
						type={confirmVisible ? 'text' : 'password'}
						placeholder="Repeat your passphrase"
						autocomplete="off"
						class="w-full font-sans text-[14.5px] font-medium text-ink bg-surface border-[1.5px] rounded-[10px] px-[13px] py-[10px] pr-10 outline-none appearance-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted placeholder:font-normal {matched ? 'border-green shadow-[0_0_0_3px_var(--green-dim)] focus:border-green' : passphraseStore.mismatch ? 'border-red shadow-[0_0_0_3px_var(--red-dim)] focus:border-red' : 'border-border focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-dim)]'}"
						bind:value={passphraseStore.confirm}
						onkeydown={(e) => e.key === 'Enter' && passphraseStore.confirmPassphrase()}
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

			<button
				type="button"
				class="w-full font-sans text-[14px] font-bold text-white bg-accent border-none rounded-[10px] px-5 py-[11px] cursor-pointer transition-[background,opacity] duration-150 hover:not-disabled:bg-accent-hi disabled:opacity-50 disabled:cursor-default focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[3px]"
				disabled={!passphraseStore.passphrase || !passphraseStore.confirm || passphraseStore.mismatch || passphraseStore.isDerivingKey}
				onclick={passphraseStore.confirmPassphrase}
			>
				{passphraseStore.isDerivingKey ? 'Unlocking…' : 'Confirm passphrase'}
			</button>
		</div>
	{/if}
</div>
