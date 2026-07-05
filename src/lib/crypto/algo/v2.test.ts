import { describe, it, expect } from 'vitest';
import { generateV2 } from './v2';

describe('v2 algorithm — frozen snapshot', () => {
	it('generates known passwords for github / correct-horse-battery-staple / len=16 / count=3', async () => {
		const result = await generateV2('github', 'correct-horse-battery-staple', 3, 16, '');
		expect(result).toEqual(['Sa9az*bjDFky4zw3', '-Q_86W7DrU7WZ@4*', 'Ssyu!19M)jkgmy1M']);
	});

	it('generates known passwords for aws / correct-horse-battery-staple / len=16 / count=3', async () => {
		const result = await generateV2('aws', 'correct-horse-battery-staple', 3, 16, '');
		expect(result).toEqual(['ldL%6_Lcurc#Cl_E', 'JhGC(,9pAj-AS?uZ', '0)aiXH(gMZHEH1:k']);
	});

	it('generates known passwords for netflix / hunter2 / len=12 / count=2', async () => {
		const result = await generateV2('netflix', 'hunter2', 2, 12, '');
		expect(result).toEqual(['*sN,yL_8A,2g', ':M!CD-0f_bUq']);
	});

	it('respects disallowedChars — no / in output', async () => {
		const result = await generateV2('github', 'correct-horse-battery-staple', 2, 16, '/');
		expect(result).toEqual(['Sb@az+emFFnz4Bx3', ':Q+98Y7FsU9X1@6+']);
		expect(result.every((p) => !p.includes('/'))).toBe(true);
	});

	it('every generated password contains a digit', async () => {
		const result = await generateV2('github', 'correct-horse-battery-staple', 3, 16, '');
		expect(result.every((p) => /[0-9]/.test(p))).toBe(true);
	});

	it('every generated password contains a special character from v2 alphabet', async () => {
		const result = await generateV2('github', 'correct-horse-battery-staple', 3, 16, '');
		expect(result.every((p) => /[@#$%^*_+\-:,.?/!&()]/.test(p))).toBe(true);
	});

	it('different vendors produce different passwords', async () => {
		const github = await generateV2('github', 'correct-horse-battery-staple', 1, 16, '');
		const aws = await generateV2('aws', 'correct-horse-battery-staple', 1, 16, '');
		expect(github[0]).not.toBe(aws[0]);
	});

	it('different passphrases produce different passwords', async () => {
		const r1 = await generateV2('github', 'passphrase-one', 1, 16, '');
		const r2 = await generateV2('github', 'passphrase-two', 1, 16, '');
		expect(r1[0]).not.toBe(r2[0]);
	});

	it('is deterministic — same inputs always yield same outputs', async () => {
		const a = await generateV2('github', 'correct-horse-battery-staple', 3, 16, '');
		const b = await generateV2('github', 'correct-horse-battery-staple', 3, 16, '');
		expect(a).toEqual(b);
	});

	it('only uses characters from the v2 alphabet', async () => {
		const alphabet = new Set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^*_+-:,.?/!&()');
		const result = await generateV2('github', 'correct-horse-battery-staple', 3, 16, '');
		expect(result.every((p) => [...p].every((c) => alphabet.has(c)))).toBe(true);
	});
});
