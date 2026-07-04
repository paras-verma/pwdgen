import { browser } from '$app/environment';
import { deriveConfigKey } from '$lib/crypto/configStorage';

function createPassphraseStore() {
	let passphraseValue = $state('');
	let confirmValue = $state('');
	let configKey = $state<CryptoKey | null>(null);
	let isDerivingKey = $state(false);

	const passphraseConfirmed = $derived(
		passphraseValue.length > 0 && passphraseValue === confirmValue
	);

	const passphrasesMismatch = $derived(
		confirmValue.length > 0 && passphraseValue !== confirmValue
	);

	async function confirmPassphrase() {
		if (!browser || !passphraseConfirmed) return;
		isDerivingKey = true;
		try {
			configKey = await deriveConfigKey(passphraseValue);
		} finally {
			isDerivingKey = false;
		}
	}

	function reset() {
		passphraseValue = '';
		confirmValue = '';
		configKey = null;
	}

	return {
		get passphrase() {
			return passphraseValue;
		},
		set passphrase(v: string) {
			passphraseValue = v;
			if (configKey) {
				configKey = null;
			}
		},
		get confirm() {
			return confirmValue;
		},
		set confirm(v: string) {
			confirmValue = v;
		},
		get confirmed() {
			return passphraseConfirmed && configKey !== null;
		},
		get mismatch() {
			return passphrasesMismatch;
		},
		get isDerivingKey() {
			return isDerivingKey;
		},
		get configKey() {
			return configKey;
		},
		confirmPassphrase,
		reset
	};
}

export const passphraseStore = createPassphraseStore();
