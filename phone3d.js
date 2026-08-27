(function () {
  const tilt = document.getElementById("phoneTilt");
  const heroSection = document.getElementById("hero");
  if (!tilt || !heroSection) return;

  const baseX = 6; // deg
  const baseY = -22; // deg

  let mouseX = 0; // -1..1
  let mouseY = 0; // -1..1
  let scrollTiltY = 0; // extra deg from scroll progress

  function apply() {
    const rx = baseX - mouseY * 10;
    const ry = baseY + mouseX * 16 + scrollTiltY;
    tilt.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  }

  window.addEventListener(
    "pointermove",
    (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
      apply();
    },
    { passive: true }
  );

  function onScroll() {
    const rect = heroSection.getBoundingClientRect();
    const progress = Math.min(Math.max(-rect.top / (rect.height || 1), 0), 1);
    scrollTiltY = progress * 40;
    apply();
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  apply();
})();
