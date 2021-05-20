// [snowpack] add styles to the page (skip if no document exists)
if (typeof document !== 'undefined') {
  const code = "html, body {\n  height: 100%;\n  margin: 0;\n  padding: 0;\n}\n\nmain {\n  display: flex;\n  text-align: center;\n}\n\n.input, .output {\n  width: 50vw;\n  height: 100vh;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n}\n\n.input {\n  border-right: 3px dashed black;\n  padding-right: 3px;\n}\n.output {\n  padding-left: 3px;\n}\n\n.input video, .input img {\n  max-width: 100%;\n  height: 25%;\n  object-fit: contain;\n}\n\n.output video {\n  width: 100%;\n  height: 100%;\n}\n\nvideo, audio {\n  outline: none;\n}\n\n.loading-spinner {\n  display: inline-block;\n  position: relative;\n  width: 80px;\n  height: 80px;\n}\n.loading-spinner div {\n  box-sizing: border-box;\n  display: block;\n  position: absolute;\n  width: 64px;\n  height: 64px;\n  margin: 8px;\n  border: 8px solid #000;\n  border-radius: 50%;\n  animation: loading-spinner 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;\n  border-color: #000 transparent transparent transparent;\n}\n.loading-spinner div:nth-child(1) {\n  animation-delay: -0.45s;\n}\n.loading-spinner div:nth-child(2) {\n  animation-delay: -0.3s;\n}\n.loading-spinner div:nth-child(3) {\n  animation-delay: -0.15s;\n}\n@keyframes loading-spinner {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n";

  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';
  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}