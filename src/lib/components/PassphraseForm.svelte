<script lang="ts">
	import { passphraseStore } from '$lib/stores/passphraseStore.svelte';

	let passphraseVisible = $state(false);
	let confirmVisible = $state(false);
</script>

<div class="passphrase-form">
	<div class="field">
		<label for="masterPassphrase">Master passphrase</label>
		<div class="input-wrap">
			<input
				id="masterPassphrase"
				type={passphraseVisible ? 'text' : 'password'}
				placeholder="Your passphrase"
				autocomplete="off"
				bind:value={passphraseStore.passphrase}
			/>
			<button
				type="button"
				class="peek-btn"
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
		<div class="field">
			<label for="confirmPassphrase">Confirm passphrase</label>
			<div class="input-wrap">
				<input
					id="confirmPassphrase"
					type={confirmVisible ? 'text' : 'password'}
					placeholder="Repeat your passphrase"
					autocomplete="off"
					class:mismatch={passphraseStore.mismatch}
					bind:value={passphraseStore.confirm}
					onkeydown={(e) => e.key === 'Enter' && passphraseStore.confirmPassphrase()}
				/>
				<button
					type="button"
					class="peek-btn"
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
				<p class="mismatch-hint">Passphrases don't match</p>
			{/if}
		</div>

		<button
			type="button"
			class="confirm-btn"
			disabled={!passphraseStore.passphrase || !passphraseStore.confirm || passphraseStore.mismatch || passphraseStore.isDerivingKey}
			onclick={passphraseStore.confirmPassphrase}
		>
			{passphraseStore.isDerivingKey ? 'Unlocking…' : 'Confirm passphrase'}
		</button>
	{/if}
</div>

<style>
	.passphrase-form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	label {
		font-size: 12px;
		font-weight: 700;
		color: var(--ink-2);
	}

	.input-wrap {
		position: relative;
	}

	input[type='text'],
	input[type='password'] {
		width: 100%;
		font-family: 'Manrope', system-ui, sans-serif;
		font-size: 14.5px;
		font-weight: 500;
		color: var(--ink);
		background: var(--surface);
		border: 1.5px solid var(--border);
		border-radius: 10px;
		padding: 10px 40px 10px 13px;
		outline: none;
		transition:
			border-color 0.15s,
			box-shadow 0.15s;
		-webkit-appearance: none;
		appearance: none;
	}

	input::placeholder {
		color: var(--muted);
		font-weight: 400;
	}

	input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-dim);
	}

	input.mismatch {
		border-color: var(--red);
		box-shadow: 0 0 0 3px var(--red-dim);
	}

	.mismatch-hint {
		font-size: 12px;
		color: var(--red);
	}

	.peek-btn {
		position: absolute;
		right: 10px;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		color: var(--muted);
		cursor: pointer;
		padding: 4px;
		display: flex;
		align-items: center;
		transition: color 0.12s;
	}

	.peek-btn:hover {
		color: var(--ink-2);
	}

	.confirm-btn {
		width: 100%;
		font-family: 'Manrope', system-ui, sans-serif;
		font-size: 14px;
		font-weight: 700;
		color: #fff;
		background: var(--accent);
		border: none;
		border-radius: 10px;
		padding: 11px 20px;
		cursor: pointer;
		transition:
			background 0.15s,
			opacity 0.15s;
	}

	.confirm-btn:hover:not(:disabled) {
		background: var(--accent-hi);
	}

	.confirm-btn:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.confirm-btn:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 3px;
	}
</style>
