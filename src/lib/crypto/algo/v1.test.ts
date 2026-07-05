import { describe, it, expect } from 'vitest';
import { generateV1 } from './v1';

describe('v1 algorithm — frozen snapshot', () => {
	it('generates known passwords for github / correct-horse-battery-staple / len=16 / count=3', async () => {
		const result = await generateV1('github', 'correct-horse-battery-staple', 3, 16, '');
		expect(result).toEqual(['LFCNABnj8fm9H/po', 'L/xSN6sfsyrE1/Fx', 'D5+cf19OTQ0abHoh']);
	});

	it('generates known passwords for aws / correct-horse-battery-staple / len=16 / count=3', async () => {
		const result = await generateV1('aws', 'correct-horse-battery-staple', 3, 16, '');
		expect(result).toEqual(['I/cgbO7ojV+6+eZq', 'hJ/wqIHBTqZ203G+', 'E6yVqOljhiGJPdS/']);
	});

	it('generates known passwords for netflix / hunter2 / len=12 / count=2', async () => {
		const result = await generateV1('netflix', 'hunter2', 2, 12, '');
		expect(result).toEqual(['/7qFDG8WhdzN', 'oG+OSdBrmk7y']);
	});

	it('respects disallowedChars — no / in output', async () => {
		const result = await generateV1('github', 'correct-horse-battery-staple', 2, 16, '/');
		expect(result).toEqual(['D5+cf19OTQ0abHoh', 'koKziH+JA7zBpuNc']);
		expect(result.every((p) => !p.includes('/'))).toBe(true);
	});

	it('every generated password contains a digit', async () => {
		const result = await generateV1('github', 'correct-horse-battery-staple', 3, 16, '');
		expect(result.every((p) => /[0-9]/.test(p))).toBe(true);
	});

	it('every generated password contains a special character', async () => {
		const result = await generateV1('github', 'correct-horse-battery-staple', 3, 16, '');
		expect(result.every((p) => /[@#$%^*_+\-:,.?/]/.test(p))).toBe(true);
	});

	it('different vendors produce different passwords', async () => {
		const github = await generateV1('github', 'correct-horse-battery-staple', 1, 16, '');
		const aws = await generateV1('aws', 'correct-horse-battery-staple', 1, 16, '');
		expect(github[0]).not.toBe(aws[0]);
	});

	it('different passphrases produce different passwords', async () => {
		const r1 = await generateV1('github', 'passphrase-one', 1, 16, '');
		const r2 = await generateV1('github', 'passphrase-two', 1, 16, '');
		expect(r1[0]).not.toBe(r2[0]);
	});

	it('is deterministic — same inputs always yield same outputs', async () => {
		const a = await generateV1('github', 'correct-horse-battery-staple', 3, 16, '');
		const b = await generateV1('github', 'correct-horse-battery-staple', 3, 16, '');
		expect(a).toEqual(b);
	});
});
