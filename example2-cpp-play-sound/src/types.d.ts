interface AudioParamDescriptor {
    automationRate?: AutomationRate;
    defaultValue?: number;
    maxValue?: number;
    minValue?: number;
    name: string;
}
interface AudioWorkletProcessor {
    port: MessagePort;
    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean;
}
const AudioWorkletProcessor: {
    prototype: AudioWorkletProcessor;
    parameterDescriptors: AudioParamDescriptor[];
    new (options: AudioWorkletNodeOptions): AudioWorkletProcessor;
};

interface AudioWorkletGlobalScope {
    AudioWorkletGlobalScope: any;
    globalThis: AudioWorkletGlobalScope;
    registerProcessor: (name: string, constructor: new (options: any) => AudioWorkletProcessor) => void;
    currentFrame: number;
    currentTime: number;
    sampleRate: number;
    AudioWorkletProcessor: typeof AudioWorkletProcessor;
}
