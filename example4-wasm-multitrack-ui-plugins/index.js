import {LineDrawer, drawBuffer} from './src/js/drawers.js';
import {MainAudio, AudioTrack, SimpleAudioWorkletNode} from "./src/js/audio_loader.js";


var audioUrl = "./song/BasketCaseGreendayriffDI.mp3";

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
if (audioCtx.state === "suspended") {
    audioCtx.resume();
}
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

var canvas = [];
// var canvas0 = document.getElementById("track0");
for (let i = 0; i < 12; i++) {
    canvas.push(document.getElementById(`track${i}`));
}

//@ts-ignore
var currentPluginAudioNode;

const mountPlugin = (mount, domModel) => {
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

var timer = document.querySelector(".timer");


function updateAudioTimer(mainAudio) {
    // var days = Math.floor(mainAudio.tracks[0].duration / 24);
    var hours = Math.floor(mainAudio.tracks[0].duration / 3600);
    var mins = Math.floor(mainAudio.tracks[0].duration / 60);
    var secs = Math.floor(mainAudio.tracks[0].duration % 60);
    if (secs < 10) {
        secs = '0' + String(secs);
    }
    if (mins < 10) {
        mins = '0' + String(mins);
    }
    if (hours < 10) {
        hours = '0' + String(hours);
    }
    timer.innerHTML = hours + ':' + mins + ':' + secs;
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
    updateAudioTimer(mainAudio);

    // @ts-ignore // définition du canvas pour l'onde

    for (let i = 0; i < canvas.length;i++) {
        drawBuffer(canvas[i], mainAudio.tracks[i].decodedAudioBuffer, "#" + Math.floor(Math.random()*16777215).toString(16), 2000, 99);
    }
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

    var { default: WAM } = await import ("https://mainline.i3s.unice.fr/wam2/packages/BigMuff/index.js");
    var instance = await WAM.createInstance(hostGroupId, audioCtx);
    connectPlugin(mainAudio.tracks[0].audioWorkletNode, instance._audioNode);
    currentPluginAudioNode = instance._audioNode;

    var pluginDomModel = await instance.createGui();

    mountPlugin(document.querySelector("#mount1"), pluginDomModel);



    var { default: WAM } = await import ("https://michael-marynowicz.github.io/TER/pedalboard/index.js");
    var instance = await WAM.createInstance(hostGroupId, audioCtx);
    connectPlugin(mainAudio.tracks[0].audioWorkletNode, instance._audioNode);
    currentPluginAudioNode = instance._audioNode;

    var pluginDomModel = await instance.createGui();

    mountPlugin(document.querySelector("#mount2"), pluginDomModel);
    // plugin info for automation
    // showPluginInfo(instance, pluginDomModel);
    // await populateParamSelector(instance._audioNode);


    // source.connect(node).connect(audioCtx.destination);
    connectPlugin(mainAudio.tracks[0].audioWorkletNode, mainAudio.masterVolumeNode);

    //EVENT LISTENER
    btnStart.onclick = () => {


        mainAudio.tracks.forEach((track) => {
            if (audioCtx.state === "suspended") {
                audioCtx.resume();
            }
            const playing = track.audioWorkletNode.parameters.get("playing").value;
            if (playing === 1) {
                track.audioWorkletNode.parameters.get("playing").value = 0;
                // lineDrawer.paused = true;
            } else {
                // if (!lineDrawer.launched) {
                //     lineDrawer.drawLine(track.audioWorkletNode.decodedAudioBuffer);
                // }
                track.audioWorkletNode.parameters.get("playing").value = 1;
            }
        });

    };
    // btnTime.onclick = () => {
    //     // console.log(audioCtx.getOutputTimestamp());
    //     // console.log(audioCtx.getOutputTimestamp().contextTime);
    //     // console.log(audioCtx.currentTime);
    //     // console.log(node)
    // };
    btnRestart.onclick = () => {
        mainAudio.tracks.forEach((track) => {
            track.audioWorkletNode.setPosition(0);
            //@ts-ignore

        })
    };
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
    // volspan.onchange = (e) => {
    //     if (inputMute.checked) {
    //         mainAudio.masterVolumeNode.gain.value = -1;
    //     } else {
    //         changeVol(mainAudio.masterVolumeNode, volumeinput);
    //     }
    // }
    inputMute.onclick = () => {

        if (inputMute.checked) {
            mainAudio.masterVolumeNode.gain.value = -1;
        }
        else {
            changeVol(mainAudio.masterVolumeNode, volumeinput);
        }
    };
})();
