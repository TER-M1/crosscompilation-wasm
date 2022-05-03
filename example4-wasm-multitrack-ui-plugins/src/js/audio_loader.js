import OperableAudioBuffer from './operable-audio-buffer.js'
import {drawBuffer} from "./drawers.js";


const template = document.createElement("template");
template.innerHTML = /*html*/`
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
        
        <i class="times red icon"></i>
    </div>
    <div class="track-volume">
        <i class="volume down icon"></i>
        <div class="ui inverted grey slider track sound small "></div>
        <i class="volume up icon"></i>

    </div>
    <div class="balance">
        <i class="left-icon">L</i>
        <div class="ui inverted grey slider track balance small"></div>
        <i class="right-icon">R</i>

    </div>

    <div class="track-controls">
        <a class="item tool">
            <i class="mute-icon">M</i>
        </a>
        <a class="item tool">
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
     * @param {AudioTrack} track
     * @param {String} id
     */
    constructor(){
        super();
        this.attachShadow({ mode: "open" });
    }



    connectedCallback(){
        this.track = this.attributes.track.value;
        this.id = this.attributes.id.value;
        console.log(this.track);

        console.log("element defined");

        // this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.innerHTML = template.innerHTML;
        // this.innerHTML = template.innerHTML;
        this.fixTrackNumber();
        this.defineListeners();
        this.defineRemoveTrack();
    }

    disconnectedCallback() {

    }

    fixTrackNumber(){
        const name = this.shadowRoot.querySelector(".track-name");
        name.id = this.id;
        name.innerHTML = "Track " + this.id;
    }
    defineListeners() {
        // let slider_volume = this.shadowRoot.querySelector(".track.sound");
        // console.log(slider_volume);
        $(".track.sound").slider({
            start: 50,
            value: 50,
            range: 'max',
            min: 0,
            max: 100,
            smooth: true,
            onMove: function (value) {
                let val;
                console.log("track n" + this.id + " val at " + value);
                val = value / 100;
                this.track.gainOutNode.gain.value = val;
            }
        });
        // let slider_balance = this.shadowRoot.querySelector(".track.balance");
        $(".track.balance").slider({
            start  : 0,
            value: 0,
            range  : 'max',
            min    : -1,
            max    : 1,
            smooth: true,
            onMove: function(value) {
                this.track.pannerNode.positionX.value = value;
                console.log('onmove' + value);
            }
        });


    }
    defineRemoveTrack(){
        // let removeButton = this.shadowRoot.querySelector(".red.icon");
        $(".red.icon").onclick = () => {
            console.log("should remove the track");
        }
    }
}

customElements.define(
    "track-element",
    TrackElement
);

export class SimpleAudioWorkletNode extends AudioWorkletNode {
    /**
     * @param {BaseAudioContext} context
     */
    constructor(context) {
        super(context, "simple-processor");
    }

    /** @param {number} position set playhead in seconds */
    setPosition(position) {
        this.port.postMessage({position});
    }

    /**
     * @param {Float32Array[][]} audio
     */
    setAudio(audio) {
        this.port.postMessage({audio});
    }
}


export class MainAudio {
    /**
     *
     * @type {[AudioTrack]}
     */
    tracks = [];
    tracksDiv = document.querySelector(".tools-tracks");
    constructor(audioCtx, canvas=[]) {
        this.audioCtx = audioCtx;
        this.canvas = canvas;
        this.maxGlobalTimer = 0;
        this.masterVolumeNode = audioCtx.createGain();
        this.masterVolumeNode.connect(this.audioCtx.destination);
    }

    async addTrack(track) {
        await track.load();
        this.maxGlobalTimer = Math.max(track.duration, this.maxGlobalTimer)
        track.gainOutNode.connect(this.masterVolumeNode);
        this.tracks.push(track);
        drawBuffer(this.canvas[this.tracks.length - 1], track.decodedAudioBuffer, "#" + Math.floor(Math.random()*16777215).toString(16), 2000, 99);
        let trackEl = document.createElement("track-element");
        trackEl.setAttribute("track", track);
        trackEl.setAttribute("id", this.tracks.length);
        trackEl.className = `track-element`;
        console.log(trackEl);
        this.tracksDiv.appendChild(trackEl);

    }
}


export class AudioTrack {
    operableDecodedAudioBuffer = undefined;
    decodedAudioBuffer = undefined;
    duration = undefined;

    /**
     *
     * @param audioCtx
     * @param audioWorkletNode
     * @param fpath
     * @param initWamHostPath
     * @param wamIndexPath
     */
    constructor(audioCtx, audioWorkletNode, fpath, initWamHostPath = "", wamIndexPath = "") {
        this.audioCtx = audioCtx;
        this.audioWorkletNode = audioWorkletNode;
        this.fpath = fpath;
        this.pannerNode = this.audioCtx.createPanner();
        this.gainOutNode = this.audioCtx.createGain();
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
        // const { default: initializeWamHost } = await import(this.initWamHostPath);
        // const [hostGroupId] = await initializeWamHost(this.audioCtx);
        //
        //
        //
        // const { default: WAM } = await import (this.wamIndexPath);
        // const instance = await WAM.createInstance(hostGroupId, audioCtx);
        //
        // connectPlugin(this.audioWorkletNode, instance._audioNode);
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
        this.pannerNode.connect(this.gainOutNode);
        this.audioWorkletNode.connect(this.pannerNode);
    }
}