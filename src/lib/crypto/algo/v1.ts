// DO NOT MODIFY — any change here alters existing v1 passwords for all users.
import { START_ITERATIONS, MAX_ATTEMPTS, deriveKeyMaterial, encryptWithAesCbc } from './shared';

const digitPattern = /[0-9]/;
const specialCharPattern = /[@#$%^*_+\-:,.?/]/;

async function deriveCandidate(
	vendorName: string,
	passphrase: string,
	iterations: number,
	length: number
): Promise<string> {
	const plaintext = new TextEncoder().encode(vendorName + '\n');
	const keyMaterial = await deriveKeyMaterial(passphrase, iterations);
	const encrypted = await encryptWithAesCbc(plaintext, keyMaterial);
	return btoa(String.fromCharCode(...encrypted)).slice(0, length);
}

export async function generateV1(
	vendorName: string,
	passphrase: string,
	count: number,
	length: number,
	disallowedChars: string
): Promise<string[]> {
	const passwords: string[] = [];
	let iterations = START_ITERATIONS;
	let attempts = 0;

	while (passwords.length < count && attempts < MAX_ATTEMPTS) {
		attempts++;
		const candidate = await deriveCandidate(vendorName, passphrase, iterations, length);
		iterations++;
		if (!digitPattern.test(candidate) || !specialCharPattern.test(candidate)) continue;
		if (disallowedChars && [...candidate].some((c) => disallowedChars.includes(c))) continue;
		passwords.push(candidate);
	}

	if (passwords.length < count) {
		throw new Error(
			`Only found ${passwords.length} of ${count} passwords within ${MAX_ATTEMPTS} attempts. ` +
				`Try a longer length or fewer excluded characters.`
		);
	}
	return passwords;
}
