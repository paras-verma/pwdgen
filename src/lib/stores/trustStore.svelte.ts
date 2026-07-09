import { browser } from '$app/environment';

const TRUST_KEY = 'pwdgen-trusted';

function createTrustStore() {
	let trusted = $state(browser ? localStorage.getItem(TRUST_KEY) === '1' : false);

	return {
		get trusted() {
			return trusted;
		},
		set trusted(v: boolean) {
			trusted = v;
			if (browser) {
				if (v) localStorage.setItem(TRUST_KEY, '1');
				else localStorage.removeItem(TRUST_KEY);
			}
		}
	};
}

export const trustStore = createTrustStore();
