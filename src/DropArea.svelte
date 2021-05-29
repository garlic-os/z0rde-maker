<script lang="ts">
	type Maybe<T> = T | null | undefined;

	export let setFile: (file?: File) => void = () => {};
	export let accept: string[] = [];
	let file: Maybe<File> = undefined;
	let dropArea: HTMLDivElement;

	function handleDragenter(event: DragEvent): void {
		event.preventDefault();
		event.stopPropagation();
		(event.target as HTMLInputElement).classList.add("dragover");
	}

	function handleDragleave(event: DragEvent): void {
		event.preventDefault();
		event.stopPropagation();
		(event.target as HTMLInputElement).classList.remove("dragover");
	}

	function handleDrop(event: DragEvent): void {
		event.preventDefault();
		event.stopPropagation();
		handleFile(event.dataTransfer.files);
	}

	function handleFile(files: FileList): void {
		file = files.item(0);
		setFile(file);
	}

	function clearArea(event: Event): void {
		// So the "choose" dialog isn't immediately re-triggered
		event.stopPropagation();
		file = undefined;
		setFile(file);
	}
</script>



<div class="drop-area" class:populated={!!file} bind:this={dropArea}
     on:click={ () => file || dropArea.querySelector(".file-input").click() }
	 on:dragenter={handleDragenter}
	 on:dragleave={handleDragleave}
	 on:drop={handleDrop}
>
	{#if file}
		{#if file.type.startsWith("video/")}
			<video controls src={URL.createObjectURL(file)} />
		{:else if file.type.startsWith("image/")}
			<img alt="Input" src={URL.createObjectURL(file)} />
		{:else if file.type.startsWith("audio/")}
			<audio controls src={URL.createObjectURL(file)} />
		{/if}
		<button class="delete icon" on:click={clearArea} />
	{:else}
		<div class="icons">
			{#each accept as mediaType}
				<div class="{mediaType} icon" />
			{/each}
		</div>
		<label>Choose or drag and drop a {accept.join(" or ")}
			<input class="file-input" type="file"
			       accept={accept.join("/*,") + "/*"}
				   on:change={ (event) => handleFile(event.target.files) }>
		</label>
	{/if}
</div>



<style>
	.drop-area {
		position: relative;
		border: 2px solid #a6acb3;
		border-radius: 5px;
		width: 90%;
		max-width: 100%;
		height: 45%;
		background-color: white;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.drop-area:not(.populated):hover, .drop-area:not(.populated).dragover {
		border-color: black;
	}

	.drop-area:not(.populated) {
		cursor: pointer;
		border-style: dashed;
	}

	label {
		cursor: pointer;
	}

	input {
		display: none;
	}

	button {
		cursor: pointer;
		background-color: white;
	}

	button:hover {
		border-color: black;
	}

	.icons {
		margin-bottom: 1rem;
	}

	.icon {
		--side-length: clamp(2rem, 12vw, 6rem);
		display: inline-block;
		width: var(--side-length);
		height: var(--side-length);
		background-position: center center;
	}

	.icon.image {
		background-image: url("../img/image.svg");
	}

	.icon.video {
		background-image: url("../img/video.svg");
	}

	.icon.audio {
		background-image: url("../img/audio.svg");
	}

	.icon.delete {
		background-image: url("../img/delete.svg");
	}

	.delete {
		--side-length: 3.5rem;
		position: absolute;
		right: 1rem; top: 1rem;
		width: var(--side-length);
		height: var(--side-length);
		border-radius: 100%;
		background-size: 80%;
		background-repeat: no-repeat;
		background-position: 7px;  /* This SVG isn't on center */
	}

	video, img {
		height: 100%;
		max-height: 100%;
		max-width: 100%;
	}

	audio {
		min-height: 20px;
		max-width: 100%;
	}

	/* Make the audio player larger when the screen is wide enough for it */
	@media screen and (min-width: 560px) {
		audio {
			transform: scale(1.5);
		}
	}
</style>
