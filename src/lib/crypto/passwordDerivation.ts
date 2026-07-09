import { generateV1 } from './algo/v1';
import { generateV2 } from './algo/v2';
import { generateV3 } from './algo/v3';

export type AlgorithmVersion = 'v1' | 'v2' | 'v3';

export async function generatePasswords(
	vendorName: string,
	passphrase: string,
	length = 16,
	disallowedChars = '',
	version: AlgorithmVersion = 'v3',
	startIndex = 0
): Promise<string[]> {
	const count = 5;
	if (version === 'v1') return generateV1(vendorName, passphrase, count, length, disallowedChars, startIndex);
	if (version === 'v2') return generateV2(vendorName, passphrase, count, length, disallowedChars, startIndex);
	return generateV3(vendorName, passphrase, count, length, disallowedChars, startIndex);
}
