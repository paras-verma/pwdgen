import * as crypto from 'crypto';

// Mimics: echo $data | openssl aes-256-cbc -md sha512 -pbkdf2 -iter $iterations -base64 -A -nosalt -pass pass:$password
function encrypt(data: string | Buffer, password: string, iterations: number = 10000): string {
  const dataBuffer = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;

  // 48 bytes from PBKDF2: first 32 → AES-256 key, last 16 → CBC IV
  const keyIv = crypto.pbkdf2Sync(password, '', iterations, 48, 'sha512');
  const key   = keyIv.subarray(0, 32);
  const iv    = keyIv.subarray(32, 48);

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([cipher.update(dataBuffer), cipher.final()]).toString('base64');
}

export { encrypt };
