import { argon2id } from 'hash-wasm';

const FULL_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^*_+-:,.?/!&()';
const ALL_DIGITS = [...'0123456789'];
const ALL_SPECIALS = [...'@#$%^*_+-:,.?/!&()'];
const HASH_BYTES = 512;
const MAX_ROUNDS = 20;

function buildAlphabet(disallowedChars: string): string {
	return [...FULL_ALPHABET].filter((c) => !disallowedChars.includes(c)).join('');
}

function passesComplexity(candidate: string, disallowedChars: string): boolean {
	const allowedDigits = ALL_DIGITS.filter((c) => !disallowedChars.includes(c));
	const allowedSpecials = ALL_SPECIALS.filter((c) => !disallowedChars.includes(c));
	return (
		(allowedDigits.length === 0 || allowedDigits.some((d) => candidate.includes(d))) &&
		(allowedSpecials.length === 0 || allowedSpecials.some((s) => candidate.includes(s)))
	);
}

async function deriveBytes(passphrase: string, vendorName: string, round: number): Promise<number[]> {
	const encoder = new TextEncoder();
	const saltStr = `pwdgen-v3:${vendorName}${round > 0 ? `:${round}` : ''}`;
	const raw = await argon2id({
		password: encoder.encode(passphrase),
		salt: encoder.encode(saltStr),
		parallelism: 1,
		iterations: 3,
		memorySize: 16384,
		hashLength: HASH_BYTES,
		outputType: 'binary',
	});
	return Array.from(raw as Uint8Array);
}

export async function generateV3(
	vendorName: string,
	passphrase: string,
	count: number,
	length: number,
	disallowedChars: string
): Promise<string[]> {
	const alphabet = buildAlphabet(disallowedChars);
	const passwords: string[] = [];
	let slot = 0;
	let round = 0;
	let buf: number[] = [];

	while (passwords.length < count) {
		if (slot + length > buf.length) {
			if (round >= MAX_ROUNDS) {
				throw new Error(
					`Only found ${passwords.length} of ${count} passwords within ${MAX_ROUNDS} rounds. ` +
						`Try a longer length or fewer excluded characters.`
				);
			}
			buf = await deriveBytes(passphrase, vendorName, round);
			slot = 0;
			round++;
		}

		const chunk = buf.slice(slot, slot + length);
		slot += length;

		const candidate = chunk.map((b) => alphabet[b % alphabet.length]).join('');

		if (passesComplexity(candidate, disallowedChars)) {
			passwords.push(candidate);
		}
	}

	return passwords;
}
