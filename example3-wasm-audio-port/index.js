import {LineDrawer, drawBuffer} from './src/js/drawers.js';
import {MainAudio, AudioTrack, SimpleAudioWorkletNode} from "./src/js/audio_loader.js";


var audioUrl = "./song/BasketCaseGreendayriffDI.mp3";

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

/** @type {HTMLButtonElement} */

const btnStart = document.getElementById("btn-start");
/** @type {HTMLButtonElement} */

const zoomIn = document.getElementById("btn-zoom-in");
/** @type {HTMLButtonElement} */

const zoomOut = document.getElementById("btn-zoom-out");
// @ts-ignore
const btnRestart = document.getElementById("restart");
// @ts-ignore
const inputLoop = document.getElementById("loop");
//@ts-ignore
const volumeinput = document.getElementById("volume");
//@ts-ignore
const inputMute = document.getElementById("mute");

const connectPlugin = (sourceNode, audioNode) => {
    sourceNode.connect(audioNode);
    audioNode.connect(audioCtx.destination);
};

var canvas0 = document.getElementById("track0");

//@ts-ignore
var currentPluginAudioNode;

const mountPlugin = (domModel) => {
    mount.innerHTML = '';
    mount.appendChild(domModel);
};

function changeVol(gainNode, vol) {
    if (vol.value === 0) {
        gainNode.gain.value = -1;
    }
    else if (!inputMute.checked) {
        gainNode.gain.value = vol.value * 0.000001;
    }
}

function muteUnmuteTrack(btn) {
    console.log("mute")
}





