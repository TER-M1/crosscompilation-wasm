// const audioUrl = "./song/BasketCaseGreendayriffDI.mp3";
// const playButton = document.querySelector("#btn-start");

// (async () => {
//   let decodeddecodedAudioBuffer;
//   let audioArrayBuffer;

//   var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
//   audioCtx.audioWorklet.addModule("processor.js");

//   const response = await fetch(audioUrl);
//   audioArrayBuffer = await response.arrayBuffer();
//   decodeddecodedAudioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);

//   playButton.disabled = false;
//   playButton.onclick = () => play(decodeddecodedAudioBuffer);

//   function play(decodedAudioBuffer) {
//     const node = new SimpleNode(audioCtx);
//     const source = audioCtx.createBufferSource();
//     source.buffer = decodedAudioBuffer;
//     source.connect(node).connect(audioCtx.destination);
//     source.start();
//   }
// })();

class SimpleNode extends AudioWorkletNode {
  /**
   * @param {BaseAudioContext} context
   */
  constructor(context) {
    super(context, "simple-processor");
  }
  /** @param {number} position set playhead in seconds */
  setPosition(position) {
    this.port.postMessage({ position });
  }
  /**
   * @param {Float32Array[]} audio
   */
  setAudio(audio) {
    this.port.postMessage({ audio });
  }
}

//@ts-check

// const audioUrl = "https://wasabi.i3s.unice.fr/WebAudioPluginBank/BasketCaseGreendayriffDI.mp3";
const audioUrl = "./song/BasketCaseGreendayriffDI.mp3";
// const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audioCtx = new AudioContext();
const gainNode = audioCtx.createGain();
/** @type {HTMLButtonElement} */
// @ts-ignore
const btnStart = document.getElementById("btn-start");
/** @type {HTMLButtonElement} */
// @ts-ignore
const zoomIn = document.getElementById("btn-zoom-in");
/** @type {HTMLButtonElement} */
// @ts-ignore
const zoomOut = document.getElementById("btn-zoom-out");

// @ts-ignore
const btnTime = document.getElementById("time");

// @ts-ignore
const btnRestart = document.getElementById("restart");

var zoom = 1;
var x;

/** @type {HTMLInputElement} */
// @ts-ignore
const inputLoop = document.getElementById("btn-check-2-outlined");
//@ts-ignore
const volumeinput = document.getElementById("volume");

//@ts-ignore
const inputMute = document.getElementById("Mute");

//@ts-ignore
var launched;
//@ts-ignore
var paused = false;

//music duration
//@ts-ignore
var dur = 0;

function drawBuffer(canvas, buffer, color, width, height) {
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = width;
  canvas.height = height;
  if (color) {
    ctx.fillStyle = color;
  }
  var data = buffer.getChannelData(0);
  var step = Math.ceil(data.length / width);
  var amp = height / 2;
  for (var i = 0; i < width; i++) {
    var min = 1.0;
    var max = -1.0;
    for (var j = 0; j < step; j++) {
      var datum = data[i * step + j];
      if (datum < min) min = datum;
      if (datum > max) max = datum;
    }
    ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
  }
}

// @ts-ignore
function drawLine(canvas, decodedAudioBuffer) {
  launched = true;
  var ctx = canvas.getContext("2d");
  x = 0;
  // @ts-ignore
  var y = 50;
  // @ts-ignore
  var width = 10;
  // @ts-ignore
  var height = 10;
  let speed = 33;
  let delta = 0.01; // the time spent in the function animate // empirical value i have to do it better

  function animate() {
    //speed Calculation for the line:
    if (dur == 0) {
      console.error("duration not defined for this sound.");
    } else {
      speed = (dur / (canvas.width / 2)) * 1000;
    }
    if (!paused) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
      x += 2;
    }
    if (x <= canvas.width) {
      setTimeout(animate, speed - delta);
    }
    if (x > canvas.width) {
      launched = false;
    }
  }

  animate();
}

const connectPlugin = (sourceNode, audioNode) => {
  sourceNode.connect(audioNode);
  audioNode.connect(audioCtx.destination);
};

