/// <reference path="./types.d.ts" />
/** @type {AudioWorkletGlobalScope} */
// @ts-ignore
const { registerProcessor, sampleRate } = globalThis;

const BYTES_PER_SAMPLE = Float32Array.BYTES_PER_ELEMENT;

// The max audio channel on Chrome is 32.
const MAX_CHANNEL_COUNT = 32;

// WebAudio's render quantum size.
const RENDER_QUANTUM_FRAMES = 128;

class AudioPlayerProcessor extends AudioWorkletProcessor {
    /** @type {AudioParamDescriptor[]} */
    static get parameterDescriptors() {
        return [{
            name: "playing",
            minValue: 0,
            maxValue: 1,
            defaultValue: 0
        }, {
            name: "loop",
            minValue: 0,
            maxValue: 1,
            defaultValue: 0
        }];
    }
    /**
     * @param {AudioWorkletNodeOptions} options
     */
    constructor(options) {
        super(options);
        /** @type {Float32Array[]} */
        this.audio = null;
        /** @type {number} */
        this.playhead = 0;
        this.ready = false;
        this.once = true;
        this.cc = 0;
        /** @param {MessageEvent<{ audio?: Float32Array[]; position?: number }>} e */
        this.port.onmessage = (e) => {
            if (e.data.audio) {
                this.audio = e.data.audio;
            } else if (typeof e.data.position === "number") {
                this.playhead = e.data.position * sampleRate;
            } else if (e.data.moduleWasm) {
                this.moduleWasm = e.data.moduleWasm;
                this.setupWasm(options)
                this.ready = true;
            }
        };
    }

    setupWasm() {
        WebAssembly.instantiate(this.moduleWasm)
            .then(instance => {
                this.instance = instance.exports;
                this._processPerf = this.instance.processPerf;
                this.loadBuffers();
            })
            .catch(err => console.log(err));
    }

    async loadBuffers() {
        this._heapInputBuffer = new HeapAudioBufferInsideProcessor(
            this.instance,
            RENDER_QUANTUM_FRAMES,
            2,
            MAX_CHANNEL_COUNT
        );
        this._heapOutputBuffer = new HeapAudioBufferInsideProcessor(
            this.instance,
            RENDER_QUANTUM_FRAMES,
            2,
            MAX_CHANNEL_COUNT
        );
    }

    /**
     * @param {Float32Array[][]} inputs
     * @param {Float32Array[][]} outputs
     * @param {Record<string, Float32Array>} parameters
     */
    process(inputs, outputs, parameters) {
        if (!this.audio || !this.ready) return true;

        let input = [];
        let output = outputs[0];
        let channelCount = this.audio.length;
        const channelCountMin = Math.min(this.audio.length, output.length);

        // Slice the global audio with a RENDER_QUANTUM_FRAMES
        // to send the input to output by block of 128
        for (let i = 0; i < channelCount; i++) {
            input.push(
                this.audio[i].slice(
                    this.playhead - RENDER_QUANTUM_FRAMES,
                    this.playhead
                )
            );
        }

        this._heapInputBuffer.adaptChannel(channelCount);
        this._heapOutputBuffer.adaptChannel(channelCount);

        // Copy-in the current block
        for (let channel = 0; channel < channelCount; ++channel) {
            this._heapInputBuffer.getChannelData(channel).set(input[channel]);
        }

        const bufferSize = outputs[0][0].length;
        const audioLength = this.audio[0].length;
        /** Only one output is used. */
        for (let i = 0; i < bufferSize; i++) {
            const playing = !!(i < parameters.playing.length ? parameters.playing[i] : parameters.playing[0]);
            const loop = !!(i < parameters.loop.length ? parameters.loop[i] : parameters.loop[0]);
            if (!playing) continue; // Not playing
            if (this.playhead >= audioLength) { // Play was finished
                if (loop) this.playhead = 0; // Loop just enabled, reset playhead
                else continue; // EOF without loop
            }

            let returnCode = this._processPerf(
                this._heapInputBuffer.getHeapAddress(),
                this._heapOutputBuffer.getHeapAddress(),
                channelCount
            );
            // Copy-out the current block
            for (let channel = 0; channel < channelCountMin; ++channel) {
                output[channel].set(
                    this._heapOutputBuffer.getChannelData(channel)
                );
            }

            this.playhead++;
        }
        return true;
    }
}

