import { browser } from '$app/environment';
import {
	loadVendors,
	saveVendor,
	deleteVendor,
	DEFAULT_VENDOR_SETTINGS,
	type Vendor,
	type VendorSettings
} from '$lib/crypto/configStorage';

function createConfigStore() {
	let vendors = $state<Vendor[]>([]);
	let selectedVendorName = $state<string | null>(null);
	let isLoading = $state(false);

	const selectedVendor = $derived(
		vendors.find((v) => v.name === selectedVendorName) ?? null
	);

	async function loadFromStorage(configKey: CryptoKey) {
		if (!browser) return;
		isLoading = true;
		try {
			vendors = await loadVendors(configKey);
			if (vendors.length > 0 && !selectedVendorName) {
				selectedVendorName = vendors[0].name;
			}
		} finally {
			isLoading = false;
		}
	}

	async function addVendor(name: string, configKey: CryptoKey) {
		const trimmedName = name.trim();
		if (!trimmedName || vendors.some((v) => v.name === trimmedName)) return;

		await saveVendor(trimmedName, DEFAULT_VENDOR_SETTINGS, configKey);
		vendors = [
			...vendors,
			{ name: trimmedName, locked: false, ...DEFAULT_VENDOR_SETTINGS }
		];
		selectedVendorName = trimmedName;
	}

	async function removeVendor(name: string) {
		deleteVendor(name);
		vendors = vendors.filter((v) => v.name !== name);
		if (selectedVendorName === name) {
			selectedVendorName = vendors.length > 0 ? vendors[0].name : null;
		}
	}

	async function updateVendorSettings(
		name: string,
		settings: Partial<VendorSettings>,
		configKey: CryptoKey
	) {
		const vendor = vendors.find((v) => v.name === name);
		if (!vendor || vendor.locked) return;

		const updatedSettings: VendorSettings = {
			length: vendor.length,
			count: vendor.count,
			disallowedChars: vendor.disallowedChars,
			lastCopiedIndex: vendor.lastCopiedIndex,
			...settings
		};

		await saveVendor(name, updatedSettings, configKey);
		vendors = vendors.map((v) =>
			v.name === name ? { ...v, locked: false, ...updatedSettings } : v
		);
	}

	async function upsertVendor(name: string, settings: VendorSettings, configKey: CryptoKey) {
		const trimmedName = name.trim();
		if (!trimmedName) return;

		await saveVendor(trimmedName, settings, configKey);

		const updatedEntry: Vendor = { name: trimmedName, locked: false, ...settings };
		const existingIndex = vendors.findIndex((v) => v.name === trimmedName);

		if (existingIndex >= 0) {
			vendors = vendors.map((v, i) => (i === existingIndex ? updatedEntry : v));
		} else {
			vendors = [...vendors, updatedEntry];
			selectedVendorName = trimmedName;
		}
	}

	function selectVendor(name: string) {
		selectedVendorName = name;
	}

	function reset() {
		vendors = [];
		selectedVendorName = null;
	}

	return {
		get vendors() {
			return vendors;
		},
		get selectedVendorName() {
			return selectedVendorName;
		},
		get selectedVendor() {
			return selectedVendor;
		},
		get isLoading() {
			return isLoading;
		},
		loadFromStorage,
		addVendor,
		removeVendor,
		updateVendorSettings,
		upsertVendor,
		selectVendor,
		reset
	};
}

export const configStore = createConfigStore();
