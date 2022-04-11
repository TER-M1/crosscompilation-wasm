import OperableAudioBuffer from './operable-audio-buffer.js'

export class MainAudio {
    tracks = [];

    constructor(audioCtx, node, processorPath = "./src/js/processor.js") {
        this.audioCtx = audioCtx;
        this.node = node;
        this.audioCtx.audioWorklet.addModule(processorPath);
        // this.audioCtx.audioWorklet.addModule("./src/js/processor.js");
    }

    addTrack(track) {
        this.node.connect(track.node);
        tracks.push(track);
    }

    async connectPlugin(wamHost, wamPath) {
        const { default: initializeWamHost } = await import(wamHost);
        const [hostGroupId] = await initializeWamHost(audioCtx);

        const { default: WAM } = await import (wamPath);
        const instance = await WAM.createInstance(hostGroupId, audioCtx);
        connectPlugin(node, instance._audioNode);
        currentPluginAudioNode = instance._audioNode;

        const pluginDomModel = await instance.createGui();

        // plugin info for automation
        // showPluginInfo(instance, pluginDomModel);
        populateParamSelector(instance.audioNode);

        mountPlugin(pluginDomModel);
    }
}


export class AudioTrack {
    // audioArrayBuffer = undefined;
    // decodedAudioBuffer = undefined;
    operableDecodedAudioBuffer = undefined;
    duration = undefined;
    constructor(audioCtx, node, fpath) {
        this.audioCtx = audioCtx;
        this.fpath = fpath;
        this.load();
    }

    load(mainNode) {
        let response = await fetch(this.fpath);
        let audioArrayBuffer = await response.arrayBuffer();
        let decodedAudioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);
        this.duration = decodedAudioBuffer.duration;
        this.operableDecodedAudioBuffer = Object.setPrototypeOf(
            decodedAudioBuffer,
            OperableAudioBuffer.prototype
        );
        this.node.setAudio(operableDecodedAudioBuffer.toArray());
    }


}