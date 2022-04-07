import { dur , x ,  paused } from '../../index.js';

//@ts-ignore
export var launched;
//@ts-ignore



export function drawBuffer(canvas, buffer, color, width, height) {
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = width;
    canvas.height = height;
    if (color) {
        ctx.fillStyle = color;
    }
    var data = buffer.getChannelData(0);
    var step = Math.ceil(data.length / width);
    var amp = height / 2;
    for (var i = 0; i < width; i++) {
        var min = 1.0;
        var max = -1.0;
        for (var j = 0; j < step; j++) {
            var datum = data[i * step + j];
            if (datum < min) min = datum;
            if (datum > max) max = datum;
        }
        ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
    }
}

// @ts-ignore
export function drawLine(canvas, decodedAudioBuffer) {
    launched = true;
    var ctx = canvas.getContext("2d");
    x = 0;
    // @ts-ignore
    var y = 50;
    // @ts-ignore
    var width = 10;
    // @ts-ignore
    var height = 10;
    let speed = 33;
    let delta = 0.01; // the time spent in the function animate // empirical value i have to do it better

    function animate() {
        //speed Calculation for the line:
        if (dur == 0) {
            console.error("duration not defined for this sound.");
        } else {
            speed = (dur / (canvas.width / 2)) * 1000;
        }
        if (!paused) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
            x += 2;
        }
        if (x <= canvas.width) {
            setTimeout(animate, speed - delta);
        }
        if (x > canvas.width) {
            launched = false;
        }
    }

    animate();
}
