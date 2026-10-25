
   /* ==========================================
   LIGHT / DARK MODE
========================================== */

const themeToggle = document.getElementById("themeToggle");

function updateThemeButton() {

    const dark = document.documentElement.dataset.theme === "dark";

    themeToggle.setAttribute(
        "aria-label",
        dark ? "Switch to light mode" : "Switch to dark mode"
    );

    themeToggle.setAttribute(
        "title",
        dark ? "Light Mode" : "Dark Mode"
    );

    themeToggle.setAttribute("aria-pressed",String(dark));

}

updateThemeButton();

themeToggle.addEventListener("click",function() {

    const next = document.documentElement.dataset.theme === "dark"
        ? "light"
        : "dark";

    document.documentElement.dataset.theme = next;

    try {
        localStorage.setItem("albertoTheme",next);
    } catch(e) {}

    updateThemeButton();

});

/* ==========================================
   READ PRODUCT INFORMATION FROM HTML

   KOI IMAGE URL JAVASCRIPT MEIN NAHI HAI.

   JS HTML CARD KE IMG TAG SE SRC READ KARTA HAI.
========================================== */

function getProductFromCard(card) {

    const $card = $(card);

    const imageElement = $card.find(".product-image img")[0];

    return {

        id:Number($card.attr("data-id")),

        name:$card.find(".product-info h3").text().trim(),

        category:$card.attr("data-category"),

        price:Number(
            $card.find(".product-price strong").attr("data-price")
        ),

        description:$card.find(".product-description").text().trim(),

        image:imageElement.getAttribute("src")

    };

}

/* ==========================================
   PRICE FORMAT
========================================== */

function formatPrice(price) {

    return "Rs. " + Number(price).toLocaleString("en-PK");

}

/* ==========================================
   CART FUNCTIONS
========================================== */

function getCart() {

    try {

        const data = JSON.parse(
            localStorage.getItem("albertoCart") || "[]"
        );

        return Array.isArray(data) ? data : [];

    } catch(e) {

        return [];

    }

}

function updateCartCounter() {

    const total = getCart().reduce(
        (sum,item) => sum + (Number(item.quantity) || 1),
        0
    );

    $("#cartCount").text(total);

}

function showToast(message) {

    $("#toastMessage").text(message);

    $("#cartToast")
        .stop(true,true)
        .fadeIn(200)
        .delay(2200)
        .fadeOut(350);

}

function addToCart(product,qty=1) {

    if(!product) return;

    qty = Math.max(
        1,
        Math.min(99,Math.floor(Number(qty) || 1))
    );

    const cart = getCart();

    const existing = cart.find(
        item => item.id === product.id
    );

    if(existing) {

        existing.quantity += qty;

        /* READ CURRENT HTML IMAGE */
        existing.image = product.image;

        existing.price = product.price;

    } else {

        cart.push({

            id:product.id,
            name:product.name,
            price:product.price,
            image:product.image,
            category:product.category,
            quantity:qty

        });

    }

    try {

        localStorage.setItem(
            "albertoCart",
            JSON.stringify(cart)
        );

        updateCartCounter();

        showToast(product.name + " added to cart!");

    } catch(e) {

        showToast("Unable to save cart.");

    }

}

/* ==========================================
   MODAL

   IMAGE HTML CARD SE COPY HOTI HAI.
========================================== */

let selectedProduct = null;

const modalElement = document.getElementById(
    "productDetailsModal"
);

modalElement.addEventListener("show.bs.modal",function(event) {

    const trigger = event.relatedTarget;

    if(!trigger) return;

    const card = trigger.closest(".product-card");

    if(!card) return;

    selectedProduct = getProductFromCard(card);

    const product = selectedProduct;

    $("#modalProductImage").attr({

        src:product.image,

        alt:product.name

    });

    $("#modalCategory").text(
        product.category.toUpperCase()
    );

    $("#modalProductTitle").text(
        product.name
    );

    $("#modalPrice").text(
        formatPrice(product.price)
    );

    $("#modalDescription").text(
        product.description +
        " Discover a carefully selected Alberto Clock timepiece designed to complement your personal style and memorable occasions."
    );

    $("#modalQuantity").val(1);

});

modalElement.addEventListener("hidden.bs.modal",function() {

    selectedProduct = null;

    $("#modalProductImage").removeAttr("src");

});

/* ==========================================
   DOCUMENT READY
========================================== */

