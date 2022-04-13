import OperableAudioBuffer from './operable-audio-buffer.js'

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

    constructor(audioCtx) {
        this.audioCtx = audioCtx;
        this.masterVolumeNode = audioCtx.createGain();
        this.masterVolumeNode.connect(this.audioCtx.destination);
    }

    async addTrack(track) {
        await track.load();
        track.gainOutNode.connect(this.masterVolumeNode);
        this.tracks.push(track);
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