import OperableAudioBuffer from './operable-audio-buffer.js'
import {drawBuffer} from "./drawers.js";


const template = document.createElement("template");
template.innerHTML = /*html*/`

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