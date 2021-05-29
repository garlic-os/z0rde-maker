<script lang="ts">
	import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
	import DropArea from "./DropArea.svelte";
	import ProgressBar from "./ProgressBar.svelte";
	import ErrorBanner from "./ErrorBanner.svelte";
	import GitHubButton from "./GitHubButton.svelte";
	import { onMount } from "svelte";

	type Maybe<T> = T | null | undefined;

	let progress = 0;
	let video: Maybe<File> = undefined;
	let audio: Maybe<File> = undefined;
	let outputURL: Maybe<string> = undefined;
	let processing = false;
	let outputSection: HTMLDivElement;

	// Show errors in the output section
	onMount( () => {
		window.addEventListener("error", (event: ErrorEvent): void => {
			new ErrorBanner({
				target: outputSection,
				props: { text: event.message },
			});
			console.error(event.error);
		});
	});

	const ffmpeg = createFFmpeg({ progress: ({ ratio }) => progress = ratio });
	const ready = ffmpeg.load();


	async function mergeTracks(): Promise<void> {
		processing = true;

		// FFmpeg doesn't mind if the a file's extension and type don't match,
		// so we can play fast and loose and just say all images are PNGs and
		// all videos are MP4s and it'll all work out just fine.
		const videoExt = (video.type.startsWith("video/") || video.type === "image/gif") ?
			"mp4"
		:
			"png";

		await ready;
		ffmpeg.FS("writeFile", `input.${videoExt}`, await fetchFile(video));
		ffmpeg.FS("writeFile", "input.wav", await fetchFile(audio));

		const params = (videoExt === "mp4") ?
			// Play the audio over a looping video/gif
			"-stream_loop -1 -i input.mp4 -i input.wav -map 0:v:0 -map 1:a:0 -c:a aac -shortest -fflags +shortest"
		:
			// Play the audio over a still image
			"-loop 1 -i input.png -i input.wav -map 0:v:0 -map 1:a:0 -c:v libx264 -tune stillimage -c:a aac -shortest -fflags +shortest";

		// Run the FFmpeg command
		await ffmpeg.run(...(params.split(" ")), "output.mp4");

		// Read the result
		const data = ffmpeg.FS("readFile", "output.mp4");

		// Create a Blob URL from the new video file
		outputURL = URL.createObjectURL(
			new Blob([data.buffer], { type: "video/mp4" })
		);

		processing = false;
		progress = 0;
	};
</script>



<main>
	<section class="input">
		<DropArea accept={["video", "image"]} setFile={ (file) => video = file } />
		<DropArea accept={["audio", "video"]} setFile={ (file) => audio = file } />
	</section>

	<section class="output" bind:this={outputSection}>
		{#if processing}
			<ProgressBar bind:progress />
		{:else}
			{#if outputURL}
				<video controls src={outputURL} />
			{/if}
		{/if}
	</section>

	<button class="combine" disabled={ processing || !audio || !video }
		    on:click={mergeTracks}>
		Combine
	</button>

	<GitHubButton repo="the-garlic-os/z0rde-maker" />
</main>



<style>
	main {
		--dividing-border: 2px solid #82868b;
		display: flex;
		background-color: #F3F4F6;
	}

	section {
		position: relative;
		width: 50vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: space-evenly;
		align-items: center;
	}

	.input {
		padding: 8px;
		border-right: var(--dividing-border);
	}

	.output video {
		width: 100%;
		height: 100%;
	}

	.combine {
		position: absolute;
		left: 50%; top: 50%;
		transform: translate3d(-50%, -50%, 0);
		text-transform: uppercase;
		letter-spacing: 0.125ch;
		font-weight: 300;
		padding: 0.5rem;
		border-radius: 5px;
		background-color: white;
		color: black;
		transition: all 250ms;
		cursor: pointer;
	}

	.combine:disabled {
		background-color: #dbdde0;
		color: #0000007d;
		cursor: unset;
	}

	.combine:not(:disabled):hover {
		border: 1px solid black;
	}

	@media screen and (max-width: 1200px) {
		main {
			flex-direction: column;
		}

		section {
			width: 100vw;
			height: 50vh;
		}

		.input {
			border-right: none;
			border-bottom: var(--dividing-border);
		}
	}
</style>
