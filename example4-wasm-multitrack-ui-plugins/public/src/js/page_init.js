export function activateMainVolume(mainAudio, val) {
    mainAudio.setVolume(val);
    mainAudio.saveStateVolume(val);
    $('.master').slider({
        start: 20,
        value: 20,
        range: 'max',
        min: 0,
        max: 100,
        smooth: true,
        onMove: function (value) {
            let val = value / 100;
            if (!mainAudio.isMuted) {
                mainAudio.setVolume(val);
            }
            mainAudio.saveStateVolume(val);
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