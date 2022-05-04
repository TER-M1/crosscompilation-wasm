import OperableAudioBuffer from './operable-audio-buffer.js'
import {drawBuffer} from "./drawers.js";


class MainAudio {
    /**
     *
     * @type {[AudioTrack]}
     */
    tracks = [];
    tracksDiv = document.querySelector(".tools-tracks");
    canvasDiv = document.querySelector(".audio-tracks");

    constructor(audioCtx) {
        this.audioCtx = audioCtx;
        this.canvas = [];
        this.maxGlobalTimer = 0;
        this.masterVolumeNode = audioCtx.createGain();
        this.masterVolumeNode.connect(this.audioCtx.destination);
    }

    addTrack(track) {
        return new Promise(async (resolve, reject) => {
            try {
                await track.load();
                this.maxGlobalTimer = Math.max(track.duration, this.maxGlobalTimer)
                track.gainOutNode.connect(this.masterVolumeNode);
                this.tracks.push(track);

                let waveForm = document.createElement("wave-form");
                track.id = this.tracks.length - 1;
                waveForm.id = "track" + track.id;
                this.canvasDiv.appendChild(waveForm);

                let trackCanvas = waveForm.canvas;
                trackCanvas.width = 4000;
                trackCanvas.height = 99;
                this.canvas.push(trackCanvas)
                drawBuffer(trackCanvas, track.decodedAudioBuffer, "#" + Math.floor(Math.random() * 16777215).toString(16));

                let trackEl = document.createElement("track-element");
                trackEl.track = track;
                trackEl.id = "track" + track.id;
                trackEl.className = `track-element`;
                this.tracksDiv.appendChild(trackEl);
                console.log(`${track.name} loaded...`);
                resolve(track);
            } catch (e) {
                reject(e);
            }
        });
    }

    removeTrack(track) {
        track.audioWorkletNode.disconnect();
        console.log(this.tracks)
        this.tracks = this.tracks.filter(function (ele) {
            return ele !== track;
        });
    }
}


class AudioTrack {
    operableDecodedAudioBuffer = undefined;
    decodedAudioBuffer = undefined;
    duration = undefined;
    _isMuted = false;

    /**
     *
     * @param{AudioContext} audioCtx
     * @param{AudioWorkletNode} audioWorkletNode
     * @param{String} fpath
     * @param{Number} id
     * @param initWamHostPath
     * @param wamIndexPath
     */
    constructor(audioCtx, audioWorkletNode, fpath, id, initWamHostPath = "", wamIndexPath = "") {
        this.audioCtx = audioCtx;
        this.audioWorkletNode = audioWorkletNode;
        this.fpath = fpath;
        this.id = id;
        this.pannerNode = this.audioCtx.createStereoPanner();
        this.gainOutNode = this.audioCtx.createGain();
        this.oldGainValue = this.gainOutNode.gain.value;
        this.name = this.fpath.split("/").pop();
        this.initWamHostPath = initWamHostPath;
        this.wamIndexPath = wamIndexPath;
    }

    async load() {
        let response = await fetch(this.fpath);
        let audioArrayBuffer = await response.arrayBuffer();
        this.decodedAudioBuffer = await this.audioCtx.decodeAudioData(audioArrayBuffer);
        this.duration = this.decodedAudioBuffer.duration;
        this.operableDecodedAudioBuffer = Object.setPrototypeOf(
            this.decodedAudioBuffer,
            OperableAudioBuffer.prototype
        );
        this.audioWorkletNode.setAudio(this.operableDecodedAudioBuffer.toArray());
        this.audioWorkletNode.connect(this.pannerNode).connect(this.gainOutNode);
    }

    isMuted() {
        return this._isMuted;
    }

    mute() {
        this.setVolume(0);
        this._isMuted = true;
    }

    unMute() {
        this._isMuted = false;
    }

