<script lang="ts">
	import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
	import ProgressBar from "./ProgressBar.svelte";

	type Maybe<T> = T | null | undefined;

	export let progress = 0;
	export let video: Maybe<File> = undefined;
	export let audio: Maybe<File> = undefined;
	export let outputURL: Maybe<string> = undefined;
	export let processing = false;

	const ffmpeg = createFFmpeg({ progress: ({ ratio }) => progress = ratio });
	const ready = ffmpeg.load();


	const mergeTracks = async (): Promise<void> => {
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


	const setVideo: svelte.JSX.FormEventHandler<HTMLInputElement> = (event) => {
		// @ts-ignore -- <input type="file"> is not supported in TypeScript
		video = event.target.files?.item(0);
	};


	const setAudio: svelte.JSX.FormEventHandler<HTMLInputElement> = (event) => {
		// @ts-ignore -- <input type="file"> is not supported in TypeScript
		audio = event.target.files?.item(0);
	};
</script>



<main>
	<section class="input">
		<label>Video or image
			<input type="file" accept="image/*,video/*" on:change={setVideo} />
		</label>

		{#if video}
			{#if video.type.startsWith("video/")}
				<video controls class="inputVideo"
					src={URL.createObjectURL(video)} />
			{:else}
				<img class="inputVideo" alt="Input"
					src={URL.createObjectURL(video)} />
			{/if}
		{/if}

		<br/>

		<label>Audio track
			<!-- FFmpeg can get audio from video files, too -->
			<input type="file" accept="audio/*,video/*" on:change={setAudio} />
		</label>

		{#if audio}
			<audio controls src={URL.createObjectURL(audio)} />
		{/if}

		<br/>

		<button disabled={ processing || !audio || !video }
		        on:click={mergeTracks}>
			Combine
		</button>
	</section>

	<section class="output">
		{#if processing}
			<ProgressBar bind:progress />
		{:else}
			{#if outputURL}
				<video controls src={outputURL} />
			{/if}
		{/if}
	</section>
</main>



<style>
	main {
		display: flex;
		text-align: center;
	}

	.input, .output {
		width: 50vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.input {
		border-right: 3px dashed black;
		padding-right: 3px;
	}
	.output {
		padding-left: 3px;
	}

	.input video, .input img {
		width: clamp(25%, 300px, 100%);
		max-height: calc(100vh - 400px);
	}

	.output video {
		width: 100%;
		height: 100%;
	}

	video, audio {
		outline: none;
	}
</style>
