import { browser } from '$app/environment';

const THEME_STORAGE_KEY = 'pwdgen-theme';

export type Theme = 'light' | 'system' | 'dark';

function createThemeStore() {
	let currentTheme = $state<Theme>(
		(browser ? (localStorage.getItem(THEME_STORAGE_KEY) as Theme) : null) ?? 'system'
	);

	$effect.root(() => {
		$effect(() => {
			if (!browser) return;
			document.documentElement.dataset.theme = currentTheme;
			localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
		});
	});

	return {
		get value() {
			return currentTheme;
		},
		set(theme: Theme) {
			currentTheme = theme;
		}
	};
}

export const themeStore = createThemeStore();
