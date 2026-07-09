import { describe, it, expect, beforeEach, vi } from 'vitest';
import { deriveConfigKey, saveVendor, loadVendors, deleteVendor, DEFAULT_VENDOR_SETTINGS } from './configStorage';

const mockStorage: Record<string, string> = {};

beforeEach(() => {
	Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => mockStorage[key] ?? null,
		setItem: (key: string, value: string) => { mockStorage[key] = value; },
		removeItem: (key: string) => { delete mockStorage[key]; }
	});
	vi.stubGlobal('trustStore', { trusted: true });
});

describe('configStorage', () => {
	it('encrypts and decrypts vendor settings round-trip', async () => {
		const key = await deriveConfigKey('test-passphrase');
		const settings = { ...DEFAULT_VENDOR_SETTINGS, length: 20 };

		await saveVendor('github', settings, key);
		const vendors = await loadVendors(key, 'test-passphrase');

		expect(vendors).toHaveLength(1);
		expect(vendors[0].name).toBe('github');
		expect(vendors[0].locked).toBe(false);
		if (!vendors[0].locked) {
			expect(vendors[0].length).toBe(20);
		}
	});

	it('marks vendor as locked when decrypted with wrong passphrase', async () => {
		const correctKey = await deriveConfigKey('correct-passphrase');
		const wrongKey = await deriveConfigKey('wrong-passphrase');

		await saveVendor('aws', DEFAULT_VENDOR_SETTINGS, correctKey);
		const vendors = await loadVendors(wrongKey, 'wrong-passphrase');

		expect(vendors).toHaveLength(1);
		expect(vendors[0].locked).toBe(true);
	});

	it('handles mixed locked and unlocked vendors', async () => {
		const key1 = await deriveConfigKey('passphrase-one');
		const key2 = await deriveConfigKey('passphrase-two');

		await saveVendor('github', DEFAULT_VENDOR_SETTINGS, key1);
		await saveVendor('gcloud', DEFAULT_VENDOR_SETTINGS, key2);

		const vendorsWithKey1 = await loadVendors(key1, 'passphrase-one');
		expect(vendorsWithKey1.find((v) => v.name === 'github')?.locked).toBe(false);
		expect(vendorsWithKey1.find((v) => v.name === 'gcloud')?.locked).toBe(true);
	});

	it('deletes a vendor', async () => {
		const key = await deriveConfigKey('passphrase');
		await saveVendor('github', DEFAULT_VENDOR_SETTINGS, key);
		await saveVendor('netflix', DEFAULT_VENDOR_SETTINGS, key);

		await deleteVendor('github');
		const vendors = await loadVendors(key, 'passphrase');

		expect(vendors).toHaveLength(1);
		expect(vendors[0].name).toBe('netflix');
	});

	it('updates lastCopiedIndex on save', async () => {
		const key = await deriveConfigKey('passphrase');
		await saveVendor('github', { ...DEFAULT_VENDOR_SETTINGS, lastCopiedIndex: 2 }, key);

		const vendors = await loadVendors(key, 'passphrase');
		expect(vendors[0].locked).toBe(false);
		if (!vendors[0].locked) {
			expect(vendors[0].lastCopiedIndex).toBe(2);
		}
	});
});
