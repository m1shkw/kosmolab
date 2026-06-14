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

// ховер у хедера: раскрытие меню + scramble эффектик
(() => {
    const header = document.querySelector(".header");
    if (!header) return;

    const nav = header.querySelector(".nav");
    if (!nav) return;

    const links = Array.from(nav.querySelectorAll(".nav__link"));
    if (links.length < 2) return;

    const first = links[0];
    const rest = links.slice(1);

    const FIRST_COLLAPSED = "Меню";

    const FIRST_OPEN_MS = 900;   // меню —> главная
    const REST_OPEN_MS = 760;    // scramble остальных пунктов
    const FIRST_CLOSE_MS = 480;  // обратно в меню
    const STAGGER_BASE = 45;     // старт первого выезжающего пункта
    const STAGGER_MS = 55;       // шаг между пунктами

    const mql = window.matchMedia("(hover: hover) and (min-width: 1281px)");
    const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-/#$%&()£@!?^><,.*;'[]{}";

    const randChar = () => CHARS[(Math.random() * CHARS.length) | 0];

    // сборка текста слева направо
    function scrambleTo(el, target, duration) {
        cancelAnimationFrame(el.__hdrRaf);

        const len = target.length;
        const t0 = performance.now();

        const step = (now) => {
            const p = Math.min(1, (now - t0) / duration);
            let out = "";

            for (let i = 0; i < len; i++) {
                const ch = target[i];

                if (ch === " ") {
                    out += " ";
                    continue;
                }

                out += p >= i / len ? ch : randChar();
            }

            el.textContent = out;

            if (p < 1) {
                el.__hdrRaf = requestAnimationFrame(step);
            } else {
                el.textContent = target;
            }
        };

        el.__hdrRaf = requestAnimationFrame(step);
    }

    let enhanced = false;
    let open = false;
    let collapsedW = 0;
    let expandedW = 0;

    function enhance() {
        if (enhanced) return;

        first.dataset.navExpanded =
            first.dataset.navExpanded || first.textContent.trim();

        rest.forEach((link) => {
            link.dataset.navLabel = link.dataset.navLabel || link.textContent.trim();
        });

        // фиксируем ширины буллитов до замены текста
        expandedW = Math.ceil(first.getBoundingClientRect().width);

        rest.forEach((link) => {
            link.style.width = Math.ceil(link.getBoundingClientRect().width) + "px";
        });

        first.textContent = FIRST_COLLAPSED;
        collapsedW = Math.ceil(first.getBoundingClientRect().width);
        first.style.width = collapsedW + "px";

        header.classList.add("is-nav-enhanced");
        enhanced = true;
    }

    function unenhance() {
        if (!enhanced) return;

        header.classList.remove("is-nav-enhanced", "is-nav-open");
        open = false;

        cancelAnimationFrame(first.__hdrRaf);
        first.style.width = "";
        first.textContent = first.dataset.navExpanded;

        rest.forEach((link) => {
            cancelAnimationFrame(link.__hdrRaf);
            link.style.width = "";
            link.textContent = link.dataset.navLabel;
        });

        enhanced = false;
    }

    function openNav() {
        if (!enhanced || open) return;

        open = true;
        header.classList.add("is-nav-open");

        first.style.width = (expandedW + 6) + "px";
        scrambleTo(first, first.dataset.navExpanded, FIRST_OPEN_MS);

        rest.forEach((link, index) => {
            setTimeout(() => {
                if (open) {
                    scrambleTo(link, link.dataset.navLabel, REST_OPEN_MS);
                }
            }, STAGGER_BASE + index * STAGGER_MS);
        });
    }

    function closeNav() {
        if (!enhanced || !open) return;

        open = false;
        header.classList.remove("is-nav-open");

        first.style.width = collapsedW + "px";
        scrambleTo(first, FIRST_COLLAPSED, FIRST_CLOSE_MS);

        rest.forEach((link) => {
            cancelAnimationFrame(link.__hdrRaf);
            link.textContent = link.dataset.navLabel;
        });
    }

    function apply(event) {
        if (event.matches) {
            enhance();
        } else {
            unenhance();
        }
    }

    header.addEventListener("mouseenter", openNav);
    header.addEventListener("mouseleave", closeNav);

    // доступность с клавиатуры
    nav.addEventListener("focusin", openNav);
    header.addEventListener("focusout", (event) => {
        if (!header.contains(event.relatedTarget)) {
            closeNav();
        }
    });

    const init = () => apply(mql);

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(init);
    } else {
        init();
    }

    if (mql.addEventListener) {
        mql.addEventListener("change", apply);
    } else if (mql.addListener) {
        mql.addListener(apply);
    }
})();


// пауза / воспроизведение видео-планет 
(() => {
    const hero = document.querySelector(".hero-screen");
    if (!hero) return;

    const videos = hero.querySelectorAll(".hero-screen__planet-video");
    if (!videos.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
        videos.forEach((v) => {
            v.removeAttribute("autoplay");
            try { v.pause(); v.currentTime = 0; } catch (e) {}
        });
        return;
    }

    const play = () => videos.forEach((v) => {
        const p = v.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
    });
    const pause = () => videos.forEach((v) => v.pause());

    if (!("IntersectionObserver" in window)) { play(); return; }

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { entry.isIntersecting ? play() : pause(); });
    }, { threshold: 0.1 });

    io.observe(hero);
})();


