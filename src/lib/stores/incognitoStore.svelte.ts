function createIncognitoStore() {
	let value = $state(false);
	return {
		get value() {
			return value;
		},
		set value(v: boolean) {
			value = v;
		}
	};
}

export const incognitoStore = createIncognitoStore();
