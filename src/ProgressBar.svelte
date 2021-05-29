<script type="ts">
	export let progress = 0;

	// I don't actually know how FFmpeg's progress meter works, but if you
	// multiply it by 100 and divide it by 3 it always finishes pretty close
	// to 100% ¯\_(ツ)_/¯
	$: barWidth = Math.min(progress * 100 / 3, 100);
</script>



<div class="progress-bar" style="--barWidth: {barWidth}%;">
	<div />
</div>



<style>
	.progress-bar {
		width: clamp(5rem, 25rem, 100%);
		height: 1.25rem;
		background-color: #00000029;
		border-radius: 5px;
	}

	.progress-bar > div {
		background-color: black;
		width: var(--barWidth);
		height: 100%;
		border-radius: 5px;

		/* A transition duration of double the progress update rate makes the
		progress bar almost never stop moving, which looks really nice. */
		transition: width 1s;
	}
</style>
