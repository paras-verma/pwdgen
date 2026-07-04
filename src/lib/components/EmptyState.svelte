<div class="empty-state">
	<div class="phantom-rows">
		{#each [71, 66, 74] as width}
			<div class="phantom-row">
				<div class="phantom-num"></div>
				<div class="phantom-bar" style="width:{width}%"></div>
				<div class="phantom-icon"></div>
				<div class="phantom-icon"></div>
			</div>
		{/each}
	</div>
	<p class="empty-label">No passwords yet</p>
	<p class="empty-sub">Select a vendor and generate</p>
</div>

<style>
	.empty-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		text-align: center;
	}

	.phantom-rows {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 22px;
		animation: pulse 2.8s ease-in-out infinite;
	}

	.phantom-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.phantom-num,
	.phantom-bar,
	.phantom-icon {
		background: var(--border);
		border-radius: 4px;
		flex-shrink: 0;
	}

	.phantom-num {
		width: 18px;
		height: 9px;
	}

	.phantom-bar {
		height: 9px;
		flex: 1;
	}

	.phantom-icon {
		width: 22px;
		height: 22px;
		border-radius: 6px;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.5;
		}
		50% {
			opacity: 0.22;
		}
	}

	.empty-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--ink-2);
	}

	.empty-sub {
		font-size: 12px;
		color: var(--muted);
	}
</style>
