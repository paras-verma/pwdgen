import { generateV1 } from './algo/v1';
import { generateV2 } from './algo/v2';

export type AlgorithmVersion = 'v1' | 'v2';

export async function generatePasswords(
	vendorName: string,
	passphrase: string,
	count = 5,
	length = 16,
	disallowedChars = '',
	version: AlgorithmVersion = 'v1'
): Promise<string[]> {
	if (version === 'v1') {
		return generateV1(vendorName, passphrase, count, length, disallowedChars);
	}
	return generateV2(vendorName, passphrase, count, length, disallowedChars);
}
