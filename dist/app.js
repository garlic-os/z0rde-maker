import React, {useState, useEffect} from "../_snowpack/pkg/react.js";
import "./app.css.proxy.js";
import {createFFmpeg, fetchFile} from "../_snowpack/pkg/@ffmpeg/ffmpeg.js";
const ffmpeg = createFFmpeg({log: true});
export default () => {
  const [ready, setReady] = useState();
  const [video, setVideo] = useState();
  const [audio, setAudio] = useState();
  const [outputURL, setOutputURL] = useState();
  const [processing, setProcessing] = useState(false);
  useEffect(() => setReady(ffmpeg.load()), []);
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
      params = "-stream_loop -1 -i input.mp4 -i input.wav -map 0:v:0 -map 1:a:0 -c:a aac -shortest -fflags +shortest";
    } else {
      params = "-loop 1 -i input.png -i input.wav -map 0:v:0 -map 1:a:0 -c:v libx264 -tune stillimage -c:a aac -shortest -fflags +shortest";
    }
    await ffmpeg.run(...params.split(" "), "output.mp4");
    const data = ffmpeg.FS("readFile", "output.mp4");
    const url = URL.createObjectURL(new Blob([data.buffer], {type: "video/mp4"}));
    setOutputURL(url);
    setProcessing(false);
  };
  return /* @__PURE__ */ React.createElement("main", null, /* @__PURE__ */ React.createElement("section", {
    className: "input"
  }, /* @__PURE__ */ React.createElement("label", null, "Video or image"), /* @__PURE__ */ React.createElement("input", {
    type: "file",
    accept: "image/*,video/*",
    onChange: (e) => setVideo(e.target.files?.item(0))
  }), video && (video.type.startsWith("video/") ? /* @__PURE__ */ React.createElement("video", {
    controls: true,
    className: "inputVideo",
    src: URL.createObjectURL(video)
  }) : /* @__PURE__ */ React.createElement("img", {
    className: "inputVideo",
    src: URL.createObjectURL(video)
  })), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("label", null, "Audio track"), /* @__PURE__ */ React.createElement("input", {
    type: "file",
    accept: "audio/*,video/*",
    onChange: (e) => setAudio(e.target.files?.item(0))
  }), audio && /* @__PURE__ */ React.createElement("audio", {
    controls: true,
    src: URL.createObjectURL(audio)
  }), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("button", {
    onClick: mergeTracks,
    disabled: processing || !audio || !video
  }, "Combine")), /* @__PURE__ */ React.createElement("section", {
    className: "output"
  }, !processing && outputURL && /* @__PURE__ */ React.createElement("video", {
    controls: true,
    src: outputURL
  }), processing && /* @__PURE__ */ React.createElement("div", {
    className: "loading-spinner"
  }, /* @__PURE__ */ React.createElement("div", null), /* @__PURE__ */ React.createElement("div", null), /* @__PURE__ */ React.createElement("div", null), /* @__PURE__ */ React.createElement("div", null))));
};
