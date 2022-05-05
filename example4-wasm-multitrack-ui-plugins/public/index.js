import {MainAudio, AudioTrack, SimpleAudioWorkletNode, audioCtx, mainAudio} from "./src/js/audio_loader.js";
import {connectPlugin, mountPlugin, addEventOnPlugin, populateParamSelector} from "./src/js/plugin_parameters.js";
import {updateAudioTimer} from "./src/js/timer.js";
import {activateMainVolume, exploreTracks} from "./src/js/page_init.js";


const btnStart = document.getElementById("btn-start");
const zoomIn = document.getElementById("btn-zoom-in");
const zoomOut = document.getElementById("btn-zoom-out");
const btnRestart = document.getElementById("restart");
const inputLoop = document.getElementById("loop");
const volumeinput = document.getElementById("volume");
const inputMute = document.getElementById("mute");

var currentPluginAudioNode;


/**
 *
 * @param{MainAudio} mainAudio
 */
function updateCursorTracks(track) {
    for(let i = 0; i < mainAudio.tracks.length; i++) {
        let playHead = mainAudio.tracks[i].audioWorkletNode.playhead;
        let trackCanvas = mainAudio.tracks[i].canvas;

        let ctx = trackCanvas.getContext("2d");
        ctx.clearRect(0, 0, trackCanvas.width, trackCanvas.height);
        ctx.putImageData(trackCanvas.bufferState, 0, 0);

        let rapport = (playHead * 100) / mainAudio.tracks[i].operableDecodedAudioBuffer.length;
        let position = (trackCanvas.width / 100) * rapport;

        ctx.fillStyle = "lightgrey";
        ctx.fillRect(position, 0, 2, trackCanvas.height);
    }
}

(async () => {
    var val;
    let mute = false;
    var intervalTimerId = undefined;
    var intervalCursorTracks = undefined;
    btnStart.hidden = false;
    // var trackElements = $(".track.sound");
    // let t = document.getElementsByClassName("track sound");


    /*
    PROCESSOR INITIALIZATION
     */
    await audioCtx.audioWorklet.addModule("./src/js/processor.js");


    /*
    INITIALIZATION PAGES ELEMENTS
     */
    updateAudioTimer(mainAudio);
    activateMainVolume(mainAudio, val);
    exploreTracks();


    /*
    PLUGIN CONNECTION
     */
    // const {default: initializeWamHost} = await import("./plugins/testBern/utils/sdk/src/initializeWamHost.js");
    // const [hostGroupId] = await initializeWamHost(audioCtx);
    //
    // var {default: WAM} = await import ("https://michael-marynowicz.github.io/TER/pedalboard/index.js");
    // var instance = await WAM.createInstance(hostGroupId, audioCtx);
    // connectPlugin(audioCtx, mainAudio.tracks[0].audioWorkletNode, instance._audioNode);
    // currentPluginAudioNode = instance._audioNode;
    // connectPlugin(audioCtx, mainAudio.tracks[0].audioWorkletNode, mainAudio.masterVolumeNode);
    // var pluginDomModel = await instance.createGui();
    // mountPlugin(document.querySelector("#mount2"), pluginDomModel);


    /*
    PLUGIN PARAMETERS CONNECTION
     */
    // await populateParamSelector(instance._audioNode);
    //
    // pluginParamSelector.onclick = () => {
    //     populateParamSelector(instance._audioNode);
    // };
    //
    // addEventOnPlugin(currentPluginAudioNode);


    /*
    EVENT LISTENERS
     */
    btnStart.onclick = () => {
        mainAudio.tracks.forEach((track) => {
            if (audioCtx.state === "suspended") {
                audioCtx.resume();
                if (intervalCursorTracks === undefined) {
                    intervalCursorTracks = setInterval(() => {
                        updateCursorTracks(mainAudio);
                    }, 33);
                }
            }
            const playing = track.audioWorkletNode.parameters.get("playing").value;
            if (playing === 1) {
                track.audioWorkletNode.parameters.get("playing").value = 0;
                console.log(intervalTimerId);
                if (intervalTimerId !== undefined) {
                    clearInterval(intervalTimerId);
                    intervalTimerId = undefined;
                    // console.log(intervalTimerId);
                }
                if (intervalCursorTracks !== undefined) {
                    updateCursorTracks(mainAudio)
                    clearInterval(intervalCursorTracks);
                    intervalCursorTracks = undefined;
                }
                // lineDrawer.paused = true;
            } else {
                track.audioWorkletNode.parameters.get("playing").value = 1;
                if (intervalTimerId === undefined) {
                    intervalTimerId = setInterval(() => {
                        updateAudioTimer(mainAudio);
                        mainAudio.maxGlobalTimer -= 1.;
                    }, 1000);
                }
                if (intervalCursorTracks === undefined) {
                    intervalCursorTracks = setInterval(() => {
                        updateCursorTracks(mainAudio);
                    }, 33);
                }
            }
        });
    };
    inputLoop.onclick = () => {
        console.log("loop pressed")
        mainAudio.tracks.forEach((track) => {
            const loop = track.audioWorkletNode.parameters.get("loop").value;
            if (loop === 1) {
                track.audioWorkletNode.parameters.get("loop").value = 0;
                inputLoop.checked = false;
            } else {
                track.audioWorkletNode.parameters.get("loop").value = 1;
                inputLoop.checked = true;
            }
        })

    };

    inputMute.onclick = () => {
        if (!mute) {
            console.log("mute");
            // mainAudio.tracks.forEach((track) => {
            // track.gainOutNode.value = 0;
            // });

            mainAudio.masterVolumeNode.gain.value = 0;
            mute = true;
        } else {
            console.log("unmute");
            mainAudio.masterVolumeNode.gain.value = val;
            // mainAudio.tracks.forEach((track) => {
            //     track.gainOutNode.value = val;
            //     });
            mute = false;
        }
    };
})();
