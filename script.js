gsap.registerPlugin(ScrollTrigger);

/* ---------- Preloader ---------- */
document.body.style.overflow = "hidden";
window.addEventListener("load", () => {
  const fill = document.getElementById("preloaderFill");
  const pre = document.getElementById("preloader");
  requestAnimationFrame(() => { fill.style.width = "100%"; });
  setTimeout(() => {
    pre.classList.add("done");
    document.body.style.overflow = "";
  }, 900);
});
setTimeout(() => { document.body.style.overflow = ""; }, 1600);

/* ---------- Header state on scroll ---------- */
const header = document.getElementById("siteHeader");
ScrollTrigger.create({
  start: 50,
  end: 99999,
  onUpdate: (self) => {
    header.classList.toggle("scrolled", self.scroll() > 50);
  },
});

/* ---------- Cursor dot (desktop only) ---------- */
const cursorDot = document.getElementById("cursorDot");
if (cursorDot && matchMedia("(hover:hover) and (pointer:fine)").matches) {
  window.addEventListener("pointermove", (e) => {
    gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0.15, ease: "power2.out" });
  });
}

/* ---------- Mobile nav toggle ---------- */
const navToggle = document.getElementById("navToggle");
const nav = document.querySelector(".nav");
if (navToggle) {
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("nav-open");
    navToggle.classList.toggle("active", open);
    nav.style.display = open ? "flex" : "";
    if (open) {
      Object.assign(nav.style, {
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "36px",
        fontSize: "1.6rem",
        background: "#f6f4ef",
        zIndex: "99",
      });
    } else {
      nav.removeAttribute("style");
    }
  });
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("nav-open");
      nav.removeAttribute("style");
    })
  );
}

/* ---------- Hero entrance ---------- */
gsap.timeline({ delay: 0.15 })
  .to(".hero-title .line", {
    y: 0, opacity: 1, duration: 1, ease: "power4.out", stagger: 0.12,
  })
  .to(".eyebrow", { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0)
  .to(".hero-sub", { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, "-=0.6")
  .to(".hero-actions", { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, "-=0.6");

/* ---------- Generic scroll reveals ---------- */
document.querySelectorAll(".reveal-up").forEach((el) => {
  // hero elements already animated by the timeline above
  if (el.closest(".hero")) return;

  gsap.fromTo(
    el,
    { opacity: 0, y: 36 },
    {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: "play none none reverse",
      },
    }
  );
});

/* Staggered iPhone buy rows */
gsap.utils.toArray(".iphone-buy-row").forEach((row) => {
  gsap.fromTo(
    row,
    { opacity: 0, y: 50 },
    {
      opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
      scrollTrigger: { trigger: row, start: "top 90%", toggleActions: "play none none reverse" },
    }
  );
});

/* ---------- Story section parallax images ---------- */
gsap.utils.toArray(".story-media img").forEach((img) => {
  gsap.fromTo(
    img,
    { yPercent: -12, scale: 1.15 },
    {
      yPercent: 12,
      scale: 1.15,
      ease: "none",
      scrollTrigger: {
        trigger: img.closest(".story-row"),
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    }
  );
});

/* ---------- Stat counters ---------- */
document.querySelectorAll(".stat-num").forEach((el) => {
  const target = parseInt(el.dataset.count, 10);
  ScrollTrigger.create({
    trigger: el,
    start: "top 85%",
    once: true,
    onEnter: () => {
      gsap.to(el, {
        innerText: target,
        duration: 1.6,
        ease: "power2.out",
        snap: { innerText: 1 },
        onUpdate: function () {
          el.innerText = Math.floor(el.innerText) + (target >= 100 ? "" : "+");
        },
        onComplete: () => (el.innerText = target + "+"),
      });
    },
  });
});

/* ---------- CTA subtle scale-in ---------- */
gsap.fromTo(
  ".cta",
  { backgroundColor: "#14140f" },
  {
    backgroundColor: "#0e0e0b",
    scrollTrigger: { trigger: ".cta", start: "top bottom", end: "top center", scrub: true },
  }
);
