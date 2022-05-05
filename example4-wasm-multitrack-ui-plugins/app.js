const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = 80;
const TRACK_PATH = './public/song/multitrack'

const app = express();

app.use(express.static('public'));

app.listen(PORT, () => console.log("Server is started and listening on port 80."));

app.get('/track', (req, res) => {
    res.writeHead(200, {"Content-Type": "application/json"});
    res.write(JSON.stringify(exploreMultiTracks()));
    res.end();
});

const endsWith = (str, suffix) => str.indexOf(suffix, str.length - suffix.length) !== -1;

function isASoundFile(fileName) {
    if (endsWith(fileName, ".mp3")) return true;
    if (endsWith(fileName, ".ogg")) return true;
    if (endsWith(fileName, ".wav")) return true;
    return endsWith(fileName, ".m4a");
}


function exploreMultiTracks() {
    const directoryPath = TRACK_PATH;
    const tracks = {"tracks": []};

    //passsing directoryPath and callback function
    var files = fs.readdirSync(directoryPath)
    files.forEach((file) => {
        var soundList = fs.readdirSync(`${directoryPath}/${file}`)
        const track = {
            trackname: file,
            path: `${directoryPath}/${file}`,
            soundList: soundList
                .filter(sound => isASoundFile(sound))
                .map(sound => ({
                    name: sound
                }))
        }
        tracks.tracks.push(track);
    })

    return tracks
}

