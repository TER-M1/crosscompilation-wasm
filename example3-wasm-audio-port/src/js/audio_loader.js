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


export class MainAudio {
    /**
     *
     * @type {[AudioTrack]}
     */
    tracks = [];

    constructor(audioCtx, node) {
        this.audioCtx = audioCtx;
        this.node = node;
        // this.processorPath = processorPath;
        // this.audioCtx.audioWorklet.addModule(this.processorPath);
        // this.audioCtx.audioWorklet.addModule("./src/js/processor.js");
    }

    async addTrack(track) {
        // if (this.node === undefined) {
        //     this.node = track.node;
        // }
        // else {
        //     this.node.connect(track.node);
        // }
        // this.node.connect(this.audioCtx.destination)
        this.node.connect(track.node);
        await track.load();


        this.tracks.push(track);

    }
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
        this.node.connect(this.audioCtx.destination);
    }


}