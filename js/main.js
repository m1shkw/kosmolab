document.addEventListener("DOMContentLoaded", () => {
    console.log("KOSMOLAB site loaded");
});


// активная ссылка в хедере
document.addEventListener("DOMContentLoaded", () => {
    let currentPage = window.location.pathname.split("/").pop();

    if (!currentPage) {
        currentPage = "index.html";
    }

    const navLinks = document.querySelectorAll(".nav__link, .mobile-nav__link");

    navLinks.forEach((link) => {
        const linkPage = link.getAttribute("href").split("/").pop();

        link.classList.toggle("is-active", linkPage === currentPage);
    });
});


// хедер мобилка / таб
document.addEventListener("DOMContentLoaded", () => {
    const menuButton = document.querySelector(".mobile-menu-button");
    const mobileNav = document.querySelector(".mobile-nav");

    if (!menuButton || !mobileNav) return;

    menuButton.addEventListener("click", () => {
        const isOpen = mobileNav.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            mobileNav.classList.remove("is-open");
            menuButton.setAttribute("aria-expanded", "false");
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            mobileNav.classList.remove("is-open");
            menuButton.setAttribute("aria-expanded", "false");
        }
    });
});

// scramble эффект : рандом набор символов
(() => {
    const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-/#$%&()£@!?^><,.*;'[]{}";
    const ASSEMBLE_MIN = 1200;
    const ASSEMBLE_MAX = 1800;
    const HOLD_MS = 3000;
    const GAP_MS = 400;

    const randChar = () =>
        SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    const randDuration = () =>
        ASSEMBLE_MIN + Math.random() * (ASSEMBLE_MAX - ASSEMBLE_MIN);
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));

    // out — рассыпать , in — собрать в исходник
    function runPhase(el, mode, duration) {
        return new Promise((resolve) => {
            const text = el.dataset.scrambleText || el.textContent;
            const len = text.length;
            const start = performance.now();

            function frame(now) {
                if (!el.__scrambleActive) {
                    el.textContent = text;
                    resolve();
                    return;
                }

                const p = Math.min(1, (now - start) / duration);
                let out = "";

                for (let i = 0; i < len; i++) {
                    const ch = text[i];
                    if (ch === " ") {
                        out += " ";
                        continue;
                    }
                    const settle = i / len; // стаггер слева направо
                    if (mode === "in") {
                        out += p >= settle ? ch : randChar();
                    } else {
                        out += p >= settle ? randChar() : ch;
                    }
                }

                el.textContent = out;

                if (p < 1) {
                    requestAnimationFrame(frame);
                } else {
                    el.textContent = mode === "in" ? text : out;
                    resolve();
                }
            }

            requestAnimationFrame(frame);
        });
    }

    async function loop(el) {
        while (el.__scrambleActive) {
            await runPhase(el, "in", randDuration());
            if (!el.__scrambleActive) break;
            await delay(HOLD_MS);
            if (!el.__scrambleActive) break;
            await runPhase(el, "out", randDuration());
            if (!el.__scrambleActive) break;
            await delay(GAP_MS);
        }
    }

    function start(el) {
        if (el.__scrambleActive) return;
        el.__scrambleActive = true;
        loop(el);
    }

    function stop(el) {
        el.__scrambleActive = false;
        el.textContent = el.dataset.scrambleText || el.textContent;
    }

    document.addEventListener("DOMContentLoaded", () => {
        const targets = document.querySelectorAll("[data-scramble-text]");
        if (!targets.length) return;

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
        if (reduceMotion) return; // статичный текст

        if (!("IntersectionObserver" in window)) {
            targets.forEach(start); // фолбэк
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) start(entry.target);
                    else stop(entry.target);
                });
            },
            { threshold: 0.2 }
        );

        targets.forEach((el) => observer.observe(el));
    });
})();




/* слайдер мероприятий */
(() => {
    function initSlider(root) {
        const track = root.querySelector(".events-preview__track");
        const slides = root.querySelectorAll(".events-preview__slide");

        if (!track || slides.length === 0) return;

        const prev = root.querySelector(".events-preview__arrow--prev");
        const next = root.querySelector(".events-preview__arrow--next");

        const DELAY = 4500;
        let index = 0;
        let timer = null;

        function goToSlide(i) {
            index = (i + slides.length) % slides.length;

            const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
            const step = root.clientWidth + gap;

            track.style.transform = "translateX(" + (-index * step) + "px)";
        }

        function nextSlide() {
            goToSlide(index + 1);
        }

        function prevSlide() {
            goToSlide(index - 1);
        }

        function startAuto() {
            stopAuto();

            timer = setInterval(() => {
                if (root.offsetParent === null) return;
                nextSlide();
            }, DELAY);
        }

        function stopAuto() {
            if (timer) clearInterval(timer);
            timer = null;
        }

        function resetAuto() {
            startAuto();
        }

        if (next) {
            next.addEventListener("click", () => {
                nextSlide();
                resetAuto();
            });
        }

        if (prev) {
            prev.addEventListener("click", () => {
                prevSlide();
                resetAuto();
            });
        }

        window.addEventListener("resize", () => goToSlide(index));

        goToSlide(0);
        startAuto();
    }

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".events-preview__slider").forEach(initSlider);
    });
})();

document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(
        ".events-preview__slider--mobile .events-preview__card"
    );

    if (!cards.length) return;

    cards.forEach((card) => {
        card.addEventListener("click", () => {
            card.classList.toggle("is-overlay-hidden");
        });
    });
});