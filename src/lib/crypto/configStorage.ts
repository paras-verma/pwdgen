import { argon2id } from 'hash-wasm';
import type { AlgorithmVersion } from './passwordDerivation';
import { trustStore } from '$lib/stores/trustStore.svelte';

export const CONFIG_STORAGE_KEY = 'pwdgen-config';
const ARGON2_SALT = 'pwdgen-config-v2';
const LEGACY_PBKDF2_SALT = 'pwdgen-config-storage-v1';
const LEGACY_PBKDF2_ITERATIONS = 100000;

let pendingImport: StoredConfigV1 | StoredConfigV2 | null = null;

export function setPendingImport(data: StoredConfigV1 | StoredConfigV2): void {
	pendingImport = data;
}

export interface VendorSettings {
	length: number;
	disallowedChars: string;
	lastCopiedIndex: number | null;
	version: AlgorithmVersion;
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

interface StoredVendorEntryV2 {
	nameId: string;
	ciphertext: string;
}

interface StoredConfigV2 {
	version: 2;
	vendors: StoredVendorEntryV2[];
}

interface StoredVendorEntryV1 {
	name: string;
	ciphertext: string;
}

export interface StoredConfigV1 {
	version: 1;
	vendors: StoredVendorEntryV1[];
}

export const DEFAULT_VENDOR_SETTINGS: VendorSettings = {
	length: 16,
	disallowedChars: '',
	lastCopiedIndex: null,
	version: 'v3'
};

export async function deriveConfigKey(passphrase: string): Promise<CryptoKey> {
	const encoder = new TextEncoder();
	const raw = await argon2id({
		password: encoder.encode(passphrase),
		salt: encoder.encode(ARGON2_SALT),
		parallelism: 1,
		iterations: 3,
		memorySize: 16384,
		hashLength: 32,
		outputType: 'binary'
	});
	return crypto.subtle.importKey(
		'raw',
		(raw as Uint8Array).slice(0, 32),
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	);
}

async function deriveConfigKeyLegacy(passphrase: string): Promise<CryptoKey> {
	const encoder = new TextEncoder();
	const base = await crypto.subtle.importKey(
		'raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']
	);
	return crypto.subtle.deriveKey(
		{ name: 'PBKDF2', salt: encoder.encode(LEGACY_PBKDF2_SALT), iterations: LEGACY_PBKDF2_ITERATIONS, hash: 'SHA-512' },
		base,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	);
}

async function nameId(vendorName: string): Promise<string> {
	const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(vendorName));
	return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function encryptEntry(data: object, key: CryptoKey): Promise<string> {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const plaintext = new TextEncoder().encode(JSON.stringify(data));
	const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
	const combined = new Uint8Array(12 + ciphertext.byteLength);
	combined.set(iv);
	combined.set(new Uint8Array(ciphertext), 12);
	return btoa(String.fromCharCode(...combined));
}

async function decryptEntry<T>(encoded: string, key: CryptoKey): Promise<T | null> {
	try {
		const combined = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
		const iv = combined.slice(0, 12);
		const ciphertext = combined.slice(12);
		const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
		return JSON.parse(new TextDecoder().decode(plaintext)) as T;
	} catch {
		return null;
	}
}

function loadRaw(): StoredConfigV1 | StoredConfigV2 | null {
	const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

async function migrateV1(stored: StoredConfigV1, passphrase: string, newKey: CryptoKey): Promise<StoredConfigV2> {
	const legacyKey = await deriveConfigKeyLegacy(passphrase);
	const vendors: StoredVendorEntryV2[] = [];

	for (const entry of stored.vendors) {
		type LegacySettings = VendorSettings & { count?: number };
		const settings = await decryptEntry<LegacySettings>(entry.ciphertext, legacyKey);
		const data = {
			name: entry.name,
			length: settings?.length ?? DEFAULT_VENDOR_SETTINGS.length,
			disallowedChars: settings?.disallowedChars ?? DEFAULT_VENDOR_SETTINGS.disallowedChars,
			lastCopiedIndex: settings?.lastCopiedIndex ?? null,
			version: settings?.version ?? DEFAULT_VENDOR_SETTINGS.version
		};
		vendors.push({ nameId: await nameId(entry.name), ciphertext: await encryptEntry(data, newKey) });
	}

	const v2: StoredConfigV2 = { version: 2, vendors };
	localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(v2));
	return v2;
}

function loadStoredV2(): StoredConfigV2 {
	const raw = loadRaw();
	if (raw?.version === 2) return raw;
	return { version: 2, vendors: [] };
}

export async function loadVendors(configKey: CryptoKey, passphrase: string): Promise<Vendor[]> {
	let stored: StoredConfigV1 | StoredConfigV2 | null;

	if (pendingImport) {
		stored = pendingImport;
		pendingImport = null;
	} else if (!trustStore.trusted) {
		return [];
	} else {
		stored = loadRaw();
		if (!stored) return [];
	}

	if (stored.version === 1) {
		stored = await migrateV1(stored, passphrase, configKey);
	}

	type VendorData = { name: string } & VendorSettings;

	return Promise.all(
		stored.vendors.map(async (entry): Promise<Vendor> => {
			const data = await decryptEntry<VendorData>(entry.ciphertext, configKey);
			if (data?.name) {
				return {
					name: data.name,
					locked: false,
					length: data.length ?? DEFAULT_VENDOR_SETTINGS.length,
					disallowedChars: data.disallowedChars ?? DEFAULT_VENDOR_SETTINGS.disallowedChars,
					lastCopiedIndex: data.lastCopiedIndex ?? null,
					version: data.version === 'v3' ? 'v3' : data.version === 'v2' ? 'v2' : 'v1'
				};
			}
			return { name: '(locked)', locked: true };
		})
	);
}

export async function saveVendor(vendorName: string, settings: VendorSettings, configKey: CryptoKey): Promise<void> {
	if (!trustStore.trusted) return;
	const stored = loadStoredV2();
	const id = await nameId(vendorName);
	const ciphertext = await encryptEntry({ name: vendorName, ...settings }, configKey);
	const existingIndex = stored.vendors.findIndex((v) => v.nameId === id);

	if (existingIndex >= 0) {
		stored.vendors[existingIndex] = { nameId: id, ciphertext };
	} else {
		stored.vendors.push({ nameId: id, ciphertext });
	}

	localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(stored));
}

export async function deleteVendor(vendorName: string): Promise<void> {
	if (!trustStore.trusted) return;
	const stored = loadStoredV2();
	const id = await nameId(vendorName);
	stored.vendors = stored.vendors.filter((v) => v.nameId !== id);
	localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(stored));
}
