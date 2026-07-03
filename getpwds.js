// Browser (Web Crypto) port of getpwds.sh — byte-identical to the bash reference.
//
// Derives passwords by walking PBKDF2/SHA-512 iterations upward from 100000,
// encrypting `input + "\n"` with AES-256-CBC (the "\n" matches what `echo` adds
// in the bash pipeline), base64-encoding, truncating to `length`, and keeping
// candidates that contain at least one digit and one special character.

async function generatePasswords(input, password, count = 5, length = 16, disallowedChars = '') {
  const MAX_ATTEMPTS = 300; // each attempt ~50 ms; cap prevents hung tabs

  const hasDigit   = /[0-9]/;
  const hasSpecial = /[@#$%^*_+\-:,.?/]/;

  const encoder    = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw', encoder.encode(password),
    { name: 'PBKDF2' }, false, ['deriveBits']
  );

  const salt      = new Uint8Array(0);
  const plaintext = encoder.encode(input + '\n');

  const passwords = [];
  let iter     = 100000;
  let attempts = 0;

  while (passwords.length < count && attempts < MAX_ATTEMPTS) {
    attempts++;

    const bits = new Uint8Array(await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-512', salt, iterations: iter },
      passwordKey, 48 * 8
    ));

    const aesKey = await crypto.subtle.importKey(
      'raw', bits.slice(0, 32),
      { name: 'AES-CBC' }, false, ['encrypt']
    );

    const encrypted = new Uint8Array(await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv: bits.slice(32, 48) }, aesKey, plaintext
    ));

    const candidate = btoa(String.fromCharCode(...encrypted)).slice(0, length);
    iter++;

    if (!hasDigit.test(candidate) || !hasSpecial.test(candidate)) continue;
    if (disallowedChars && [...candidate].some(c => disallowedChars.includes(c))) continue;

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

export { generatePasswords };