    setVolume(value) {
        this.gainOutNode.gain.value = value;
    }
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const mainAudio = new MainAudio(audioCtx);
if (audioCtx.state === "suspended") {
    audioCtx.resume();
}

const template = document.createElement("template");
template.innerHTML = /*html*/`

<script src="https://cdn.jsdelivr.net/npm/jquery@3.3.1/dist/jquery.min.js"></script>
<script src="../../lib/semantic.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fomantic-ui@2.8.8/dist/components/icon.min.css">
<link rel="stylesheet" href="../../lib/semantic.min.css" type="text/css">

<style>

.tracks {
    margin-top: 1.9em;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    height: 100%;
    background-color: #1C1E21;
}

.tools-tracks {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    background-color: #1C1E21;
    /*border: 1px solid black;*/
    /*border-top: none;*/
    /*border-bottom: none;*/
    font-family: monospace;
    font-weight: bold;
    font-size: 1em;
    color: lightgray;
    overflow: scroll;
    min-width: 192px;
}
.track-element {
    border: 1px solid black;
    min-height: 100px;
    width: 180px;
    background-color: #31353A;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
}
.track-element-color {
    flex-grow: 3;
    background-color: greenyellow;
}

.track-element-tools {
    flex-grow: 20;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
}
.track-name {
    padding-top: 0.5em;
    padding-left: 3em;
    /*flex-grow: 1;*/
    color: lightgray;
    font-family: monospace;
    font-weight: bold;
    font-size: 1.1em;
}
.track-volume, .balance {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    width: 100%;
    padding-right: 0.5em;
    padding-left: 0.5em;
    justify-content: space-around;
    align-items: center;
}
.right-icon, .left-icon, .mute-icon, .solo-icon {
    font-size: 1.3em;
    font-weight: bold;
    font-family: monospace;
    font-style: normal;
    pointer-events: none;
}

.left-icon {
    color: lightgray;
    padding-left: 2px;
    padding-right: 1px;
}

.right-icon {
    color: lightgray;
    padding-left: 1px;
    padding-right: 4px;
}

.mute-icon, .solo-icon {
    font-size: 1.3em;
}
a.item.tool.mute:link {
    text-decoration: inherit;
    color: inherit;
    cursor: auto;
}

.ui.inverted.grey.slider.track {
    padding-top: 0.2em !important;
    padding-bottom: 0.2em !important;
    padding-left: 1em !important;
    padding-right: 1em !important;
}

.track-controls {
    padding-top: 0.2em;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    width: 100%;
    /*flex-grow: 6;*/
    align-items: center;
    justify-content: space-around;
}

.item.tool {
    color: grey;
}

.item.tool:hover {
    color: white;
}

a.item.menu {
    background-color: #4d5ed1 !important;
}

a.item.menu:hover {
    background-color: #4d5ed1 !important;
}

a.item.volume-slider {
    width: 15em; height: auto;
}
i.icon {
    margin: 0 !important;
}

</style>

<div class="track-element-tools">
    <div class="track-name">
        
        
    </div>
    <div class="track-volume">
        <i class="volume down icon"></i>
        <div class="slider track sound"><input type="range" min="0" max="1" value=".5" step=".01" class="input track sound"></div>
        <i class="volume up icon"></i>

    </div>
    <div class="balance">
        <i class="left-icon">L</i>
        <div class="track balance"><input type="range" min="-1" max="1" value="0" step=".1" class="input track balance"></div>
        <i class="right-icon">R</i>

    </div>

    <div class="track-controls">
        <a class="item tool mute">
            <i class="mute-icon">M</i>
        </a>
        <a class="item tool solo">
            <i class="mute-icon">S</i>
        </a>
        <a class="item tool">
            <i class="project diagram icon"></i>
        </a>
    </div>
</div>
<div class="track-element-color"></div>


  `;

class TrackElement extends HTMLElement {
    /**
     *
     * @type {AudioTrack}
     */
    track = undefined;

    constructor() {
        super();
        this.attachShadow({mode: "open"});
    }


    connectedCallback() {
        this.shadowRoot.innerHTML = template.innerHTML;
        this.fixTrackNumber();
        this.defineListeners();
        this.defineRemoveTrack();
    }

    disconnectedCallback() {

    }

    fixTrackNumber() {
        const name = this.shadowRoot.querySelector(".track-name");
        name.id = `${this.track.id}`;
        name.innerHTML = `
        ${this.track.name}
        <a class="item tool close">
        <i class="times red icon"></i>
        </a>
        `;
    }

    defineListeners() {
        const rangeInputSound = this.shadowRoot.querySelector("input.track.sound");
        rangeInputSound.oninput = (e) => {
            if (!this.track.isMuted()) {
                this.track.setVolume(rangeInputSound.value);
            }
            this.track.oldGainValue = rangeInputSound.value;
        };

        const rangeInputBalance = this.shadowRoot.querySelector("input.track.balance");
        rangeInputBalance.oninput = (e) => {
            this.track.pannerNode.pan.value = rangeInputBalance.value;
        };

        const muteTrack = this.shadowRoot.querySelector(".item.tool.mute");

        muteTrack.onclick = () => {
            if (this.track.isMuted()) {
                muteTrack.style.color = null;
                this.track.gainOutNode.gain.value = this.track.oldGainValue;
                this.track.setVolume(this.track.oldGainValue);
                this.track.unMute();
            } else {
                this.track.oldGainValue = this.track.gainOutNode.gain.value;
                muteTrack.style.color = "red";
                this.track.mute();
            }
        }
    }

    defineRemoveTrack() {
        // let removeButton = this.shadowRoot.querySelector(".red.icon");
        // this.shadowRoot.querySelector(".item.tool.close").onclick = () => {
        //     console.log("should remove the track");
        //     this.track.audioWorkletNode.disconnect();
        //     document.querySelector(`.wave-form.track${this.id}`).remove();
        //     this.remove();
        // }
        this.shadowRoot.querySelector(".item.tool.close").onclick = () => {
            document.querySelector(`.wave-form.track${this.track.id}`).remove();
            this.remove();
            mainAudio.removeTrack(this.track);
        }
    }
}

customElements.define(
    "track-element",
    TrackElement
);

const templateCanvas = document.createElement("template");
templateCanvas.innerHTML = /*html*/`
<canvas height="99" width="2000" class="can"></canvas>
`;


class WaveForm extends HTMLElement {
    id = undefined;
    canvas = undefined;

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        // this.className = "wave-form"
    }


    connectedCallback() {
        this.shadowRoot.innerHTML = templateCanvas.innerHTML;
        this.defClass();
        this.defId();
    }

    disconnectedCallback() {

    }

    defClass() {
        console.log("wave-form defined")
        this.className = `wave-form ${this.id}`
    }

    defId() {
        this.canvas = this.shadowRoot.querySelector(".can");
        this.canvas.id = this.id;
    }


}

customElements.define(
    "wave-form",
    WaveForm
);


export class SimpleAudioWorkletNode extends AudioWorkletNode {
    playhead = 0;

    /**
     * @param {BaseAudioContext} context
     */
    constructor(context) {
        super(context, "simple-processor");
        this.port.onmessage = (e) => {
            if (e.data.playhead) {
                this.playhead = e.data.playhead;
            }
        }
    }

    /** @param {number} position set playhead in seconds */
    setPosition(position) {
        this.port.postMessage({position});
    }

    getPlayheadPosition() {
        return playhead;
    }

    /**
     * @param {Float32Array[][]} audio
     */
    setAudio(audio) {
        this.port.postMessage({audio});
    }
}


export {MainAudio, AudioTrack, mainAudio, audioCtx};