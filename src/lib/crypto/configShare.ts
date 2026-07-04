const CONFIG_STORAGE_KEY = 'pwdgen-config';

export function encodeConfigForShare(): string | null {
	const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
	if (!raw) return null;
	return btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function getShareUrl(encoded: string): string {
	return `${window.location.href.split('#')[0]}#config=${encoded}`;
}

export function detectImportFragment(): string | null {
	const hash = window.location.hash;
	if (!hash.startsWith('#config=')) return null;
	return hash.slice('#config='.length);
}

export function importEncodedConfig(encoded: string): void {
	try {
		const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
		const padding = (4 - (padded.length % 4)) % 4;
		const json = atob(padded + '='.repeat(padding));
		JSON.parse(json); // validate it's parseable JSON
		localStorage.setItem(CONFIG_STORAGE_KEY, json);
	} catch {
		throw new Error('Invalid config data in URL');
	}
}

export function clearShareFragment(): void {
	history.replaceState(null, '', window.location.pathname + window.location.search);
}
