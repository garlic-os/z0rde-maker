<script type="ts">
    export let progress = 0;

    function progress2percent(progress: number): number {
        return Math.min(progress * 100 / 3, 100);
    }
</script>



<div class="progress-bar"
     style="--progressPercent: {progress2percent(progress)}%;">
    <div></div>
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
        width: var(--progressPercent);
        height: 100%;
        border-radius: 5px;

        /* A transition duration of double the progress update rate makes the
        progress bar almost never stop moving, which looks really nice. */
        transition: width 1s;
    }
</style>
