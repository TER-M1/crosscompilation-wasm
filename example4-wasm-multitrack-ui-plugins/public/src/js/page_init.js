import {audioCtx, AudioTrack, mainAudio, SimpleAudioWorkletNode} from "./audio_loader.js";

export function activateMainVolume(mainAudio, val) {
    $('.master').slider({
        start: 50,
        value: 50,
        range: 'max',
        min: 0,
        max: 100,
        smooth: true,
        onMove: function (value) {
            console.log('master volume at ' + value)
            val = value / 100;
            // mainAudio.tracks.forEach((track) => {
            //     track.gainOutNode.value = val;
            //     });
            mainAudio.masterVolumeNode.gain.value = val;
        }
    });
}

export function exploreTracks() {
    fetch('http://localhost:80/track')
        .then(res => res.json())
        .then((output) => {

            let values = output.tracks
                .map(track => ({
                    name: track.trackname,
                    value: track.id,
                    class: `item multitrack-item${track.id}`,
                }));

            $('.ui.dropdown.add-multitrack').dropdown({
                action: 'hide',
                values: values
            });
            attachControl(values);
        })
        .catch(err => console.log(err));
}

function attachControl(values) {
    values.forEach(value => {
        let el = document.querySelector('.item.multitrack-item'+value.value);
        el.addEventListener('click', () => {
            let asyncAddTrack = [];
            fetch('http://localhost:80/track/'+value.value)
                .then(res => res.json())
                .then(async (output) => {
                    console.log(output);
                    let soundList = output.soundList;
                    for (let i = 0; i < soundList.length; i++) {
                        let path = `${output.path}/${soundList[i].name}`
                        console.log(path);
                        asyncAddTrack.push(mainAudio.addTrack(
                            new AudioTrack(audioCtx, new SimpleAudioWorkletNode(audioCtx), path)
                        ));
                    }
                    let res = await Promise.all(
                        asyncAddTrack
                    )
                })
                .catch(err => console.log(err));
        })
    })
}
