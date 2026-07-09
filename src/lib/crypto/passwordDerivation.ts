import { generateV1 } from './algo/v1';
import { generateV2 } from './algo/v2';
import { generateV3 } from './algo/v3';

export type AlgorithmVersion = 'v1' | 'v2' | 'v3';

export async function generatePasswords(
	vendorName: string,
	passphrase: string,
	count = 5,
	length = 16,
	disallowedChars = '',
	version: AlgorithmVersion = 'v3'
): Promise<string[]> {
	if (version === 'v1') return generateV1(vendorName, passphrase, count, length, disallowedChars);
	if (version === 'v2') return generateV2(vendorName, passphrase, count, length, disallowedChars);
	return generateV3(vendorName, passphrase, count, length, disallowedChars);
}