function changeVol(vol) {
  if (vol.value == 0) {
    gainNode.gain.value = -1;
  }
  // @ts-ignore
  else if (!inputMute.checked) {
    console.log(vol.value);

    gainNode.gain.value = vol.value * 0.000001;
  }
}
function muteUnmuteTrack(btn) {
  console.log(btn);
}

(async () => {
  let decodedAudioBuffer;
  let audioArrayBuffer;

  //   var audioCtx =
  audioCtx.audioWorklet.addModule("processor.js");

  const response = await fetch(audioUrl);
  audioArrayBuffer = await response.arrayBuffer();
  decodedAudioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);

  dur = decodedAudioBuffer.duration;
  console.log(dur);
  var canvas0 = document.getElementById("layer0");
  var canvas1 = document.getElementById("layer1");
  // @ts-ignore // définition du canvas pour l'onde
  canvas0.height = 300;
  canvas0.width = 1000;
  // @ts-ignore // définition du canvas pour la barr ed'avancement
  canvas1.height = 300;
  canvas1.width = 1000;

  drawBuffer(canvas0, decodedAudioBuffer, "red", 1000, 300);
  /** @type {import("./operable-audio-buffer.js").default} */
  //   const operabledecodedAudioBuffer = Object.setPrototypeOf(
  //     decodedAudioBuffer,
  //     OperabledecodedAudioBuffer.prototype
  //   );
  const node = new SimpleNode(audioCtx);
  //   const node = new SimpleNode(audioCtx);
    const source = audioCtx.createBufferSource();
  source.buffer = decodedAudioBuffer;

  //   node.setAudio(decodedAudioBuffer);
  source.connect(node).connect(audioCtx.destination);
  connectPlugin(node, gainNode);
  node.parameters.get("playing").value = 0;
  node.parameters.get("loop").value = 1;
  //EVENT LISTENER
  zoomIn.onclick = () => {
    // event listener for the zoom button
    zoom += 0.1;
    drawBuffer(canvas0, decodedAudioBuffer, "red", 1000 * zoom, 300);
    // @ts-ignore
    canvas1.width = 1000 * zoom;
  };
  zoomOut.onclick = () => {
    // event listener for the zoom button
    zoom -= 0.1;
    zoom = 1000 * zoom <= 101 ? zoom + 0.1 : zoom;
    drawBuffer(canvas0, decodedAudioBuffer, "red", 1000 * zoom, 300);
    // @ts-ignore
    canvas1.width = 1000 * zoom;
  };
  btnStart.onclick = () => {
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
      source.start();
    }
    const playing = node.parameters.get("playing").value;
    if (playing === 1) {
      node.parameters.get("playing").value = 0;
      btnStart.textContent = "Start";
      paused = true;
    } else {
      if (!launched) {
        drawLine(canvas1, decodedAudioBuffer);
      }
      node.parameters.get("playing").value = 1;
      btnStart.textContent = "Stop";
      paused = false;
    }
  };
  btnTime.onclick = () => {
    // console.log(audioCtx.getOutputTimestamp());
    // console.log(audioCtx.getOutputTimestamp().contextTime);
    // console.log(audioCtx.currentTime);
    // console.log(node)
  };
  btnRestart.onclick = () => {
    node.setPosition(0);
    x = 0;
    //@ts-ignore
    canvas1.getContext("2d").clearRect(0, 0, canvas1.width, canvas1.height);
  };
  inputLoop.checked = true;
  inputLoop.onchange = () => {
    const loop = node.parameters.get("loop").value;
    if (loop === 1) {
      node.parameters.get("loop").value = 0;
      inputLoop.checked = false;
    } else {
      node.parameters.get("loop").value = 1;
      inputLoop.checked = true;
    }
  };
  btnStart.hidden = false;

  inputMute.onchange = () => {
    // @ts-ignore
    if (inputMute.checked) {
      gainNode.gain.value = -1;
    } else {
      changeVol(volumeinput);
    }
  };
})();
