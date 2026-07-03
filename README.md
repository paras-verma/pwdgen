# pwdgen

Deterministic password generator. Give it a vendor name and a master passphrase — it derives the same set of strong passwords every time. Nothing is stored or sent anywhere.

**[Live demo →](https://paras-verma.github.io/pwdgen)**

## How it works

Each password is derived by running PBKDF2/SHA-512 over the passphrase (no salt, 100 000+ iterations) to produce an AES-256-CBC key and IV, then encrypting `vendor-name\n` and base64-encoding the result. The iteration count walks upward from 100 000, keeping only outputs that contain a digit and a special character. This is a byte-for-byte port of the original bash pipeline:

```bash
echo "$vendor" | openssl aes-256-cbc -md sha512 -pbkdf2 -iter $iter -base64 -A -nosalt -pass pass:"$passphrase"
```

## Usage

### Web UI

Open `index.html` in any modern browser — no server required.  
Or use the live demo linked above.

### CLI

Requires Node.js 18+.

```bash
npm install
npx ts-node index.ts <vendor> <passphrase> [count]
```

```
npx ts-node index.ts github my-passphrase 5
```

### Bash (original)

```bash
chmod +x getpwds.sh
./getpwds.sh github
```

Prompts for passphrase interactively (never echoed).

## Files

| File | Purpose |
|------|---------|
| `index.html` | Self-contained web UI |
| `getpwds.js` | ES module — same algorithm, importable over HTTP |
| `getpwds.sh` | Original bash reference implementation |
| `index.ts` | Node.js CLI entry point |
| `pwd.ts` | AES-256-CBC encrypt helper (Node `crypto`) |
| `generate-pass.ts` | Alternative PRNG-based generator (not OpenSSL-compatible) |

## Security notes

- The web UI uses the browser's built-in `crypto.subtle` (Web Crypto API) — no third-party crypto libraries.
- `crypto.subtle` and `navigator.clipboard` require a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) (HTTPS or `localhost`). Both are satisfied by the GitHub Pages deployment and by serving locally over HTTP.
- Your passphrase never leaves the browser.
