class AudioPlayerNode extends AudioWorkletNode {
    /**
     * @param {BaseAudioContext} context
     * @param {number} channelCount
     */
    constructor(context, channelCount, processor) {
        super(context, processor, {
            channelCount
        });

    }
    /**
     * @param {Float32Array[]} audio
     */
    setAudio(audio) {
        this.port.postMessage({ audio });
    }
    /** @param {number} position éset playhead in seconds */
    setPosition(position) {
        this.port.postMessage({ position });
    }
}

export default AudioPlayerNode;
