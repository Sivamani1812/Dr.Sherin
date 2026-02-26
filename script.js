document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".navbar");
    const navToggle = document.querySelector(".nav-toggle");
    const navMenu = document.querySelector(".nav-menu");

    if (navbar && navToggle && navMenu) {
        const closeNavMenu = () => {
            navbar.classList.remove("menu-open");
            navToggle.classList.remove("is-active");
            navToggle.setAttribute("aria-expanded", "false");
        };

        navToggle.addEventListener("click", () => {
            const isOpen = navbar.classList.toggle("menu-open");
            navToggle.classList.toggle("is-active", isOpen);
            navToggle.setAttribute("aria-expanded", String(isOpen));
        });

        navMenu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", closeNavMenu);
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 980) {
                closeNavMenu();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeNavMenu();
            }
        });
    }

    const bubbleLayer = document.getElementById("heroBubbles");
    if (bubbleLayer) {
        const createBubble = (width, height) => {
            const bubble = document.createElement("span");
            bubble.className = "bubble";

            const size = Math.floor(Math.random() * 180) + 90;
            const left = Math.random() * (width - size);
            const top = Math.random() * (height - size);
            const duration = (Math.random() * 6 + 7).toFixed(2);
            const delay = (Math.random() * -8).toFixed(2);
            const xShift = `${Math.floor(Math.random() * 70) - 35}px`;
            const yShift = `${Math.floor(Math.random() * 100) - 120}px`;

            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left = `${Math.max(0, left)}px`;
            bubble.style.top = `${Math.max(0, top)}px`;
            bubble.style.setProperty("--duration", `${duration}s`);
            bubble.style.setProperty("--delay", `${delay}s`);
            bubble.style.setProperty("--x-shift", xShift);
            bubble.style.setProperty("--y-shift", yShift);

            bubbleLayer.appendChild(bubble);
        };

        const renderBubbles = () => {
            bubbleLayer.innerHTML = "";
            const host = bubbleLayer.getBoundingClientRect();
            const maxWidth = Math.max(host.width, 360);
            const maxHeight = Math.max(host.height, 460);
            const bubbleCount = window.innerWidth < 768 ? 7 : 11;

            for (let i = 0; i < bubbleCount; i += 1) {
                createBubble(maxWidth, maxHeight);
            }
        };

        renderBubbles();
        window.addEventListener("resize", renderBubbles);
    }

    const revealItems = document.querySelectorAll(".reveal-on-scroll");
    const counters = document.querySelectorAll(".count-up");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
        revealItems.forEach((item) => item.classList.add("is-visible"));
    } else if (revealItems.length > 0) {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                });
            },
            { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
        );

        revealItems.forEach((item) => revealObserver.observe(item));
    }

    const setCounterValue = (counter, value) => {
        const suffix = counter.dataset.suffix || "";
        counter.textContent = `${value}${suffix}`;
    };

    const animateCounter = (counter) => {
        if (counter.dataset.done === "1") {
            return;
        }

        const target = Number(counter.dataset.target || 0);
        const duration = Number(counter.dataset.duration || 1500);
        const startTime = performance.now();

        const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - (1 - progress) ** 3;
            const current = Math.floor(target * eased);
            setCounterValue(counter, current);

            if (progress < 1) {
                requestAnimationFrame(step);
                return;
            }

            setCounterValue(counter, target);
            counter.dataset.done = "1";
        };

        requestAnimationFrame(step);
    };

    if (counters.length === 0) {
        return;
    }

    if (reducedMotion) {
        counters.forEach((counter) => {
            setCounterValue(counter, Number(counter.dataset.target || 0));
            counter.dataset.done = "1";
        });
        return;
    }

    const counterObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            });
        },
        { threshold: 0.55 }
    );

    counters.forEach((counter) => counterObserver.observe(counter));
});