// пауза / воспроизведение видео : о нас
(() => {
    const video = document.querySelector(".about-page__hero-video");
    if (!video) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
        video.removeAttribute("autoplay");

        try {
            video.pause();
            video.currentTime = 0;
        } catch (e) {}

        return;
    }

    const play = () => {
        const promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(() => {});
        }
    };

    const pause = () => {
        video.pause();
    };

    if (!("IntersectionObserver" in window)) {
        play();
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            entry.isIntersecting ? play() : pause();
        });
    }, { threshold: 0.1 });

    observer.observe(video);
})();


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




// слайдер : мероприятия / о нас / руководство
(() => {
    function initSlider(root) {
        const track = root.querySelector(
            ".events-preview__track, .about-gallery__track, .guide-spreads__track"
        );

        const slides = root.querySelectorAll(
            ".events-preview__slide, .about-gallery__slide, .guide-spreads__slide"
        );

        if (!track || slides.length === 0) return;

        const prev = root.querySelector(
            ".events-preview__arrow--prev, .about-gallery__arrow--prev, .guide-spreads__arrow--prev"
        );

        const next = root.querySelector(
            ".events-preview__arrow--next, .about-gallery__arrow--next, .guide-spreads__arrow--next"
        );

        const DELAY = 4500;
        let index = 0;
        let timer = null;

        function goToSlide(i) {
            index = (i + slides.length) % slides.length;

            const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
            const slideWidth = slides[0].getBoundingClientRect().width;
            const step = slideWidth + gap;

            let offset = index * step;

            // центрирование разворота
            if (root.classList.contains("guide-spreads__slider")) {
                offset -= (root.clientWidth - slideWidth) / 2;
            }

            const maxOffset = Math.max(0, track.scrollWidth - root.clientWidth);
            offset = Math.max(0, Math.min(offset, maxOffset));

            track.style.transform = "translateX(" + (-offset) + "px)";
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
        document
            .querySelectorAll(
                ".events-preview__slider, .about-gallery__slider, .guide-spreads__slider"
            )
            .forEach(initSlider);
    });
})();

// оверлей на главной 
document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(
        ".events-preview__slider--mobile .events-preview__card"
    );

    if (!cards.length) return;

    cards.forEach((card) => {
        if (card.closest(".events-page")) return;

        card.addEventListener("click", () => {
            card.classList.toggle("is-overlay-hidden");
        });
    });
});


// оверлей на странице мероприятий 
document.addEventListener("DOMContentLoaded", () => {
    const page = document.querySelector(".events-page");
    if (!page) return;

    const desktopHoverQuery = window.matchMedia(
        "(hover: hover) and (pointer: fine) and (min-width: 1281px)"
    );

    const mobileQuery = window.matchMedia("(max-width: 768px)");

    const cards = page.querySelectorAll(".events-preview__card");
    if (!cards.length) return;

    page.querySelectorAll(".events-preview__arrow").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();

            const slider = button.closest(".events-preview__slider");
            if (!slider) return;

            const resetClass = mobileQuery.matches
                ? "is-overlay-hidden"
                : "is-overlay-visible";

            slider
                .querySelectorAll(".events-preview__card." + resetClass)
                .forEach((item) => item.classList.remove(resetClass));
        });
    });

    cards.forEach((card) => {
        card.addEventListener("click", () => {
            if (desktopHoverQuery.matches) return;

            if (mobileQuery.matches) {
                const isHidden = card.classList.contains("is-overlay-hidden");

                cards.forEach((item) => {
                    item.classList.remove("is-overlay-hidden");
                });

                if (!isHidden) {
                    card.classList.add("is-overlay-hidden");
                }
            } else {
                const isOpen = card.classList.contains("is-overlay-visible");

                cards.forEach((item) => {
                    item.classList.remove("is-overlay-visible");
                });

                if (!isOpen) {
                    card.classList.add("is-overlay-visible");
                }
            }
        });
    });

    function resetEventsPageOverlays() {
        if (desktopHoverQuery.matches) {
            cards.forEach((card) => {
                card.classList.remove("is-overlay-visible");
                card.classList.remove("is-overlay-hidden");
            });
        }
    }

    function clearAllOverlayState() {
        cards.forEach((card) => {
            card.classList.remove("is-overlay-visible");
            card.classList.remove("is-overlay-hidden");
        });
    }

    resetEventsPageOverlays();

    if (desktopHoverQuery.addEventListener) {
        desktopHoverQuery.addEventListener("change", resetEventsPageOverlays);
    } else if (desktopHoverQuery.addListener) {
        desktopHoverQuery.addListener(resetEventsPageOverlays);
    }

    if (mobileQuery.addEventListener) {
        mobileQuery.addEventListener("change", clearAllOverlayState);
    } else if (mobileQuery.addListener) {
        mobileQuery.addListener(clearAllOverlayState);
    }
});



/* каталог : заглушка плюсиков */
document.addEventListener("DOMContentLoaded", () => {
    const addButtons = document.querySelectorAll(".catalog-planets__add");
    if (!addButtons.length) return;

    addButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const name = button.dataset.productName || "";
            const id = button.dataset.productId || "";
            console.log("Добавлено в корзину:", name, "(" + id + ")");
        });
    });
});