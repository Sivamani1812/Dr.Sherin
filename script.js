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

    const galleryTrack = document.getElementById("clinicGalleryTrack");
    if (galleryTrack) {
        const slides = Array.from(galleryTrack.querySelectorAll(".clinic-gallery-slide"));
        const stackCards = Array.from(document.querySelectorAll(".clinic-gallery-stack .stack-card"));
        const gallerySlider = galleryTrack.closest(".clinic-gallery-slider");
        const prevButton = document.querySelector(".clinic-gallery-controls .prev");
        const nextButton = document.querySelector(".clinic-gallery-controls .next");
        const galleryReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const slideTransitionMs = galleryReducedMotion ? 0 : 1050;

        let activeIndex = 0;
        let autoPlayTimer = null;
        let isSliding = false;
        let slideReleaseTimer = null;
        let stackShiftTimer = null;

        const syncGallery = (nextIndex) => {
            if (slides.length === 0 || isSliding) {
                return;
            }

            const total = slides.length;
            const previousMappedIndex = total - 1 - activeIndex;
            const safeIndex = (nextIndex + total) % total;
            activeIndex = safeIndex;
            isSliding = true;

            galleryTrack.style.transform = `translateX(-${safeIndex * 100}%)`;

            slides.forEach((slide, index) => {
                slide.classList.toggle("is-active", index === safeIndex);
            });

            const currentMappedIndex = total - 1 - safeIndex;
            stackCards.forEach((card, index) => {
                card.classList.remove("is-shift-out");
                card.classList.toggle("is-current", index === currentMappedIndex);
            });

            if (stackCards.length > 0 && previousMappedIndex !== currentMappedIndex) {
                const outgoingCard = stackCards[previousMappedIndex];
                outgoingCard?.classList.add("is-shift-out");

                if (stackShiftTimer) {
                    clearTimeout(stackShiftTimer);
                }

                stackShiftTimer = window.setTimeout(() => {
                    outgoingCard?.classList.remove("is-shift-out");
                }, Math.max(300, slideTransitionMs * 0.62));
            }

            if (slideReleaseTimer) {
                clearTimeout(slideReleaseTimer);
            }

            slideReleaseTimer = window.setTimeout(() => {
                isSliding = false;
            }, slideTransitionMs + 120);
        };

        const stopAutoPlay = () => {
            if (!autoPlayTimer) {
                return;
            }

            clearInterval(autoPlayTimer);
            autoPlayTimer = null;
        };

        const startAutoPlay = () => {
            if (galleryReducedMotion || slides.length < 2) {
                return;
            }

            stopAutoPlay();
            autoPlayTimer = window.setInterval(() => {
                syncGallery(activeIndex + 1);
            }, 4200);
        };

        const goNext = () => {
            syncGallery(activeIndex + 1);
            startAutoPlay();
        };

        const goPrev = () => {
            syncGallery(activeIndex - 1);
            startAutoPlay();
        };

        prevButton?.addEventListener("click", goPrev);
        nextButton?.addEventListener("click", goNext);
        stackCards.forEach((card, index) => {
            card.addEventListener("click", () => {
                const total = slides.length;
                syncGallery(total - 1 - index);
                startAutoPlay();
            });
        });

        if (gallerySlider) {
            gallerySlider.addEventListener("mouseenter", stopAutoPlay);
            gallerySlider.addEventListener("mouseleave", startAutoPlay);
            gallerySlider.addEventListener("touchstart", stopAutoPlay, { passive: true });
            gallerySlider.addEventListener("touchend", startAutoPlay);
        }

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                stopAutoPlay();
                return;
            }

            startAutoPlay();
        });

        syncGallery(0);
        isSliding = false;
        startAutoPlay();
    }

    const storyTrack = document.getElementById("storyTrack");
    if (storyTrack) {
        const storySlides = Array.from(storyTrack.querySelectorAll(".story-slide"));
        const storyVideos = storySlides.map((slide) => slide.querySelector(".story-video"));
        const storyPlayButtons = storySlides.map((slide) => slide.querySelector(".story-play-btn"));
        const storyDots = Array.from(document.querySelectorAll(".story-dot"));
        const storyPrevButton = document.querySelector(".success-stories-controls .prev");
        const storyNextButton = document.querySelector(".success-stories-controls .next");
        const storyReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const storyTransitionMs = storyReducedMotion ? 0 : 780;
        const totalStories = storySlides.length;

        let activeStoryIndex = 0;
        let storyIsSliding = false;
        let storySlideReleaseTimer = null;

        const hasStorySource = (video) => {
            if (!video) {
                return false;
            }

            if (video.currentSrc && video.currentSrc.trim() !== "") {
                return true;
            }

            const sourceNode = video.querySelector("source[src]");
            if (!sourceNode) {
                return false;
            }

            const srcValue = sourceNode.getAttribute("src") || "";
            return srcValue.trim() !== "";
        };

        const setStoryPlayButtonState = (index, isHidden) => {
            const button = storyPlayButtons[index];
            if (!button) {
                return;
            }

            button.classList.toggle("is-hidden", isHidden);
        };

        const normalizeStoryIndex = (index) => {
            if (totalStories === 0) {
                return 0;
            }

            return (index + totalStories) % totalStories;
        };

        const getStoryOffset = (index) => {
            let offset = index - activeStoryIndex;
            if (offset > totalStories / 2) {
                offset -= totalStories;
            }
            if (offset < -totalStories / 2) {
                offset += totalStories;
            }
            return offset;
        };

        const playStoryVideo = (index) => {
            const video = storyVideos[index];
            if (!video || index !== activeStoryIndex || !hasStorySource(video)) {
                return;
            }

            video.muted = false;
            video.loop = false;
            const playPromise = video.play();
            setStoryPlayButtonState(index, true);

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(() => {
                    setStoryPlayButtonState(index, false);
                });
            }
        };

        const updateStoryUi = (index) => {
            storySlides.forEach((slide, slideIndex) => {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            storyDots.forEach((dot, dotIndex) => {
                const isCurrent = dotIndex === index;
                dot.classList.toggle("is-active", isCurrent);
                dot.setAttribute("aria-current", isCurrent ? "true" : "false");
            });
        };

        const syncStoryLayout = (options = {}) => {
            const { resetInactive = true } = options;
            storySlides.forEach((slide, index) => {
                const offset = getStoryOffset(index);
                const isCenter = offset === 0;
                const isLeft = offset === -1;
                const isRight = offset === 1;
                const video = storyVideos[index];

                slide.classList.remove("pos-left", "pos-center", "pos-right", "is-hidden");

                if (isCenter) {
                    slide.classList.add("pos-center");
                } else if (isLeft) {
                    slide.classList.add("pos-left");
                } else if (isRight) {
                    slide.classList.add("pos-right");
                } else {
                    slide.classList.add("is-hidden");
                }

                if (!video) {
                    return;
                }

                if (isCenter) {
                    video.controls = true;
                    video.muted = false;
                    video.loop = false;

                    if (video.paused) {
                        setStoryPlayButtonState(index, false);
                    }
                    return;
                }

                video.pause();
                video.controls = false;
                video.muted = true;
                video.loop = false;
                setStoryPlayButtonState(index, true);

                if (resetInactive) {
                    video.currentTime = 0;
                }
            });
        };

        const moveToStory = (nextIndex, options = {}) => {
            const { autoPlayCenter = false, resetInactive = true } = options;
            if (storySlides.length === 0 || storyIsSliding) {
                return;
            }

            activeStoryIndex = normalizeStoryIndex(nextIndex);
            storyIsSliding = true;

            updateStoryUi(activeStoryIndex);
            syncStoryLayout({ resetInactive });

            if (autoPlayCenter) {
                window.setTimeout(() => {
                    playStoryVideo(activeStoryIndex);
                }, storyTransitionMs > 0 ? storyTransitionMs * 0.62 : 0);
            }

            if (storySlideReleaseTimer) {
                clearTimeout(storySlideReleaseTimer);
            }

            storySlideReleaseTimer = window.setTimeout(() => {
                storyIsSliding = false;
            }, storyTransitionMs + 90);
        };

        storyPrevButton?.addEventListener("click", () => {
            moveToStory(activeStoryIndex - 1);
        });

        storyNextButton?.addEventListener("click", () => {
            moveToStory(activeStoryIndex + 1);
        });

        storyDots.forEach((dot, dotIndex) => {
            dot.addEventListener("click", () => {
                moveToStory(dotIndex);
            });
        });

        storyPlayButtons.forEach((button, buttonIndex) => {
            button?.addEventListener("click", () => {
                if (buttonIndex !== activeStoryIndex) {
                    moveToStory(buttonIndex, { resetInactive: false });
                    return;
                }

                playStoryVideo(activeStoryIndex);
            });
        });

        storyVideos.forEach((video, videoIndex) => {
            if (!video) {
                return;
            }

            video.addEventListener("play", () => {
                setStoryPlayButtonState(videoIndex, true);
            });

            video.addEventListener("pause", () => {
                if (!video.ended && videoIndex === activeStoryIndex) {
                    setStoryPlayButtonState(videoIndex, false);
                }
            });

            video.addEventListener("ended", () => {
                setStoryPlayButtonState(videoIndex, false);

                if (videoIndex !== activeStoryIndex) {
                    return;
                }

                moveToStory(activeStoryIndex + 1, { resetInactive: true });
            });
        });

        updateStoryUi(0);
        syncStoryLayout({ resetInactive: false });
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


let topBtn = document.getElementById("topBtn");

window.onscroll = function(){
  if(document.body.scrollTop > 200 || document.documentElement.scrollTop > 200){
    topBtn.style.display = "block";
  } else {
    topBtn.style.display = "none";
  }
}

function scrollToTop(){
  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}



/* ============================================================
   DR. SHERIN — HERO SECTION SCRIPT
   Drives: scroll/load reveal animations, stat counters,
   floating particles, and the consultation form success state.
   Just include this file with: <script src="hero.js" defer></script>
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  initRevealAnimations();
  initStatCounters();
  initHeroParticles();
  initHeroForm();
});

/* ---------- 1. Fade / slide reveal on [data-anim] elements ---------- */
function initRevealAnimations() {
  const animEls = document.querySelectorAll("[data-anim]");
  if (!animEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseFloat(el.dataset.delay || 0) * 1000;
          setTimeout(() => el.classList.add("anim-visible"), delay);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.15 }
  );

  animEls.forEach((el) => observer.observe(el));
}

/* ---------- 2. Animated stat counters (500+, 8+, 90%) ---------- */
function initStatCounters() {
  const counters = document.querySelectorAll(".hero-stat-num[data-count]");
  if (!counters.length) return;

  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const duration = 1500;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* ---------- 3. Floating particles inside #heroParticles ---------- */
function initHeroParticles() {
  const container = document.getElementById("heroParticles");
  if (!container) return;

  const PARTICLE_COUNT = 22;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = document.createElement("span");
    p.className = "particle";

    const size = (Math.random() * 5 + 3).toFixed(1); // 3px - 8px
    const top = (Math.random() * 100).toFixed(1);
    const left = (Math.random() * 100).toFixed(1);
    const tx = (Math.random() * 80 - 40).toFixed(0) + "px";
    const ty = (-(Math.random() * 100 + 30)).toFixed(0) + "px";
    const dur = (Math.random() * 6 + 6).toFixed(1) + "s";
    const delay = (Math.random() * 5).toFixed(1) + "s";

    p.style.width = size + "px";
    p.style.height = size + "px";
    p.style.top = top + "%";
    p.style.left = left + "%";
    p.style.setProperty("--tx", tx);
    p.style.setProperty("--ty", ty);
    p.style.setProperty("--dur", dur);
    p.style.setProperty("--delay", delay);

    container.appendChild(p);
  }
}

/* ---------- 4. Consultation form submit -> success state ---------- */
function initHeroForm() {
  const form = document.getElementById("heroConsultForm");
  const card = document.querySelector(".hero-form-card");
  if (!form || !card) return;

  // Build the success markup once (kept out of the HTML so this
  // script stays fully drop-in). Uses the .hero-form-success* CSS
  // that already exists in your stylesheet.
  let successBlock = card.querySelector(".hero-form-success");
  if (!successBlock) {
    successBlock = document.createElement("div");
    successBlock.className = "hero-form-success";
    successBlock.innerHTML = `
      <span class="hero-form-success-icon">
        <i class="fa-solid fa-check" aria-hidden="true"></i>
      </span>
      <h4>Thank You!</h4>
      <p>Your consultation request has been received.<br>
      Our team will call you shortly to confirm your appointment.</p>
    `;
    card.appendChild(successBlock);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // TODO: send the form data to your backend / API / Google Sheet here
    // const data = new FormData(form);
    // fetch("/api/consult", { method: "POST", body: data });

    card.classList.add("form-success");
    form.reset();
  });
}
