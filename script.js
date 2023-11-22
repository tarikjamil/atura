// split type
let text;
// Split the text up
function runSplit() {
  text = new SplitType("[animation=loading-split]", {
    types: "lines, words",
    lineClass: "overflow-hidden",
    wordClass: "loading-animation-split",
  });
}

runSplit();

// Update on window resize
let windowWidth = $(window).innerWidth();
window.addEventListener("resize", function () {
  if (windowWidth !== $(window).innerWidth()) {
    windowWidth = $(window).innerWidth();
    text.revert();
    runSplit();
  }
});

gsap.registerPlugin(ScrollTrigger);

// On Page Load
function pageLoad() {
  let tl = gsap.timeline();
  tl.to(".main-wrapper", {
    opacity: 1,
    ease: "Quint.easeOut",
    duration: 0.5,
  });
  tl.from("[animation=loading-img]", {
    scale: 1.2,
    opacity: "0",
    stagger: { each: 0.1, from: "start" },
    ease: "Quint.easeOut",
    duration: 1,
  });
  tl.from("[animation=loading]", {
    y: "100%",
    opacity: "0",
    stagger: { each: 0.1, from: "start" },
    ease: "Quint.easeOut",
    duration: 1,
  });
}
pageLoad();

// slider code
document.addEventListener("DOMContentLoaded", function () {
  var splide = new Splide(".is--splide-slider", {
    type: "slider",
    perPage: 3,
    perMove: 1,
    pagination: false,
    arrows: false,
    gap: "26rem",
    breakpoints: {
      991: {
        // Tablet
        perPage: 1,
        gap: "24rem",
      },
    },
  });
  splide.mount();
});

// svg lines drawing

gsap.utils.toArray(".svg--top, .svg--bottom").forEach((svg) => {
  let length = svg.getTotalLength();

  // Set up initial properties
  gsap.set(svg, { strokeDasharray: length, strokeDashoffset: length });

  // Create the scroll-triggered animation
  gsap.to(svg, {
    strokeDashoffset: 0,
    scrollTrigger: {
      trigger: svg,
      start: "top bottom", // Animation starts when the top of SVG hits the bottom of the viewport
      end: "bottom top", // Animation ends when the bottom of SVG leaves the top of the viewport
      scrub: true, // Smooth scrubbing effect
    },
  });
});
