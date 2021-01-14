import type { Dispatch, SetStateAction } from "react";

import React, { useState, useEffect } from "react";
import "./app.css";

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const ffmpeg = createFFmpeg({ log: true });

type Stateful<T> = [T, Dispatch<SetStateAction<T>>];

export default () => {
  const [ ready, setReady ]: Stateful<Promise<void>> = useState();
  const [ video, setVideo ]: Stateful<File> = useState();
  const [ audio, setAudio ]: Stateful<File> = useState();
  const [ outputURL, setOutputURL ]: Stateful<string> = useState();
  const [ processing, setProcessing ] = useState(false);

  useEffect( () => setReady(ffmpeg.load()), []);

  const mergeTracks = async () => {
    setProcessing(true);

    let videoExt = "png";
    if (video.type.startsWith("video/") || video.type === "image/gif") {
      videoExt = "mp4";
    }

    await ready;
    ffmpeg.FS("writeFile", `input.${videoExt}`, await fetchFile(video));
    ffmpeg.FS("writeFile", "input.wav", await fetchFile(audio));

    let params = "";

    if (videoExt === "mp4") {
      // Play the audio over a looping video/gif
      params = "-stream_loop -1 -i input.mp4 -i input.wav -map 0:v:0 -map 1:a:0 -c:a aac -shortest -fflags +shortest";
    } else {
      // Play the audio over a still image
      params = "-loop 1 -i input.png -i input.wav -map 0:v:0 -map 1:a:0 -c:v libx264 -tune stillimage -c:a aac -shortest -fflags +shortest";
    }

    // Run the FFmpeg command
    await ffmpeg.run(...(params.split(" ")), "output.mp4");

    // Read the result
    const data = ffmpeg.FS("readFile", "output.mp4");

    // Create a URL
    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: "video/mp4" })
    );

    setOutputURL(url);
    setProcessing(false);
  };

  return (

    <table className="app"><tbody><tr>
      <td className="input">
        <label>Video or image</label><br/>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setVideo(e.target.files?.item(0))} />

        { video &&
          <span>
            <br/>
            { video.type.startsWith("video/") ?
              <video
                controls
                className="inputVideo"
                src={URL.createObjectURL(video)} />
              :
              <img
                className="inputVideo"
                src={URL.createObjectURL(video)} /> }
          </span> }

        <br/><br/>

        <label>Audio track</label><br/>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setAudio(e.target.files?.item(0))} />

        { audio &&
          <span>
            <br/>
            <audio controls src={URL.createObjectURL(audio)} />
          </span> }

        <br/><br/>

        <button
          onClick={mergeTracks}
          disabled={ processing || !audio || !video}>
            Combine
        </button>
      </td>

      <td className="output">
        { !processing && outputURL && <video controls src={outputURL} /> }

        { processing &&
          <div className="loading-spinner">
            <div></div><div></div><div></div><div></div>
          </div> }
      </td>
    </tr></tbody></table>

  );

};

