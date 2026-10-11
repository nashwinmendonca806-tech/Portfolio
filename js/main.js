const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

$("#year").textContent = new Date().getFullYear();

/* Theme: follows the visitor's system setting until they choose one */
const root = document.documentElement;
const themeToggle = $("#theme-toggle");
const themeColor = $('meta[name="theme-color"]');
const systemLight = window.matchMedia("(prefers-color-scheme: light)");

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeToggle.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
  themeColor.setAttribute("content", theme === "light" ? "#f5f6fa" : "#05070d");
}

applyTheme(root.dataset.theme === "light" ? "light" : "dark");

themeToggle.addEventListener("click", () => {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  applyTheme(next);
  try {
    localStorage.setItem("theme", next);
  } catch {
    /* Storage is unavailable, so the choice only lasts for this visit. */
  }
});

systemLight.addEventListener("change", (event) => {
  let saved = null;
  try {
    saved = localStorage.getItem("theme");
  } catch {
    saved = null;
  }
  if (!saved) applyTheme(event.matches ? "light" : "dark");
});

/* Nav background and reading progress */
const nav = $("#nav");
const progress = $("#progress");

function updateOnScroll() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  nav.classList.toggle("is-scrolled", window.scrollY > 24);
  progress.style.transform = `scaleX(${maxScroll > 0 ? window.scrollY / maxScroll : 0})`;
}

window.addEventListener("scroll", updateOnScroll, { passive: true });
updateOnScroll();

/* Mobile menu */
const menuToggle = $("#menu-toggle");
const mobileMenu = $("#mobile-menu");
const menuOpenIcon = $("[data-menu-open]", menuToggle);
const menuCloseIcon = $("[data-menu-close]", menuToggle);

function setMenu(open) {
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  mobileMenu.classList.toggle("hidden", !open);
  menuOpenIcon.classList.toggle("hidden", open);
  menuCloseIcon.classList.toggle("hidden", !open);
}

menuToggle.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

$$("a", mobileMenu).forEach((link) => link.addEventListener("click", () => setMenu(false)));

/* Scroll reveal */
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
);

$$("[data-reveal]").forEach((el) => revealObserver.observe(el));

/* Stats count up */
function countUp(el) {
  const target = Number(el.dataset.count);
  const prefix = el.dataset.prefix ?? "";
  const suffix = el.dataset.suffix ?? "";
  const start = performance.now();

  const frame = (now) => {
    const t = Math.min((now - start) / 1600, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
    if (t < 1) requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
}

if (!reduceMotion) {
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );

  $$("[data-count]").forEach((el) => {
    el.textContent = `${el.dataset.prefix ?? ""}0${el.dataset.suffix ?? ""}`;
    counterObserver.observe(el);
  });
}

/* Hero typewriter */
const typewriter = $("[data-typewriter]");

if (typewriter && !reduceMotion) {
  const words = JSON.parse(typewriter.dataset.typewriter);
  let wordIndex = 0;
  let charIndex = words[0].length;
  let deleting = true;

  const type = () => {
    const word = words[wordIndex];

    if (deleting) {
      charIndex -= 1;
      typewriter.textContent = word.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(type, 400);
      } else {
        setTimeout(type, 40);
      }
      return;
    }

    charIndex += 1;
    typewriter.textContent = word.slice(0, charIndex);
    if (charIndex === word.length) {
      deleting = true;
      setTimeout(type, 2200);
    } else {
      setTimeout(type, 90);
    }
  };

  setTimeout(type, 2200);
}

/* Marquee: duplicate the track for a seamless loop */
const marqueeTrack = $(".marquee-track");

if (marqueeTrack && !reduceMotion) {
  const copy = marqueeTrack.firstElementChild.cloneNode(true);
  copy.setAttribute("aria-hidden", "true");
  marqueeTrack.append(copy);
}

/* Subtle 3D tilt on the hero visual */
const tilt = $("[data-tilt]");

if (tilt && finePointer && !reduceMotion) {
  tilt.addEventListener("pointermove", (event) => {
    const rect = tilt.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    tilt.style.transform = `perspective(1100px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg)`;
  });

  tilt.addEventListener("pointerleave", () => {
    tilt.style.transform = "";
  });
}

/* Cursor-following glow on cards */
$$(".spotlight").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
  });
});

/* Lightbox */
const lightbox = $("#lightbox");
const lightboxImage = $("#lightbox-img");
const lightboxCaption = $("#lightbox-caption");
const lightboxPrev = $("#lightbox-prev");
const lightboxNext = $("#lightbox-next");
let gallery = [];
let current = 0;

function showImage(index) {
  current = (index + gallery.length) % gallery.length;
  const { src, alt } = gallery[current].dataset;
  lightboxImage.src = src;
  lightboxImage.alt = alt;
  lightboxCaption.textContent = alt;
}

$$("[data-lightbox]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    gallery = $$(`[data-lightbox="${trigger.dataset.lightbox}"]`);
    showImage(gallery.indexOf(trigger));
    const multiple = gallery.length > 1;
    lightboxPrev.classList.toggle("hidden", !multiple);
    lightboxNext.classList.toggle("hidden", !multiple);
    lightbox.showModal();
  });
});

lightboxPrev.addEventListener("click", () => showImage(current - 1));
lightboxNext.addEventListener("click", () => showImage(current + 1));
$("#lightbox-close").addEventListener("click", () => lightbox.close());

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox || event.target.id === "lightbox-stage") lightbox.close();
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.open) return;
  if (event.key === "ArrowLeft") showImage(current - 1);
  if (event.key === "ArrowRight") showImage(current + 1);
});

/* Copy email */
const copyButton = $("#copy-email");

if (copyButton) {
  const label = $("span", copyButton);

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(copyButton.dataset.email);
      label.textContent = "Copied!";
    } catch {
      label.textContent = "Copy failed";
    }
    setTimeout(() => {
      label.textContent = "Copy email";
    }, 2000);
  });
}
