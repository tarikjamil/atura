// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Function to load page
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
// Run the page load function
pageLoad();

// Initialize Splide slider when DOM is loaded
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
        perPage: 1,
        gap: "24rem",
      },
    },
  });
  splide.mount();
});

// Select all SVGs
const svgs = document.querySelectorAll(".svg--top, .svg--bottom");

// Loop through each SVG
svgs.forEach((svg) => {
  const paths = svg.querySelectorAll("path");
  const totalLength = Array.from(paths).reduce(
    (total, path) => total + path.getTotalLength(),
    0
  );

  let cumulativeLength = 0;

  // Loop through each path in the SVG
  paths.forEach((path) => {
    const pathLength = path.getTotalLength();
    const start = (cumulativeLength / totalLength) * 100;
    const end = ((cumulativeLength + pathLength) / totalLength) * 100;

    // Set initial stroke properties
    gsap.set(path, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength > 0 ? pathLength : 0,
    });

    // Animate the stroke offset
    gsap.to(path, {
      strokeDashoffset: 0,
      scrollTrigger: {
        trigger: svg,
        scrub: true,
        start: "top center",
        end: "bottom center",
        markers: false,
      },
    });

    cumulativeLength += pathLength > 0 ? pathLength : 0;
  });
});

// Add click event listener to navlink and background menu
$(document).on("click", ".navlink, .background--menu", function () {
  $(".close--btn").click();
});

// --------------------- levels popup --------------------- //

document.addEventListener("DOMContentLoaded", function () {
  // STEP 1: Number each level path inside the SVG
  const levelPaths = document.querySelectorAll(".img--bg.is--svg path");
  levelPaths.forEach((path, index) => {
    path.setAttribute("level", index + 1);
  });

  // STEP 2: Listen to click on any level
  levelPaths.forEach((path) => {
    path.addEventListener("click", () => {
      const selectedLevel = path.getAttribute("level");
      openLevelPopup(selectedLevel);
    });
  });

  function openLevelPopup(levelNumber) {
    const popup = document.querySelector(".popup");
    const popupPlan = popup.querySelector(".popup--plan");
    const popupPlan3d = popup.querySelector(".popup--plan-3d");
    const levelEl = document.querySelector(
      `.etage--el:nth-child(${levelNumber})`
    );

    if (!levelEl) return;

    const levelImage = levelEl.querySelector(".etage--img");
    const appartItems = levelEl.querySelectorAll(".appart-item");

    // Show popup
    popup.style.display = "flex";

    // Replace .popup--plan content with .etage--img and all appart-plan RichTexts
    popupPlan.innerHTML = "";
    if (levelImage) {
      popupPlan.appendChild(levelImage.cloneNode(true));
    }

    appartItems.forEach((item) => {
      const plan = item.querySelector(".appart-plan");
      if (plan) {
        popupPlan.appendChild(plan.cloneNode(true));
      }
    });

    // Find the apartment with the smallest .appart-number
    let minAppart = null;
    let minNumber = Infinity;

    appartItems.forEach((item) => {
      const numberEl = item.querySelector(".appart-number");
      const number = parseInt(numberEl?.innerText || "9999", 10);
      if (!isNaN(number) && number < minNumber) {
        minNumber = number;
        minAppart = item;
      }
    });

    // If found, fill the apartment details
    if (minAppart) {
      fillApartmentData(minAppart, levelImage);
    }

    // STEP 3: Click handler on .appart-plan paths to change apartment info
    const planPaths = popupPlan.querySelectorAll("path");
    planPaths.forEach((path) => {
      path.addEventListener("click", () => {
        const index = Array.from(planPaths).indexOf(path);
        const clickedAppart = appartItems[index];
        if (clickedAppart) {
          fillApartmentData(clickedAppart, levelImage);
        }
      });
    });
  }

  function fillApartmentData(appartEl, levelImage) {
    const getText = (selector) =>
      appartEl.querySelector(selector)?.innerText || "";
    const getImageSrc = (el) => el?.getAttribute("src") || "";

    document.querySelector("[data-number]").innerText =
      getText(".appart-number");
    document.querySelector("[data-pieces]").innerText =
      getText(".appart-pieces");
    document.querySelector("[data-surface]").innerText =
      getText(".appart-surface");
    document.querySelector("[data-balcon]").innerText =
      getText(".appart-balcon");
    document.querySelector("[data-disponibilite]").innerText = getText(
      ".appart-disponibilite"
    );

    const visite360 = getText(".appart-visite360");
    if (visite360) {
      document
        .querySelector("[data-visite360]")
        ?.setAttribute("href", visite360);
    }

    if (levelImage) {
      const imgSrc = getImageSrc(levelImage);
      if (imgSrc) {
        document.querySelector(".popup--plan-3d")?.setAttribute("src", imgSrc);
      }
    }
  }
});
