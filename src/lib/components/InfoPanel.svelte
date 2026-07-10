<script lang="ts">
	interface Props {
		onClose?: () => void;
	}
	let { onClose }: Props = $props();
</script>

<div class="px-11 py-10 max-[680px]:px-[22px] max-[680px]:py-7">
	<div class="flex items-start justify-between mb-[10px]">
		<p class="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">About</p>
		{#if onClose}
			<button
				type="button"
				class="flex items-center justify-center w-[26px] h-[26px] text-muted border-[1.5px] border-border rounded-lg cursor-pointer transition-[color,border-color] duration-[120ms] hover:text-ink hover:border-ink-2 -mt-[2px]"
				aria-label="Close"
				onclick={onClose}
			>
				<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
			</button>
		{/if}
	</div>
	<h2 class="text-[27px] font-extrabold tracking-[-0.035em] leading-[1.1] text-ink text-balance mb-8 max-[680px]:text-[22px]">Open, deterministic, verifiable.</h2>

	<div class="flex flex-col gap-8">
		<section>
			<h3 class="text-[11px] font-mono font-semibold uppercase tracking-[0.12em] text-muted mb-3">What it is</h3>
			<p class="text-[13.5px] text-ink-2 leading-[1.7]">
				pwdgen is a deterministic password manager that derives unique, strong passwords from a single master passphrase and a service name. There is no database, no cloud sync, and no account. Just math.
			</p>
		</section>

		<section>
			<h3 class="text-[11px] font-mono font-semibold uppercase tracking-[0.12em] text-muted mb-3">Under the hood</h3>
			<p class="text-[13.5px] text-ink-2 leading-[1.7]">
				Your passphrase is stretched through a <strong class="text-ink font-semibold">memory-hard key derivation function</strong> to produce a cryptographic key. That key is then combined with the service name to derive your password.
			</p>
			<p class="text-[13.5px] text-ink-2 leading-[1.7] mt-3">
				The same inputs always produce the same output - so there is nothing to store or sync. If you remember your passphrase, you can re-derive any password at any time, even after losing your device.
			</p>
			<p class="text-[13.5px] text-ink-2 leading-[1.7] mt-3">
				The algorithm version can be changed in Advanced options; newer versions are more resistant to brute-force. Everything runs locally in your browser. Nothing is ever sent to a server.
			</p>
		</section>

		<section>
			<h3 class="text-[11px] font-mono font-semibold uppercase tracking-[0.12em] text-muted mb-3">Trust</h3>
			<p class="text-[13.5px] text-ink-2 leading-[1.7] mb-4">
				What runs in your browser is verifiable against the public source - through a chain of a signed commit, a signed release tag, and a build attestation produced by GitHub Actions. The version badge above links to the attestation for this exact build.
			</p>
			<p class="text-[13.5px] text-ink-2 leading-[1.7] mb-3">
				To verify yourself, download any JS bundle from this page and run:
			</p>
			<pre class="font-mono text-[11.5px] text-ink-2 bg-surface border border-border rounded-[9px] px-4 py-3 overflow-x-auto leading-[1.8]"><code>gh attestation verify &lt;file&gt; --repo paras-verma/pwdgen</code></pre>
			<p class="text-[13px] text-muted leading-[1.7] mt-3">
				This checks that the file was produced by the expected workflow from the exact source commit - not tampered with after the fact.
			</p>
		</section>

		<div class="pt-2 border-t border-t-border-soft flex items-center gap-4">
			<a
				href="https://github.com/paras-verma/pwdgen"
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center gap-2 font-mono text-[12px] font-medium text-muted hover:text-ink-2 transition-colors duration-[120ms]"
			>
				<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
				View source on GitHub
			</a>
		</div>
	</div>
</div>
