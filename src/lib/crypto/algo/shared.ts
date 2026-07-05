export const START_ITERATIONS = 100000;
export const MAX_ATTEMPTS = 300;

export function toFixedArrayBuffer(source: Uint8Array): ArrayBuffer {
	return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength) as ArrayBuffer;
}

export async function deriveKeyMaterial(passphrase: string, iterations: number): Promise<Uint8Array> {
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

export async function encryptWithAesCbc(plaintext: Uint8Array, keyMaterial: Uint8Array): Promise<Uint8Array> {
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
