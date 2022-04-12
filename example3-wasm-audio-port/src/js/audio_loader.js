import OperableAudioBuffer from './operable-audio-buffer.js'

export class SimpleNode extends AudioWorkletNode {
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
     * @param {Float32Array[][]} audio
     */
    setAudio(audio) {
        this.port.postMessage({ audio });
    }
}

export class MyAudioNode extends AudioNode {
    constructor() {
        super();
    }

    connect(destinationNode, output, input) {
        return super.connect(destinationNode, output, input);
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
        this.node = undefined;
        // this.processorPath = processorPath;
        // this.audioCtx.audioWorklet.addModule(this.processorPath);
        // this.audioCtx.audioWorklet.addModule("./src/js/processor.js");
    }

    async addTrack(track) {
        if (this.node === undefined) {
            this.node = track.node;
        } else {
            // track.node.connect(this.audioCtx.destination);

            this.node.connect(track.node);
        }
        track.node.connect(this.audioCtx.destination);
        await track.load();

        track.node.connect(this.audioCtx.destination);
        this.tracks.push(track);

    }

    // async connectPlugin(wamHost, wamPath) {
    //     const { default: initializeWamHost } = await import(wamHost);
    //     const [hostGroupId] = await initializeWamHost(audioCtx);
    //
    //     const { default: WAM } = await import (wamPath);
    //     const instance = await WAM.createInstance(hostGroupId, audioCtx);
    //     connectPlugin(node, instance._audioNode);
    //     currentPluginAudioNode = instance._audioNode;
    //
    //     const pluginDomModel = await instance.createGui();
    //
    //     // plugin info for automation
    //     // showPluginInfo(instance, pluginDomModel);
    //     populateParamSelector(instance.audioNode);
    //
    //     mountPlugin(pluginDomModel);
    // }
}


export class AudioTrack {
    // audioArrayBuffer = undefined;
    // decodedAudioBuffer = undefined;
    operableDecodedAudioBuffer = undefined;
    decodedAudioBuffer = undefined;
    duration = undefined;
    constructor(audioCtx, node, fpath) {
        this.audioCtx = audioCtx;
        this.node = node;
        this.fpath = fpath;
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
        this.node.setAudio(this.operableDecodedAudioBuffer.toArray());
    }


}