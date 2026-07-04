export type AlgorithmMode = 'legacy' | 'latest';

function toFixedArrayBuffer(source: Uint8Array): ArrayBuffer {
	return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength) as ArrayBuffer;
}

const START_ITERATIONS = 100000;
const MAX_ATTEMPTS = 300;

const digitPattern = /[0-9]/;
const specialCharPattern = /[@#$%^*_+\-:,.?/]/;

async function deriveKeyMaterial(passphrase: string, iterations: number): Promise<Uint8Array> {
	const encoder = new TextEncoder();
	const passphraseKey = await crypto.subtle.importKey(
		'raw',
		encoder.encode(passphrase),
		{ name: 'PBKDF2' },
		false,
		['deriveBits']
	);

	const bits = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', hash: 'SHA-512', salt: new Uint8Array(0), iterations },
		passphraseKey,
		48 * 8
	);

	return new Uint8Array(bits);
}

async function encryptWithAesCbc(plaintext: Uint8Array, keyMaterial: Uint8Array): Promise<Uint8Array> {
	const keyBytes = new Uint8Array(keyMaterial.slice(0, 32));
	const ivBytes = new Uint8Array(keyMaterial.slice(32, 48));

	const aesKey = await crypto.subtle.importKey(
		'raw',
		toFixedArrayBuffer(keyBytes),
		{ name: 'AES-CBC' },
		false,
		['encrypt']
	);

	const ciphertext = await crypto.subtle.encrypt(
		{ name: 'AES-CBC', iv: toFixedArrayBuffer(ivBytes) },
		aesKey,
		toFixedArrayBuffer(plaintext)
	);

	return new Uint8Array(ciphertext);
}

function encryptedBytesToBase64(bytes: Uint8Array): string {
	return btoa(String.fromCharCode(...bytes));
}

function buildCustomAlphabet(disallowedChars: string): string {
	const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
	const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const digits = '0123456789';
	const specialChars = '@#$%^*_+-:,.?/!&()';
	const fullAlphabet = lowercaseLetters + uppercaseLetters + digits + specialChars;
	return [...fullAlphabet].filter((char) => !disallowedChars.includes(char)).join('');
}

function mapBytesToAlphabet(bytes: Uint8Array, alphabet: string, length: number): string {
	const alphabetLength = alphabet.length;
	let result = '';
	for (const byte of bytes) {
		if (result.length >= length) break;
		result += alphabet[byte % alphabetLength];
	}
	return result;
}

function passesComplexityCheck(candidate: string, disallowedChars: string): boolean {
	const allowedDigits = [...'0123456789'].filter((c) => !disallowedChars.includes(c));
	const allowedSpecials = [...'@#$%^*_+-:,.?/!&()'].filter((c) => !disallowedChars.includes(c));

	const hasRequiredDigit = allowedDigits.length === 0 || allowedDigits.some((d) => candidate.includes(d));
	const hasRequiredSpecial =
		allowedSpecials.length === 0 || allowedSpecials.some((s) => candidate.includes(s));

	return hasRequiredDigit && hasRequiredSpecial;
}

async function deriveLegacyCandidate(
	vendorName: string,
	passphrase: string,
	iterations: number,
	length: number
): Promise<string> {
	const encoder = new TextEncoder();
	const plaintext = encoder.encode(vendorName + '\n');
	const keyMaterial = await deriveKeyMaterial(passphrase, iterations);
	const encrypted = await encryptWithAesCbc(plaintext, keyMaterial);
	return encryptedBytesToBase64(encrypted).slice(0, length);
}

async function deriveLatestCandidate(
	vendorName: string,
	passphrase: string,
	iterations: number,
	length: number,
	alphabet: string
): Promise<string> {
	const encoder = new TextEncoder();
	const plaintext = encoder.encode(vendorName + '\n');
	const keyMaterial = await deriveKeyMaterial(passphrase, iterations);
	const encrypted = await encryptWithAesCbc(plaintext, keyMaterial);
	return mapBytesToAlphabet(encrypted, alphabet, length);
}

export async function generatePasswords(
	vendorName: string,
	passphrase: string,
	count = 5,
	length = 16,
	disallowedChars = '',
	mode: AlgorithmMode = 'legacy'
): Promise<string[]> {
	const passwords: string[] = [];
	let iterations = START_ITERATIONS;
	let attempts = 0;

	const alphabet = mode === 'latest' ? buildCustomAlphabet(disallowedChars) : '';

	while (passwords.length < count && attempts < MAX_ATTEMPTS) {
		attempts++;

		const candidate =
			mode === 'legacy'
				? await deriveLegacyCandidate(vendorName, passphrase, iterations, length)
				: await deriveLatestCandidate(vendorName, passphrase, iterations, length, alphabet);

		iterations++;

		if (mode === 'legacy') {
			if (!digitPattern.test(candidate) || !specialCharPattern.test(candidate)) continue;
			if (disallowedChars && [...candidate].some((c) => disallowedChars.includes(c))) continue;
		} else {
			if (!passesComplexityCheck(candidate, disallowedChars)) continue;
		}

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
