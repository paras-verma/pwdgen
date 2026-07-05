<div class="px-11 py-10 max-[680px]:px-[22px] max-[680px]:py-7">
	<p class="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent mb-[10px]">About</p>
	<h2 class="text-[27px] font-extrabold tracking-[-0.035em] leading-[1.1] text-ink text-balance mb-8 max-[680px]:text-[22px]">How pwdgen works</h2>

	<div class="flex flex-col gap-8">
		<section>
			<h3 class="text-[11px] font-mono font-semibold uppercase tracking-[0.12em] text-muted mb-3">What it is</h3>
			<p class="text-[13.5px] text-ink-2 leading-[1.7]">
				pwdgen is a deterministic password manager that derives unique, strong passwords from a single master passphrase and a service name. There is no database, no cloud sync, and no account. Just math.
			</p>
		</section>

		<section>
			<h3 class="text-[11px] font-mono font-semibold uppercase tracking-[0.12em] text-muted mb-3">Why deterministic</h3>
			<p class="text-[13.5px] text-ink-2 leading-[1.7]">
				The same inputs always produce the same outputs. If you remember your passphrase, you can always re-derive every password, even after losing your device. No backup needed. No single point of failure.
			</p>
		</section>

		<section>
			<h3 class="text-[11px] font-mono font-semibold uppercase tracking-[0.12em] text-muted mb-3">How to use it</h3>
			<ol class="flex flex-col gap-3 list-none">
				<li class="flex gap-3">
					<span class="font-mono text-[11px] font-semibold text-accent bg-accent-dim rounded-[5px] px-[7px] py-[3px] shrink-0 mt-[2px] h-fit">01</span>
					<p class="text-[13.5px] text-ink-2 leading-[1.7]"><strong class="text-ink font-semibold">Choose a master passphrase.</strong> Pick a long, memorable phrase you will never forget. This is the only secret you need to protect.</p>
				</li>
				<li class="flex gap-3">
					<span class="font-mono text-[11px] font-semibold text-accent bg-accent-dim rounded-[5px] px-[7px] py-[3px] shrink-0 mt-[2px] h-fit">02</span>
					<p class="text-[13.5px] text-ink-2 leading-[1.7]"><strong class="text-ink font-semibold">Enter a service name.</strong> Type the name of the site or app (e.g. <em class="font-mono text-[12.5px] not-italic text-ink">github</em>). Each unique name yields a different password.</p>
				</li>
				<li class="flex gap-3">
					<span class="font-mono text-[11px] font-semibold text-accent bg-accent-dim rounded-[5px] px-[7px] py-[3px] shrink-0 mt-[2px] h-fit">03</span>
					<p class="text-[13.5px] text-ink-2 leading-[1.7]"><strong class="text-ink font-semibold">Generate and copy.</strong> Hit Generate, then copy the password you want. If you ever need it again, repeat the same inputs.</p>
				</li>
			</ol>
		</section>

		<section>
			<h3 class="text-[11px] font-mono font-semibold uppercase tracking-[0.12em] text-muted mb-3">Under the hood</h3>
			<p class="text-[13.5px] text-ink-2 leading-[1.7]">
				Passwords are derived with <strong class="text-ink font-semibold">PBKDF2-SHA-512</strong> (100 000 iterations) and encrypted with <strong class="text-ink font-semibold">AES-256-CBC</strong>. Everything runs in your browser using the Web Crypto API. Nothing is ever sent to a server.
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
