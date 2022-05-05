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

function overflowDetection(selector) {
    let el = document.querySelectorAll(selector);
    if (!el) return;
    var isOverflow = el.style.overflow;

}


scrollSync(".scroll-sync");

$('.ui.dropdown.settings-menu').dropdown({
    action: 'hide',
});
