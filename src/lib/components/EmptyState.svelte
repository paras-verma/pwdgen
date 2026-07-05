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
	<p class="text-[13px] font-semibold text-ink-2">No passwords yet</p>
	<p class="text-xs text-muted">Type a service name and generate</p>
</div>