/**
 * A WASM HEAP wrapper for AudioBuffer class. This breaks down the AudioBuffer
 * into an Array of Float32Array for the convinient WASM opearion.
 *
 * @class
 * @dependency Module A WASM module generated by the emscripten glue code.
 */
class HeapAudioBufferInsideProcessor {
    /**
     * @constructor
     * @param  {object} wasmModule WASM module generated by Emscripten.
     * @param  {number} length Buffer frame length.
     * @param  {number} channelCount Number of channels.
     * @param  {number=} maxChannelCount Maximum number of channels.
     */
    constructor(wasmModule, length, channelCount, maxChannelCount) {
        // The |channelCount| must be greater than 0, and less than or equal to
        // the maximum channel count.
        this._isInitialized = false;
        this._module = wasmModule;
        this._length = length;
        this._maxChannelCount = maxChannelCount
            ? Math.min(maxChannelCount, MAX_CHANNEL_COUNT)
            : channelCount;
        this._channelCount = channelCount;
        this._allocateHeap();
        this._isInitialized = true;
    }

    /**
     * Allocates memory in the WASM heap and set up Float32Array views for the
     * channel data.
     *
     * @private
     */
    _allocateHeap() {
        const dataByteSize = this._channelCount * this._length * BYTES_PER_SAMPLE;
        this._dataPtr = this._module.stackAlloc(dataByteSize);
        this._channelData = [];
        for (let i = 0; i < this._channelCount; ++i) {
            // convert pointer to HEAPF32 index
            let startOffset = this._dataPtr / BYTES_PER_SAMPLE + i * this._length;
            let endOffset = startOffset + this._length;
            this._channelData[i] =
                new Float32Array(this._module.memory.buffer).subarray(startOffset, endOffset);
        }
    }

    /**
     * Adapt the current channel count to the new input buffer.
     *
     * @param  {number} newChannelCount The new channel count.
     */
    adaptChannel(newChannelCount) {
        if (newChannelCount < this._maxChannelCount) {
            this._channelCount = newChannelCount;
        }
    }

    /**
     * Getter for the buffer length in frames.
     *
     * @return {?number} Buffer length in frames.
     */
    get length() {
        return this._isInitialized ? this._length : null;
    }

    /**
     * Getter for the number of channels.
     *
     * @return {?number} Buffer length in frames.
     */
    get numberOfChannels() {
        return this._isInitialized ? this._channelCount : null;
    }

    /**
     * Getter for the maxixmum number of channels allowed for the instance.
     *
     * @return {?number} Buffer length in frames.
     */
    get maxChannelCount() {
        return this._isInitialized ? this._maxChannelCount : null;
    }

    /**
     * Returns a Float32Array object for a given channel index. If the channel
     * index is undefined, it returns the reference to the entire array of channel
     * data.
     *
     * @param  {number|undefined} channelIndex Channel index.
     * @return {?Array} a channel data array or an
     * array of channel data.
     */
    getChannelData(channelIndex) {
        // console.log(this._channelData);
        if (channelIndex >= this._channelCount) {
            return null;
        }

        return typeof channelIndex === 'undefined'
            ? this._channelData : this._channelData[channelIndex];
    }

    setChannelData(input, channelIndex) {
        this._channelData[channelIndex] = input[channelIndex];
    }

    setChannelOutputData(output, channelIndex) {
        // let output =
        output = this._channelData[channelIndex];
    }

    /**
     * Returns the base address of the allocated memory space in the WASM heap.
     *
     * @return {number} WASM Heap address.
     */
    getHeapAddress() {
        return this._dataPtr;
    }

    /**
     * Frees the allocated memory space in the WASM heap.
     */
    free() {
        this._isInitialized = false;
        this._module.stackFree(this._dataPtr);
        this._module.stackFree(this._pointerArrayPtr);
        this._channelData = null;
    }
} // class HeapAudioBuffer

try {
    registerProcessor("audio-player-processor", AudioPlayerProcessor);
} catch (error) {
    console.warn(error);
}
