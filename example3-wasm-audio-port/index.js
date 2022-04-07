
// import { showPluginInfo , populateParamSelector } from './src/js/automation.js';
import { drawBuffer , drawLine  , launched } from './src/js/drawers.js';


class SimpleNode extends AudioWorkletNode {
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

//@ts-check

// const audioUrl = "https://wasabi.i3s.unice.fr/WebAudioPluginBank/BasketCaseGreendayriffDI.mp3";
const audioUrl = "./song/BasketCaseGreendayriffDI.mp3";
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
// const audioCtx = new AudioContext();
const gainNode = audioCtx.createGain();
/** @type {HTMLButtonElement} */
// @ts-ignore
const btnStart = document.getElementById("btn-start");
/** @type {HTMLButtonElement} */
// @ts-ignore
const zoomIn = document.getElementById("btn-zoom-in");
/** @type {HTMLButtonElement} */
// @ts-ignore
const zoomOut = document.getElementById("btn-zoom-out");

// @ts-ignore
const btnTime = document.getElementById("time");

// @ts-ignore
const btnRestart = document.getElementById("restart");

const mount = document.getElementById("mount");
var zoom = 1;
export var paused = false;

export var x;

/** @type {HTMLInputElement} */
// @ts-ignore
const inputLoop = document.getElementById("btn-check-2-outlined");
//@ts-ignore
const volumeinput = document.getElementById("volume");

//@ts-ignore
const inputMute = document.getElementById("Mute");


//@ts-ignore
var currentPluginAudioNode;

//music duration
//@ts-ignore
export var dur = 0;


const connectPlugin = (sourceNode, audioNode) => {
    sourceNode.connect(audioNode);
    audioNode.connect(audioCtx.destination);
    
};



const mountPlugin = (domModel) => {
    mount.innerHTML = '';
    mount.appendChild(domModel);
};

function changeVol(vol) {
    if (vol.value == 0) {
        gainNode.gain.value = -1;
    }
    // @ts-ignore
    else if (!inputMute.checked) {
        console.log(vol.value);

        gainNode.gain.value = vol.value * 0.000001;
    }
}
function muteUnmuteTrack(btn) {
    console.log(btn);
}

/** @type {HTMLSelectElement} */ const pluginParamSelector = document.querySelector('#pluginParamSelector');
/** @type {HTMLInputElement} */ const pluginAutomationLengthInput = document.querySelector('#pluginAutomationLength');
/** @type {HTMLInputElement} */ const pluginAutomationApplyButton = document.querySelector('#pluginAutomationApply');
/** @type {HTMLDivElement} */ const bpfContainer = document.querySelector('#pluginAutomationEditor');

pluginParamSelector.addEventListener('input', async (e) => {
	if (!currentPluginAudioNode) return;
	const paramId = e.target.value;
	if (paramId === '-1') return;
	if (Array.from(bpfContainer.querySelectorAll('.pluginAutomationParamId')).find(/** @param {HTMLSpanElement} span */(span) => span.textContent === paramId)) return;
	const div = document.createElement('div');
	div.classList.add('pluginAutomation');
	const span = document.createElement('span');
	span.classList.add('pluginAutomationParamId');
	span.textContent = paramId;
	div.appendChild(span);
	const bpf = document.createElement('webaudiomodules-host-bpf');
	const info = await currentPluginAudioNode.getParameterInfo(paramId);
	const { minValue, maxValue, defaultValue } = info[paramId];
	bpf.setAttribute('min', minValue);
	bpf.setAttribute('max', maxValue);
	bpf.setAttribute('default', defaultValue);
	div.appendChild(bpf);
	bpfContainer.appendChild(div);
	pluginParamSelector.selectedIndex = 0;
});
pluginAutomationLengthInput.addEventListener('input', (e) => {
	const domain = +e.target.value;
	if (!domain) return;
	bpfContainer.querySelectorAll('webaudiomodules-host-bpf').forEach(/** @param {import("./src/js/bpf").default} bpf */(bpf) => {
		bpf.setAttribute('domain', domain);
	});
});
pluginAutomationApplyButton.addEventListener('click', () => {
	if (!currentPluginAudioNode) return;
	bpfContainer.querySelectorAll('.pluginAutomation').forEach(/** @param {HTMLDivElement} div */(div) => {
		const paramId = div.querySelector('.pluginAutomationParamId').textContent;
		/** @type {import("./src/js/bpf").default} */  
        const bpf = div.querySelector('webaudiomodules-host-bpf');
        console.log(bpf);
		bpf.apply(currentPluginAudioNode, paramId);
	});
});


/**
 * Display plugin info
 * @param {WebAudioModule} instance
 * @param {HTMLElement} gui
 */
 const showPluginInfo = async (instance, gui) => {
	/** @type {HTMLDivElement} */
	const pluginInfoDiv = document.querySelector('#pluginInfoDiv');
	const paramInfos = await instance.audioNode.getParameterInfo();
	let guiWidth;
	let guiHeight;
	try {
		guiWidth = gui.properties.dataWidth.value;
		guiHeight = gui.properties.dataHeight.value;
	} catch (err) {
		guiWidth = 'undefined, (you should define get properties in Gui.js)';
		guiHeight = 'undefined, (you should define get properties in Gui.js)';
	}

	let parameterList = '';

	Object.entries(paramInfos).forEach(([key, value]) => {
		parameterList += `<li><b>${key}</b> : ${JSON.stringify(value)}</li>`;
	});

	pluginInfoDiv.innerHTML = `
	<li><b>instance.descriptor :</b> ${JSON.stringify(instance.descriptor)}</li>
	<li><b>gui.properties.dataWidth.value</b> : ${guiWidth}</li>
	<li><b>gui.properties.dataHeight.value</b> : ${guiHeight}</li>
	<li><b>instance.audioNode.getParameterInfo() :</b>
		<ul>
		   ${parameterList}
		</ul>
	</li>
	`;
};


/**
 * @param {import('../api/src').WamNode} wamNode
 */
 const populateParamSelector = async (wamNode) => {
	bpfContainer.innerHTML = '';
	pluginParamSelector.innerHTML = '<option value="-1" disabled selected>Add Automation...</option>';
	const info = await wamNode.getParameterInfo();
	// eslint-disable-next-line
	for (const paramId in info) {
		const { minValue, maxValue, label } = info[paramId];
		const option = new Option(`${paramId} (${label}): ${minValue} - ${maxValue}`, paramId);
		pluginParamSelector.add(option);
	}
	pluginParamSelector.selectedIndex = 0;
};







(async () => {
    const { default: OperableAudioBuffer } = await import(
        "./src/js/operable-audio-buffer.js"
    );

    let decodedAudioBuffer;
    let audioArrayBuffer;

    //   var audioCtx =
    await audioCtx.audioWorklet.addModule("./src/js/processor.js");

    const response = await fetch(audioUrl);
    audioArrayBuffer = await response.arrayBuffer();
    decodedAudioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);

    dur = decodedAudioBuffer.duration;
    console.log(dur);
    var canvas0 = document.getElementById("layer0");
    var canvas1 = document.getElementById("layer1");
    // @ts-ignore // définition du canvas pour l'onde
    canvas0.height = 300;
    canvas0.width = 1000;
    // @ts-ignore // définition du canvas pour la barr ed'avancement
    canvas1.height = 300;
    canvas1.width = 1000;

    drawBuffer(canvas0, decodedAudioBuffer, "red", 1000, 300);

    const operableDecodedAudioBuffer = Object.setPrototypeOf(
        decodedAudioBuffer,
        OperableAudioBuffer.prototype
    );
    const node = new SimpleNode(audioCtx);
    //   const node = new SimpleNode(audioCtx);
    // const source = audioCtx.createBufferSource();
    // source.buffer = operableDecodedAudioBuffer;

    node.setAudio(operableDecodedAudioBuffer.toArray());
    node.connect(audioCtx.destination);

    const { default: initializeWamHost } = await import("./plugins/testBern/utils/sdk/src/initializeWamHost.js");
    const [hostGroupId] = await initializeWamHost(audioCtx);

    const { default: WAM } = await import ("./plugins/testBern/index.js");
    const instance = await WAM.createInstance(hostGroupId, audioCtx);
    connectPlugin(node, instance._audioNode);
    currentPluginAudioNode = instance._audioNode;
  

    const pluginDomModel = await instance.createGui();  

    // plugin info for automation
    // showPluginInfo(instance, pluginDomModel);
    populateParamSelector(instance.audioNode);

    mountPlugin(pluginDomModel);

    // source.connect(node).connect(audioCtx.destination);
    connectPlugin(node, gainNode);
    node.parameters.get("playing").value = 0;
    node.parameters.get("loop").value = 1;
    //EVENT LISTENER
    zoomIn.onclick = () => {
        // event listener for the zoom button
        zoom += 0.1;
        drawBuffer(canvas0, decodedAudioBuffer, "red", 1000 * zoom, 300);
        // @ts-ignore
        canvas1.width = 1000 * zoom;
    };
    zoomOut.onclick = () => {
        // event listener for the zoom button
        zoom -= 0.1;
        zoom = 1000 * zoom <= 101 ? zoom + 0.1 : zoom;
        drawBuffer(canvas0, decodedAudioBuffer, "red", 1000 * zoom, 300);
        // @ts-ignore
        canvas1.width = 1000 * zoom;
    };
    btnStart.onclick = () => {
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
            // source.start();
        }
        const playing = node.parameters.get("playing").value;
        if (playing === 1) {
            node.parameters.get("playing").value = 0;
            btnStart.textContent = "Start";
            paused = true;
        } else {
            if (!launched) {
                drawLine(canvas1, decodedAudioBuffer);
            }
            node.parameters.get("playing").value = 1;
            btnStart.textContent = "Stop";
            paused = false;
        }
    };
    btnTime.onclick = () => {
        // console.log(audioCtx.getOutputTimestamp());
        // console.log(audioCtx.getOutputTimestamp().contextTime);
        // console.log(audioCtx.currentTime);
        // console.log(node)
    };
    btnRestart.onclick = () => {
        node.setPosition(0);
        x = 0;
        //@ts-ignore
        canvas1.getContext("2d").clearRect(0, 0, canvas1.width, canvas1.height);
    };
    inputLoop.checked = true;
    inputLoop.onchange = () => {
        const loop = node.parameters.get("loop").value;
        if (loop === 1) {
            node.parameters.get("loop").value = 0;
            inputLoop.checked = false;
        } else {
            node.parameters.get("loop").value = 1;
            inputLoop.checked = true;
        }
    };
    btnStart.hidden = false;

    inputMute.onchange = () => {
        // @ts-ignore
        if (inputMute.checked) {
            gainNode.gain.value = -1;
        } else {
            changeVol(volumeinput);
        }
    };
})();

function dropHandler(ev) {
    console.log('File(s) dropped');
  
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  
    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (ev.dataTransfer.items[i].kind === 'file') {
          var file = ev.dataTransfer.items[i].getAsFile();
          console.log('... file[' + i + '].name = ' + file.name);
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.files.length; i++) {
        console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
      }
    }
  }




  function dragOverHandler(ev) {
    console.log('File(s) in drop zone');
  
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
  }