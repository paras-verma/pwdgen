import type { AlgorithmVersion } from '$lib/crypto/passwordDerivation';

function createSessionSettingsStore() {
	let length = $state(16);
	let disallowedChars = $state('');
	let version = $state<AlgorithmVersion>('v3');

	return {
		get length() { return length; },
		set length(v: number) { length = v; },
		get disallowedChars() { return disallowedChars; },
		set disallowedChars(v: string) { disallowedChars = v; },
		get version() { return version; },
		set version(v: AlgorithmVersion) { version = v; },
		reset() {
			length = 16;
			disallowedChars = '';
			version = 'v3';
		}
	};
}

export const sessionSettingsStore = createSessionSettingsStore();
