# Security

## Verifying a release

Every release includes a single self-contained HTML artifact (`pwdgen-vX.Y.Z.html`) that can be opened directly in any browser with no server required. It contains all JavaScript and CSS inline — no external requests are made during use (except optional Google Fonts, which are cosmetic only).

### How the tag maps to a release

When a git tag matching `v*` is pushed to the repository, the [Release workflow](.github/workflows/release.yml) runs automatically:

1. Checks out the exact tagged commit
2. Builds the SvelteKit app with `VITE_APP_VERSION` set to the tag name
3. Runs `scripts/single-file.mjs` to inline all assets into a single HTML file
4. Computes `sha256sum build/pwdgen.html`
5. Creates a GitHub Release named after the tag, attaches `pwdgen-vX.Y.Z.html`, and embeds the SHA-256 hash in the release body

The artifact is built directly from the tagged source with no manual upload step. You can audit the full pipeline in [`.github/workflows/release.yml`](.github/workflows/release.yml).

### Verifying integrity

Download `pwdgen-vX.Y.Z.html` from the [Releases page](https://github.com/paras-verma/pwdgen/releases).

**Hash check** — proves the file was not modified after it was built:

```sh
sha256sum pwdgen-vX.Y.Z.html
```

Compare against the **Expected SHA-256** in the release notes.

**Provenance attestation** — proves the file was built by this repository's GitHub Actions workflow from a specific commit, using Sigstore:

```sh
gh attestation verify pwdgen-vX.Y.Z.html --repo paras-verma/pwdgen
```

A passing attestation means the artifact was produced by the CI pipeline and was not substituted after the fact.

### Cryptographic design

- Passwords are derived with **PBKDF2-SHA-512** (100,000+ iterations) and encrypted with **AES-256-CBC**
- All cryptography runs in the browser via the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) (`crypto.subtle`) with no third-party crypto libraries
- Your passphrase never leaves the browser
- Local configuration is encrypted at rest using a key derived from your passphrase; nothing is sent to a server
