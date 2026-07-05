# pwdgen

Deterministic password generator. Give it a service name and a master passphrase and it derives the same strong passwords every time. Nothing is stored on any server.

**[Live app](https://paras-verma.github.io/pwdgen)** | **[Releases](https://github.com/paras-verma/pwdgen/releases)**

## How it works

Each password is derived by running PBKDF2-SHA-512 over the passphrase (100,000+ iterations) to produce an AES-256-CBC key and IV, then encrypting `service-name\n` and base64-encoding the result. The iteration count walks upward from 100,000, keeping only outputs that satisfy character-class requirements. v1 is a byte-for-byte port of the original bash pipeline:

```bash
echo "$vendor" | openssl aes-256-cbc -md sha512 -pbkdf2 -iter $iter -base64 -A -nosalt -pass pass:"$passphrase"
```

v2 uses a custom alphabet (`abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^*_+-:,.?/!&()`) instead of base64 output, giving more uniform character-class distribution.

## Usage

### Web app

Open the [live app](https://paras-verma.github.io/pwdgen) or download the single-file release artifact from the [Releases page](https://github.com/paras-verma/pwdgen/releases) and open it directly in any browser with no server required.

### Local dev

Requires Node.js 18+ and npm.

```bash
npm install --legacy-peer-deps
npm run dev
```

### Build

```bash
npm run build          # SvelteKit static build
npm run build:single   # generate self-contained pwdgen.html in build/
```

## Verifying a release

See [SECURITY.md](SECURITY.md) for how to verify the SHA-256 of a downloaded release artifact and how the GitHub tag-to-release pipeline works.

## Security notes

- All cryptography uses the browser's built-in `crypto.subtle` (Web Crypto API) with no third-party crypto libraries
- `crypto.subtle` and `navigator.clipboard` require a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) (HTTPS or localhost), satisfied by both the GitHub Pages deployment and local dev
- Your passphrase never leaves the browser
- Local config is encrypted at rest using a key derived from your passphrase; nothing is sent to a server
- Algorithm implementations are frozen: see `src/lib/crypto/algo/v1.ts` and `v2.ts`

## Bash reference

The original bash implementation that v1 is compatible with:

```bash
chmod +x getpwds.sh   # removed from repo; see git history if needed
./getpwds.sh github
```
