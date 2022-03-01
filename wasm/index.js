(async () => {
    // const { default: OperableAudioBuffer } = await import("./operable-audio-buffer.js");
    // const { default: AudioPlayerNode } = await import("./audio-player-node.js");
    // const audioUrl = "https://wasabi.i3s.unice.fr/WebAudioPluginBank/BasketCaseGreendayriffDI.mp3";



    const audioCtx = new window.AudioContext();
    // const response = await fetch(audioUrl);
    // const audioArrayBuffer = await response.arrayBuffer();
    // const audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);
    // const operableAudioBuffer = Object.setPrototypeOf(audioBuffer, OperableAudioBuffer.prototype);


    await audioCtx.audioWorklet.addModule('wasm-worklet-processor.js');
    const oscillator = new OscillatorNode(audioCtx);
    const bypasser = new AudioWorkletNode(audioCtx, 'wasm-worklet-processor');
    // const bypasser = new AudioWorkletNode(audioCtx, 'wasm-worklet-processor');
    // bypasser.setAudio(operableAudioBuffer.toArray())
    oscillator.connect(bypasser).connect(audioCtx.destination);
    // bypasser.connect(audioCtx.destination);

    var playing = 0;
    var hasStartedOnce = 0;
    // bypasser.start();

    var btnStart = document.getElementById("btn-start");
    btnStart.onclick = () => {
        console.log(audioCtx.state);
        if (audioCtx.state === "suspended") audioCtx.resume();
        // const playing = bypasser.parameters.get("playing").value;
        if (playing === 1) {
            // bypasser.parameters.get("playing").value = 0;
            btnStart.textContent = "Start";

            audioCtx.suspend();
            // await audioCtx.suspend();

        } else {
            playing = 1;
            // bypasser.parameters.get("playing") = 1;

            btnStart.textContent = "Stop";
            if (!hasStartedOnce) {
                hasStartedOnce = !hasStartedOnce;
                oscillator.start();
            } else {
                audioCtx.resume();
            }
        }
    };

})();