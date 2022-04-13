// import { showPluginInfo , populateParamSelector } from './src/js/automation.js';
import {LineDrawer, drawBuffer} from './src/js/drawers.js';
// import WaveSurfer from "./lib/wavesurfer.js"
import {MainAudio, AudioTrack, SimpleAudioWorkletNode} from "./src/js/audio_loader.js";





//@ts-check

// const audioUrl = "https://wasabi.i3s.unice.fr/WebAudioPluginBank/BasketCaseGreendayriffDI.mp3";
var audioUrl = "./song/BasketCaseGreendayriffDI.mp3";
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
// const audioCtx = new AudioContext();
/** @type {HTMLButtonElement} */

const btnStart = document.getElementById("btn-start");
/** @type {HTMLButtonElement} */

const zoomIn = document.getElementById("btn-zoom-in");
/** @type {HTMLButtonElement} */

const zoomOut = document.getElementById("btn-zoom-out");


const btnTime = document.getElementById("time");


const btnRestart = document.getElementById("restart");

const mount = document.getElementById("mount");
var zoom = 1;
export var paused = false;

export var x;

/** @type {HTMLInputElement} */

const inputLoop = document.getElementById("btn-check-2-outlined");
//@ts-ignore
const volumeinput = document.getElementById("volume");

//@ts-ignore
const inputMute = document.getElementById("Mute");
const volspan = document.getElementById("volspan");

//@ts-ignore
var currentPluginAudioNode;

//music duration
//@ts-ignore
export var dur = 0;


const connectPlugin = (sourceNode, audioNode) => {
    sourceNode.connect(audioNode);
    audioNode.connect(audioCtx.destination);
};



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
    console.log(btn);
}

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


/**
 * Display plugin info
 * @param {WebAudioModule} instance
 * @param {HTMLElement} gui
 */
const showPluginInfo = async (instance, gui) => {
    /** @type {HTMLDivElement} */
    const pluginInfoDiv = document.querySelector('#pluginInfoDiv');
    const paramInfos = await instance.audioNode.getParameterInfo();
    let guiWidth;
    let guiHeight;
    try {
        guiWidth = gui.properties.dataWidth.value;
        guiHeight = gui.properties.dataHeight.value;
    } catch (err) {
        guiWidth = 'undefined, (you should define get properties in Gui.js)';
        guiHeight = 'undefined, (you should define get properties in Gui.js)';
    }

    let parameterList = '';

    Object.entries(paramInfos).forEach(([key, value]) => {
        parameterList += `<li><b>${key}</b> : ${JSON.stringify(value)}</li>`;
    });

    pluginInfoDiv.innerHTML = `
	<li><b>instance.descriptor :</b> ${JSON.stringify(instance.descriptor)}</li>
	<li><b>gui.properties.dataWidth.value</b> : ${guiWidth}</li>
	<li><b>gui.properties.dataHeight.value</b> : ${guiHeight}</li>
	<li><b>instance.audioNode.getParameterInfo() :</b>
		<ul>
		   ${parameterList}
		</ul>
	</li>
	`;
};


/**
 * @param {import('../api/src').WamNode} wamNode
 */
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


function dropHandler(ev) {
    console.log('File(s) dropped');

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
    let files = ev.dataTransfer.files;
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        console.log(file);
    }
    return file.name;
}




function dragOverHandler(ev) {
    console.log('File(s) in drop zone');

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
}

// Create an instance
let dropZone = document.querySelector("#drop_zone");
dropZone.addEventListener("drop", (ev) => {
    dropHandler(ev)
});
dropZone.addEventListener("dragover", (ev) => {
    dragOverHandler(ev)
});

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

    let lineDrawer = new LineDrawer(canvas1);
    lineDrawer.duration = mainAudio.tracks[0].duration;

     // définition du canvas pour l'onde
    canvas0.height = 300;
    canvas0.width = 1000;
     // définition du canvas pour la barr ed'avancement
    canvas1.height = 300;
    canvas1.width = 1000;

    drawBuffer(canvas0, mainAudio.tracks[0].decodedAudioBuffer, "red", 1000, 300)
    // drawBuffer(canvas0, mainAudio.tracks[1].decodedAudioBuffer, "red", 1000, 300)

    // let operableDecodedAudioBuffer = Object.setPrototypeOf(
    //     decodedAudioBuffer,
    //     OperableAudioBuffer.prototype
    // );
    // const node = new SimpleNode(audioCtx);
    // node.setAudio(operableDecodedAudioBuffer.toArray());
    // node.connect(audioCtx.destination);

    // const { default: initializeWamHost } = await import("./plugins/testBern/utils/sdk/src/initializeWamHost.js");
    // const [hostGroupId] = await initializeWamHost(audioCtx);
    //
    //
    //
    // const { default: WAM } = await import ("./plugins/testBern/index.js");
    // const instance = await WAM.createInstance(hostGroupId, audioCtx);
    //
    // connectPlugin(mainAudio.node, instance._audioNode);
    // currentPluginAudioNode = instance._audioNode;
    //
    // const pluginDomModel = await instance.createGui();
    //
    // // plugin info for automation
    // // showPluginInfo(instance, pluginDomModel);
    // await populateParamSelector(instance.audioNode);
    //
    // mountPlugin(pluginDomModel);
    //
    // // source.connect(node).connect(audioCtx.destination);
    // connectPlugin(mainAudio.masterVolumeNode, gainNode);

    // mainAudio.node.parameters.get("playing").value = 0;
    // mainAudio.node.parameters.get("loop").value = 1;
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
                lineDrawer.paused = true;
            } else {
                // if (!lineDrawer.launched) {
                //     lineDrawer.drawLine(track.audioWorkletNode.decodedAudioBuffer);
                // }
                track.audioWorkletNode.parameters.get("playing").value = 1;
                btnStart.textContent = "Stop";
                lineDrawer.paused = false;
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
    volspan.onchange = (e) => {
        if (inputMute.checked) {
            mainAudio.masterVolumeNode.gain.value = -1;
        } else {
            changeVol(mainAudio.masterVolumeNode, volumeinput);
        }
    }
    inputMute.onchange = () => {
        
        if (inputMute.checked) {
            mainAudio.masterVolumeNode.gain.value = -1;
        } else {
            changeVol(mainAudio.masterVolumeNode, volumeinput);
        }
    };
})();


