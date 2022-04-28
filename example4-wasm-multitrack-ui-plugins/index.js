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

/** @type {HTMLSelectElement} */ const pluginParamSelector = document.querySelector('#pluginParamSelector');
/** @type {HTMLInputElement} */ const pluginAutomationLengthInput = document.querySelector('#pluginAutomationLength');
/** @type {HTMLInputElement} */ const pluginAutomationApplyButton = document.querySelector('#pluginAutomationApply');
/** @type {HTMLDivElement} */ const bpfContainer = document.querySelector('#pluginAutomationEditor');


pluginParamSelector.addEventListener('input', async (e) => {
    if (!currentPluginAudioNode) return;
    const paramId = e.target.value;
    if (paramId === '-1') return;
    if (Array.from(bpfContainer.querySelectorAll('.pluginAutomationParamId')).find(/** @param {HTMLSpanElement} span */(span) => span.textContent === paramId)) return;
    const div = document.createElement('div');
    div.classList.add('pluginAutomation');
    const span = document.createElement('span');
    span.classList.add('pluginAutomationParamId');
    span.textContent = paramId;
    div.appendChild(span);
    const bpf = document.createElement('webaudiomodules-host-bpf');
    const info = await currentPluginAudioNode.getParameterInfo(paramId);
    const { minValue, maxValue, defaultValue } = info[paramId];
    bpf.setAttribute('min', minValue);
    bpf.setAttribute('max', maxValue);
    bpf.setAttribute('default', defaultValue);
    div.appendChild(bpf);
    bpfContainer.appendChild(div);
    pluginParamSelector.selectedIndex = 0;
});
pluginAutomationLengthInput.addEventListener('input', (e) => {
    const domain = +e.target.value;
    if (!domain) return;
    bpfContainer.querySelectorAll('webaudiomodules-host-bpf').forEach(/** @param {import("./src/js/bpf").default} bpf */(bpf) => {
        bpf.setAttribute('domain', domain);
    });
});
pluginAutomationApplyButton.addEventListener('click', () => {
    if (!currentPluginAudioNode) return;
    bpfContainer.querySelectorAll('.pluginAutomation').forEach(/** @param {HTMLDivElement} div */(div) => {
        const paramId = div.querySelector('.pluginAutomationParamId').textContent;
        /** @type {import("./src/js/bpf").default} */
        const bpf = div.querySelector('webaudiomodules-host-bpf');
        console.log(bpf);
        bpf.apply(currentPluginAudioNode, paramId);
    });
});
const populateParamSelector = async (wamNode) => {
    bpfContainer.innerHTML = '';
    pluginParamSelector.innerHTML = '<option value="-1" disabled selected>Add Automation...</option>';
    const info = await wamNode.getParameterInfo();
    // eslint-disable-next-line
    for (const paramId in info) {
        const { minValue, maxValue, label } = info[paramId];
        const option = new Option(`${paramId} (${label}): ${minValue} - ${maxValue}`, paramId);
        pluginParamSelector.add(option);
    }
    pluginParamSelector.selectedIndex = 0;
};

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

    var { default: WAM } = await import ("https://michael-marynowicz.github.io/TER/pedalboard/index.js");
    var instance = await WAM.createInstance(hostGroupId, audioCtx);
    connectPlugin(mainAudio.tracks[0].audioWorkletNode, instance._audioNode);
    currentPluginAudioNode = instance._audioNode;

    var pluginDomModel = await instance.createGui();

    mountPlugin(document.querySelector("#mount2"), pluginDomModel);

    await populateParamSelector(instance._audioNode);

    pluginParamSelector.onclick = () => {
        populateParamSelector(instance._audioNode);
    };

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
    inputLoop.onclick = () => {
        console.log("loop pressed")
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

    var val = 50
    $('.master').slider({
        start  : 50,
        value: 50,
        range  : 'max',
        min    : 0,
        max    : 100,
        smooth: true,
        onMove: function(value) {
            console.log('master volume at ' + value)
            val = value / 100;
            mainAudio.tracks.forEach((track) => {
                track.gainOutNode.value = val; 
                });
            mainAudio.masterVolumeNode.gain.value = val ;
        }
        });
    let mute = false;
    inputMute.onclick = () => {
        
        if (!mute) {
            console.log("mute");
            mainAudio.tracks.forEach((track) => {
            track.gainOutNode.value = 0; 
            });
            mainAudio.masterVolumeNode.gain.value = 0 ;
            mute = true;
        }
        else {
            console.log("unmute");
            mainAudio.masterVolumeNode.gain.value = val ;
            mainAudio.tracks.forEach((track) => {
                track.gainOutNode.value = val; 
                });
            mute = false;
        }
    };
})();
