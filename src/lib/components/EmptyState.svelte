<script lang="ts">
	interface Props {
		onLearnMore?: () => void;
	}
	let { onLearnMore }: Props = $props();
</script>

<div class="flex-1 flex flex-col items-center justify-center gap-1.5 text-center">
	<div class="w-full flex flex-col gap-3 mb-[22px] animate-pwdpulse">
		{#each [71, 66, 74] as width}
			<div class="flex items-center gap-2">
				<div class="w-[18px] h-[9px] bg-border rounded-[4px] shrink-0"></div>
				<div class="h-[9px] bg-border rounded-[4px] flex-1" style="width:{width}%"></div>
				<div class="w-[22px] h-[22px] bg-border rounded-[6px] shrink-0"></div>
				<div class="w-[22px] h-[22px] bg-border rounded-[6px] shrink-0"></div>
			</div>
		{/each}
	</div>
	<p class="text-[13px] font-semibold text-ink-2">Your passwords will appear here</p>
	<p class="text-xs text-muted leading-[1.7] max-w-[200px]">Set a passphrase on the left, enter a site name, and hit Generate</p>
	{#if onLearnMore}
		<button
			type="button"
			class="mt-3 flex items-center gap-1.5 font-sans text-[12px] font-semibold text-muted border-[1.5px] border-border rounded-lg px-[11px] py-[5px] cursor-pointer transition-[color,border-color] duration-[120ms] hover:text-accent hover:border-accent"
			onclick={onLearnMore}
		>
			<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
			How it works
		</button>
	{/if}
</div>
