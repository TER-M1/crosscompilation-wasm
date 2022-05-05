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

scrollSync(".scroll-sync");

$('.ui.dropdown').dropdown({
    values: [
        {
            name: 'Male',
            value: 'path1',
            class: 'item soundM'
        },
        {
            name: 'Female',
            value: 'path2',
            class: 'item soundM'
        },
        {
            name:  'test',
            class: 'item soundM'
        }
    ]
});