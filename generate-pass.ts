// Alternative generator using a seeded PRNG (xorshift128+) instead of OpenSSL.
// Deterministic but not compatible with getpwds.sh output.

function generatePasswords(str1: string, str2: string, count: number = 5, length: number = 12): string[] {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const rng     = new PRNG(createSeed(str1, str2));
  const out: string[] = [];

  for (let i = 0; i < count; i++) {
    let pwd = '';
    for (let j = 0; j < length; j++) {
      pwd += charset[Math.floor(rng.next() * charset.length)];
    }
    out.push(pwd);
  }

  return out;
}

function createSeed(a: string, b: string): number {
  let hash = 0;
  for (const ch of a + b) {
    hash = Math.imul(31, hash) + ch.charCodeAt(0) | 0;
  }
  return hash;
}

class PRNG {
  private s0: number;
  private s1: number;

  constructor(seed: number) {
    this.s0 = seed >>> 0;
    this.s1 = Math.imul(seed, 16807) >>> 0;
    for (let i = 0; i < 10; i++) this.next();
  }

  next(): number {
    let s1 = this.s0;
    let s0 = this.s1;
    this.s0 = s0;
    s1 ^= s1 << 23;
    s1 ^= s1 >>> 17;
    s1 ^= s0;
    s1 ^= s0 >>> 26;
    this.s1 = s1;
    return ((this.s0 + this.s1) >>> 0) / 4294967296;
  }
}

export { generatePasswords };
