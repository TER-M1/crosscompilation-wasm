import Module from "./compiled_processor_perf.js";
import {
  RENDER_QUANTUM_FRAMES,
  MAX_CHANNEL_COUNT,
  HeapAudioBuffer,
} from "./lib/wasm-audio-helper.js";

class SimpleProcessor extends AudioWorkletProcessor {
  /** @type {AudioParamDescriptor[]} */
  static get parameterDescriptors() {
    return [
      {
        name: "playing",
        minValue: 0,
        maxValue: 1,
        defaultValue: 0,
      },
      {
        name: "loop",
        minValue: 0,
        maxValue: 1,
        defaultValue: 0,
      },
    ];
  }

  constructor(options) {
    super(options);
    this.audio = null;
    this.playhead = 0;

    this.port.onmessage = (e) => {
      if (e.data.audio) {
        this.audio = e.data.audio;
      } else if (typeof e.data.position === "number") {
        this.playhead = e.data.position * 44100;
      }
    };

    this._heapInputBuffer = new HeapAudioBuffer(
      Module,
      RENDER_QUANTUM_FRAMES,
      2,
      MAX_CHANNEL_COUNT
    );
    this._heapOutputBuffer = new HeapAudioBuffer(
      Module,
      RENDER_QUANTUM_FRAMES,
      2,
      MAX_CHANNEL_COUNT
    );
    this._processPerf = new Module.ProcessorPerf();
  }

  /**
   * @param {Float32Array[][]} inputs
   * @param {Float32Array[][]} outputs
   * @param {Record<string, Float32Array>} parameters
   */
  process(inputs, outputs, parameters) {
    // Use the 1st input and output only to make the example simpler. |input|
    // and |output| here have the similar structure with the AudioBuffer
    // interface. (i.e. An array of Float32Array)
    let input = inputs[0];
    let output = outputs[0];
    const bufferSize = outputs[0][0].length;
    const audioLength = input.length;

    // For this given render quantum, the channel count of the node is fixed
    // and identical for the input and the output.
    let channelCount = input.length;

    // Prepare HeapAudioBuffer for the channel count change in the current
    // render quantum.
    this._heapInputBuffer.adaptChannel(channelCount);
    this._heapOutputBuffer.adaptChannel(channelCount);

    // Copy-in, process and copy-out.
    const playing = parameters.playing[0];
    if (playing) {
      for (let channel = 0; channel < channelCount; ++channel) {
        this._heapInputBuffer.getChannelData(channel).set(input[channel]);
      }

      this.playhead = this._processPerf.processPerf(
        this._heapInputBuffer.getHeapAddress(),
        this._heapOutputBuffer.getHeapAddress(),
        channelCount,
        this.playhead
      );
      for (let channel = 0; channel < channelCount; ++channel) {
        output[channel].set(this._heapOutputBuffer.getChannelData(channel));
      }
    }
    return true;
  }
}

registerProcessor("simple-processor", SimpleProcessor);
