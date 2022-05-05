export function activateMainVolume(mainAudio, val) {
    let masterV = $('.master');
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
            console.log("output: ", output);
        })
        .catch(err => console.log(err));
}