const CONFIG_STORAGE_KEY = 'pwdgen-config';
const CONFIG_KEY_DERIVATION_SALT = 'pwdgen-config-storage-v1';
const PBKDF2_ITERATIONS = 100000;

export interface VendorSettings {
	length: number;
	count: number;
	disallowedChars: string;
	lastCopiedIndex: number | null;
}

export interface DecryptedVendor extends VendorSettings {
	name: string;
	locked: false;
}

export interface LockedVendor {
	name: string;
	locked: true;
}

export type Vendor = DecryptedVendor | LockedVendor;

interface StoredVendorEntry {
	name: string;
	ciphertext: string;
}

interface StoredConfig {
	version: 1;
	vendors: StoredVendorEntry[];
}

export const DEFAULT_VENDOR_SETTINGS: VendorSettings = {
	length: 16,
	count: 5,
	disallowedChars: '',
	lastCopiedIndex: null
};

export async function deriveConfigKey(passphrase: string): Promise<CryptoKey> {
	const encoder = new TextEncoder();
	const baseKey = await crypto.subtle.importKey(
		'raw',
		encoder.encode(passphrase),
		'PBKDF2',
		false,
		['deriveKey']
	);

	return crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt: encoder.encode(CONFIG_KEY_DERIVATION_SALT),
			iterations: PBKDF2_ITERATIONS,
			hash: 'SHA-512'
		},
		baseKey,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	);
}

async function encryptVendorSettings(settings: VendorSettings, key: CryptoKey): Promise<string> {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const plaintext = new TextEncoder().encode(JSON.stringify(settings));
	const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);

	const combined = new Uint8Array(12 + ciphertext.byteLength);
	combined.set(iv);
	combined.set(new Uint8Array(ciphertext), 12);

	return btoa(String.fromCharCode(...combined));
}

async function decryptVendorSettings(
	encoded: string,
	key: CryptoKey
): Promise<VendorSettings | null> {
	try {
		const combined = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
		const iv = combined.slice(0, 12);
		const ciphertext = combined.slice(12);
		const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
		const parsed = JSON.parse(new TextDecoder().decode(plaintext));

		if (
			typeof parsed.length === 'number' &&
			typeof parsed.count === 'number' &&
			typeof parsed.disallowedChars === 'string'
		) {
			return parsed as VendorSettings;
		}
		return null;
	} catch {
		return null;
	}
}

function loadStoredConfig(): StoredConfig {
	const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
	if (!raw) return { version: 1, vendors: [] };
	try {
		return JSON.parse(raw) as StoredConfig;
	} catch {
		return { version: 1, vendors: [] };
	}
}

function saveStoredConfig(config: StoredConfig): void {
	localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
}

export async function loadVendors(configKey: CryptoKey): Promise<Vendor[]> {
	const stored = loadStoredConfig();

	return Promise.all(
		stored.vendors.map(async (entry): Promise<Vendor> => {
			const settings = await decryptVendorSettings(entry.ciphertext, configKey);
			if (settings) {
				return { name: entry.name, locked: false, ...settings };
			}
			return { name: entry.name, locked: true };
		})
	);
}

export async function saveVendor(
	vendorName: string,
	settings: VendorSettings,
	configKey: CryptoKey
): Promise<void> {
	const stored = loadStoredConfig();
	const ciphertext = await encryptVendorSettings(settings, configKey);
	const existingIndex = stored.vendors.findIndex((v) => v.name === vendorName);

	if (existingIndex >= 0) {
		stored.vendors[existingIndex] = { name: vendorName, ciphertext };
	} else {
		stored.vendors.push({ name: vendorName, ciphertext });
	}

	saveStoredConfig(stored);
}

export function deleteVendor(vendorName: string): void {
	const stored = loadStoredConfig();
	stored.vendors = stored.vendors.filter((v) => v.name !== vendorName);
	saveStoredConfig(stored);
}
