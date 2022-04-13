function scrollSync(selector) {
    let active = null;
    console.log(document.querySelectorAll(selector));
    document.querySelectorAll(selector).forEach(function(element) {
        console.log("SYNC !")
        element.addEventListener("mouseenter", function(e) {
            active = e.target;
        });

        element.addEventListener("scroll", function(e) {
            if (e.target !== active) return;

            document.querySelectorAll(selector).forEach(function(target) {
                if (active === target) return;

                target.scrollTop = active.scrollTop;
                target.scrollLeft = active.scrollLeft;
            });
        });
    });
}

// console.log();
// $('.azzzdqsdqsd')
// $(document).ready(function () {
//     $(".azzzdqsdqsd").range({
//         min: 0,
//         max: 10,
//         start: 10,
//         smooth: true
//     })
// })
$('.ui.slider').slider({
    start  : 50,
    value: 50,
    range  : 'max',
    min    : 0,
    max    : 100,
    smooth: true,
});
$('.azzzdqsdqsd').slider({
    start  : 50,
    value: 50,
    range  : 'max',
    min    : 0,
    max    : 100,
    smooth: true,
    onMove: function(value) {
        console.log('onmove' + value)
    }
    });
console.log($('.azzzdqsdqsd'));
//RWM: Call the function on the elements you need synced.
scrollSync(".scroll-sync");