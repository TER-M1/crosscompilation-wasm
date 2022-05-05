var timerDiv = document.querySelector(".timer");

/**
 *
 * @param{MainAudio} mainAudio
 */
export function updateAudioTimer(mainAudio) {
    var hours = Math.floor(mainAudio.maxGlobalTimer / 3600);
    var mins = Math.floor(mainAudio.maxGlobalTimer / 60);
    var secs = Math.floor(mainAudio.maxGlobalTimer % 60);
    if (secs < 10) {
        secs = '0' + String(secs);
    }
    if (mins < 10) {
        mins = '0' + String(mins);
    }
    if (hours < 10) {
        hours = '0' + String(hours);
    }
    timerDiv.innerHTML = `${hours}:${mins}:${secs}`;
}