$(function() {

    updateCartCounter();

    $("#year").text(
        new Date().getFullYear()
    );

    /* ADD TO CART FROM HTML PRODUCT CARD */

    $(".add-to-cart").on("click",function() {

        const card = $(this).closest(".product-card")[0];

        const product = getProductFromCard(card);

        addToCart(product,1);

    });

    /* QUANTITY PLUS */

    $("#quantityPlus").on("click",function() {

        const n = Number(
            $("#modalQuantity").val()
        ) || 1;

        $("#modalQuantity").val(
            Math.min(99,n+1)
        );

    });

    /* QUANTITY MINUS */

    $("#quantityMinus").on("click",function() {

        const n = Number(
            $("#modalQuantity").val()
        ) || 1;

        $("#modalQuantity").val(
            Math.max(1,n-1)
        );

    });

    /* QUANTITY VALIDATION */

    $("#modalQuantity").on("change",function() {

        const n = Math.floor(
            Number($(this).val())
        );

        $(this).val(
            Number.isFinite(n)
                ? Math.max(1,Math.min(99,n))
                : 1
        );

    });

    /* ADD TO CART FROM MODAL */

    $("#modalAddCart").on("click",function() {

        if(!selectedProduct) return;

        addToCart(
            selectedProduct,
            $("#modalQuantity").val()
        );

        bootstrap.Modal
            .getInstance(modalElement)
            ?.hide();

    });

    /* SEARCH */

    $("#searchBtn").on("click",function() {

        const query = prompt(
            "Search Alberto Watches"
        );

        if(query && query.trim()) {

            location.href =
                "shop.html?search=" +
                encodeURIComponent(query.trim());

        }

    });

    /* NEWSLETTER DEMO */

    $("#newsletterForm").on("submit",function(e) {

        e.preventDefault();

        $("#newsletterMessage").text(
            "Thank you! Newsletter registration is currently a demo."
        );

        this.reset();

    });

    /* ==========================================
       ANIMATED COUNTERS
    ========================================== */

    let counterStarted = false;

    const observer = new IntersectionObserver(entries => {

        if(
            counterStarted ||
            !entries.some(entry => entry.isIntersecting)
        ) {
            return;
        }

        counterStarted = true;

        $(".counter").each(function() {

            const element = $(this);

            const target = Number(
                element.data("target")
            );

            $({value:0}).animate(

                {value:target},

                {

                    duration:2000,

                    easing:"swing",

                    step:function() {

                        element.text(
                            Math.floor(this.value).toLocaleString("en-PK")
                        );

                    },

                    complete:function() {

                        element.text(
                            target.toLocaleString("en-PK")
                        );

                    }

                }

            );

        });

        observer.disconnect();

    },{
        threshold:.2
    });

    observer.observe(
        document.getElementById("counter")
    );

    /* ==========================================
       SMOOTH SCROLL
    ========================================== */

    $('a[href^="#"]').on("click",function(e) {

        const href = this.getAttribute("href");

        if(!href || href === "#") return;

        const target = $(href);

        if(target.length) {

            e.preventDefault();

            $("html,body").animate({

                scrollTop:target.offset().top

            },650);

        }

    });

});

/* Keep the page offset equal to the real fixed header height, including expanded mobile menu. */
(function () {
 const shell = document.getElementById('fixedHeaderShell');
 if (!shell) return;
 function syncHeaderHeight() { document.documentElement.style.setProperty('--fixed-header-height', shell.getBoundingClientRect().height + 'px'); }
 syncHeaderHeight();
 window.addEventListener('load', syncHeaderHeight);
 window.addEventListener('resize', syncHeaderHeight);
 if ('ResizeObserver' in window) new ResizeObserver(syncHeaderHeight).observe(shell);
 shell.addEventListener('shown.bs.collapse', syncHeaderHeight);
 shell.addEventListener('hidden.bs.collapse', syncHeaderHeight);
})();

   /* Original intro design, with hands synced to visitor's local clock. */
(function () {
    const intro = document.getElementById('watchIntro');
    if (!intro) return;
    if (document.documentElement.classList.contains('alberto-skip-intro')) { intro.remove(); return; }
    document.body.classList.add('intro-locked');
    const enter = document.getElementById('introEnter');
    const hourHand = intro.querySelector('.intro-hand.hour');
    const minuteHand = intro.querySelector('.intro-hand.minute');
    const secondHand = intro.querySelector('.intro-hand.second');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let unlocking = false;
    function updateLiveTime() {
        if (unlocking) return;
        const now = new Date();
        const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
        const minutes = now.getMinutes() + seconds / 60;
        const hours = (now.getHours() % 12) + minutes / 60;
        hourHand.style.setProperty('--angle', (hours * 30) + 'deg');
        minuteHand.style.setProperty('--angle', (minutes * 6) + 'deg');
        secondHand.style.setProperty('--angle', (seconds * 6) + 'deg');
    }
    updateLiveTime();
    const clockTimer = window.setInterval(updateLiveTime, 50);
    function unlockTime() {
        if (unlocking) return;
        unlocking = true;
        window.clearInterval(clockTimer);
        intro.classList.add('is-unlocking');
        intro.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('intro-locked');
        window.setTimeout(function () {
            intro.remove();
            const heading = document.querySelector('.hero h1');
            if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({preventScroll:true}); }
        }, reducedMotion ? 180 : 2300);
    }
    intro.querySelectorAll('.intro-hand').forEach(hand => hand.addEventListener('click', unlockTime));
    enter.addEventListener('click', unlockTime);
    intro.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') { event.preventDefault(); unlockTime(); }
        if (event.key === 'Tab') {
            const controls = [...intro.querySelectorAll('button')];
            const first = controls[0], last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
    });
    enter.focus({preventScroll:true});
})();
/* Track navigation from Home to another local page, not reloads. */
document.addEventListener('click', function (event) {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname || link.target === '_blank') return;
    try { sessionStorage.setItem('albertoReturningHome', '1'); } catch (e) {}
});