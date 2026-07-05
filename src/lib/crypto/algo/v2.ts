// DO NOT MODIFY — any change here alters existing v2 passwords for all users.
import { START_ITERATIONS, MAX_ATTEMPTS, deriveKeyMaterial, encryptWithAesCbc } from './shared';

const FULL_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^*_+-:,.?/!&()';
const ALL_DIGITS = [...'0123456789'];
const ALL_SPECIALS = [...'@#$%^*_+-:,.?/!&()'];

function buildAlphabet(disallowedChars: string): string {
	return [...FULL_ALPHABET].filter((c) => !disallowedChars.includes(c)).join('');
}

function mapBytesToAlphabet(bytes: Uint8Array, alphabet: string, length: number): string {
	let result = '';
	for (const byte of bytes) {
		if (result.length >= length) break;
		result += alphabet[byte % alphabet.length];
	}
	return result;
}

function passesComplexity(candidate: string, disallowedChars: string): boolean {
	const allowedDigits = ALL_DIGITS.filter((c) => !disallowedChars.includes(c));
	const allowedSpecials = ALL_SPECIALS.filter((c) => !disallowedChars.includes(c));
	return (
		(allowedDigits.length === 0 || allowedDigits.some((d) => candidate.includes(d))) &&
		(allowedSpecials.length === 0 || allowedSpecials.some((s) => candidate.includes(s)))
	);
}

export async function generateV2(
	vendorName: string,
	passphrase: string,
	count: number,
	length: number,
	disallowedChars: string
): Promise<string[]> {
	const passwords: string[] = [];
	const alphabet = buildAlphabet(disallowedChars);
	let iterations = START_ITERATIONS;
	let attempts = 0;

	while (passwords.length < count && attempts < MAX_ATTEMPTS) {
		attempts++;
		const plaintext = new TextEncoder().encode(vendorName + '\n');
		const keyMaterial = await deriveKeyMaterial(passphrase, iterations);
		const encrypted = await encryptWithAesCbc(plaintext, keyMaterial);
		const candidate = mapBytesToAlphabet(encrypted, alphabet, length);
		iterations++;
		if (!passesComplexity(candidate, disallowedChars)) continue;
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