(async () => {
    await audioCtx.audioWorklet.addModule("./src/js/processor.js");
    // let node = new SimpleNode(audioCtx);
    let mainAudio = new MainAudio(audioCtx);
    await mainAudio.addTrack(
        new AudioTrack(audioCtx, new SimpleAudioWorkletNode(audioCtx), "./song/multitrack/01_Kick.mp3"));
    await mainAudio.addTrack(
        new AudioTrack(audioCtx, new SimpleAudioWorkletNode(audioCtx), "./song/multitrack/02_Snare.mp3"));
    await mainAudio.addTrack(
        new AudioTrack(audioCtx, new SimpleAudioWorkletNode(audioCtx), "./song/multitrack/03_Overheads.mp3"));
    await mainAudio.addTrack(
        new AudioTrack(audioCtx, new SimpleAudioWorkletNode(audioCtx), "./song/multitrack/04_Room.mp3"));
    await mainAudio.addTrack(
        new AudioTrack(audioCtx, new SimpleAudioWorkletNode(audioCtx), "./song/multitrack/05_Tom1.mp3"));
    await mainAudio.addTrack(
        new AudioTrack(audioCtx, new SimpleAudioWorkletNode(audioCtx), "./song/multitrack/06_Tom2.mp3"));
    await mainAudio.addTrack(
        new AudioTrack(audioCtx, new SimpleAudioWorkletNode(audioCtx), "./song/multitrack/07_Tom3.mp3"));
    await mainAudio.addTrack(
        new AudioTrack(audioCtx, new SimpleAudioWorkletNode(audioCtx), "./song/multitrack/08_BassDI.mp3"));
    await mainAudio.addTrack(
        new AudioTrack(audioCtx, new SimpleAudioWorkletNode(audioCtx), "./song/multitrack/09_BassAmp.mp3"));
    await mainAudio.addTrack(
        new AudioTrack(audioCtx, new SimpleAudioWorkletNode(audioCtx), "./song/multitrack/10_Gtr1.mp3"));
    await mainAudio.addTrack(
        new AudioTrack(audioCtx, new SimpleAudioWorkletNode(audioCtx), "./song/multitrack/11_Gtr2.mp3"));
    await mainAudio.addTrack(
        new AudioTrack(audioCtx, new SimpleAudioWorkletNode(audioCtx), "./song/multitrack/12_LeadVox.mp3"));

    console.log(mainAudio.tracks);
    var canvas0 = document.getElementById("layer0");
    var canvas1 = document.getElementById("layer1");

    // let lineDrawer = new LineDrawer(canvas1);
    // lineDrawer.duration = mainAudio.tracks[0].duration;

    // @ts-ignore // définition du canvas pour l'onde


    drawBuffer(canvas0, mainAudio.tracks[0].decodedAudioBuffer, "#4d5ed1", 2000, 99)
    // drawBuffer(canvas0, mainAudio.tracks[1].decodedAudioBuffer, "red", 1000, 300)

    // let operableDecodedAudioBuffer = Object.setPrototypeOf(
    //     decodedAudioBuffer,
    //     OperableAudioBuffer.prototype
    // );
    // const node = new SimpleNode(audioCtx);
    // node.setAudio(operableDecodedAudioBuffer.toArray());
    // node.connect(audioCtx.destination);

    const { default: initializeWamHost } = await import("./plugins/testBern/utils/sdk/src/initializeWamHost.js");
    const [hostGroupId] = await initializeWamHost(audioCtx);

    const { default: WAM } = await import ("./plugins/testBern/index.js");
    const instance = await WAM.createInstance(hostGroupId, audioCtx);
    connectPlugin(mainAudio.node, instance._audioNode);
    currentPluginAudioNode = instance._audioNode;

    const pluginDomModel = await instance.createGui();

    // plugin info for automation
    // showPluginInfo(instance, pluginDomModel);
    // await populateParamSelector(instance._audioNode);

    mountPlugin(pluginDomModel);

    // source.connect(node).connect(audioCtx.destination);
    connectPlugin(mainAudio.node, gainNode);
    mainAudio.node.parameters.get("playing").value = 0;
    mainAudio.node.parameters.get("loop").value = 1;
    //EVENT LISTENER
    zoomIn.onclick = () => {
        // event listener for the zoom button
        zoom += 0.1;
        drawBuffer(canvas0, decodedAudioBuffer, "red", 1000 * zoom, 300);

        canvas1.width = 1000 * zoom;
    };
    zoomOut.onclick = () => {
        // event listener for the zoom button
        zoom -= 0.1;
        zoom = 1000 * zoom <= 101 ? zoom + 0.1 : zoom;
        drawBuffer(canvas0, decodedAudioBuffer, "red", 1000 * zoom, 300);
        // drawBuffer(canvas0, decodedAudioBuffer, "red", 1000 * zoom, 300);

        canvas1.width = 1000 * zoom;
    };
    btnStart.onclick = () => {
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
            // source.start();
        }

        mainAudio.tracks.forEach((track) => {
            const playing = track.audioWorkletNode.parameters.get("playing").value;
            if (playing === 1) {
                track.audioWorkletNode.parameters.get("playing").value = 0;
                btnStart.textContent = "Start";
                // lineDrawer.paused = true;
            } else {
                // if (!lineDrawer.launched) {
                //     lineDrawer.drawLine(track.audioWorkletNode.decodedAudioBuffer);
                // }
                track.audioWorkletNode.parameters.get("playing").value = 1;
                btnStart.textContent = "Stop";
                // lineDrawer.paused = false;
            }
        });

    };
    btnTime.onclick = () => {
        // console.log(audioCtx.getOutputTimestamp());
        // console.log(audioCtx.getOutputTimestamp().contextTime);
        // console.log(audioCtx.currentTime);
        // console.log(node)
    };
    btnRestart.onclick = () => {
        mainAudio.tracks.forEach((track) => {
            track.audioWorkletNode.setPosition(0);
            lineDrawer.x = 0;
            //@ts-ignore
            canvas1.getContext("2d").clearRect(0, 0, canvas1.width, canvas1.height);

        })
    };
    inputLoop.checked = true;
    inputLoop.onchange = () => {
        mainAudio.tracks.forEach((track) => {
            const loop = track.audioWorkletNode.parameters.get("loop").value;
            if (loop === 1) {
                track.audioWorkletNode.parameters.get("loop").value = 0;
                inputLoop.checked = false;
            } else {
                track.audioWorkletNode.parameters.get("loop").value = 1;
                inputLoop.checked = true;
            }
        })

    };
    btnStart.hidden = false;


        // @ts-ignore
    volspan.onchange = (e) => {
        if (inputMute.checked) {
            mainAudio.masterVolumeNode.gain.value = -1;
        } else {
            changeVol(mainAudio.masterVolumeNode, volumeinput);
        }
    }
    inputMute.onclick = () => {

        if (inputMute.checked) {
            mainAudio.masterVolumeNode.gain.value = -1;
        }
        else {
            changeVol(mainAudio.masterVolumeNode, volumeinput);
        }
    };
})();
